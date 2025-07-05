import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/HomePage/Header";
import KeywordDragDrop from "../../../components/Anagram/DragDrop";
import {
  fetchPlayMinigames,
  submitAccomplishment,
  fetchCourseMinigame,
} from "../../../services/authService";
import { Accomplishment, Minigame } from "../../../types";
import { baseImageUrl } from "../../../config/base";
import { toast } from "react-toastify";
import { getLocalISOTime } from "../../../services/userService";

/* ───────── helpers ───────── */
const shuffleArray = (array: string[]) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const parseXmlWords = (xml: string): string[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");
  const wordElements = xmlDoc.getElementsByTagName("word");
  const words: string[] = [];
  for (let i = 0; i < wordElements.length; i++) {
    words.push(wordElements[i].textContent?.toUpperCase() || "");
  }
  return words;
};

const normalize = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}?t=${Date.now()}`;

const PAGE_SIZE = 50;

// Map templateId → route segment, must keep in sync with router definitions
const paths: Record<string, string> = {
  TP1: "conjunction",
  TP2: "quiz",
  TP3: "anagram",
  TP4: "random-card",
  TP5: "spelling",
  TP6: "flashcard",
  TP7: "completion",
  TP8: "pairing",
  TP9: "restoration",
  TP10: "find-word",
  TP11: "true-false",
  TP12: "crossword",
};

/* ───────── component ───────── */
const PlayAnagram: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;

  /* ───────── state ───────── */
  const [words, setWords] = useState<string[]>([]);
  const [duration, setDuration] = useState(60);
  const [timer, setTimer] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [droppedLetters, setDroppedLetters] = useState<{ [index: number]: string | null }>({});
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [finished, setFinished] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);

  /* ───────── effects ───────── */
  // Load game data
  useEffect(() => {
    if (!minigameId) return;
    fetchPlayMinigames(minigameId).then((res) => {
      const parsedWords = parseXmlWords(res.dataText);
      console.log("🔤 Parsed Words:", parsedWords);

      setWords(parsedWords);
      setDuration(res.duration || 60);
      setTimer(res.duration || 60);
      setFinished(false);
      setIsPaused(false);
      setCurrentIndex(0);
      setCorrectCount(0);
    });
  }, [minigameId]);

  // Shuffle letters whenever we switch to a new word
  useEffect(() => {
    if (words.length && currentIndex < words.length) {
      const cur = words[currentIndex];
      setShuffledLetters(shuffleArray(cur.split("")));
      setDroppedLetters(
        Object.fromEntries(Array(cur.length).fill(null).map((_, idx) => [idx, null]))
      );
      setFeedback(null);
    }
  }, [words, currentIndex]);

  // Countdown timer
  useEffect(() => {
    if (!isPaused && timer > 0 && !finished) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0 && !finished) {
      handleFinish();
    }
  }, [isPaused, timer, finished]);

  // Load list of course minigames for the sidebar
  useEffect(() => {
    if (!courseIdFromState) return;
    const load = async () => {
      try {
        const res = await fetchCourseMinigame(courseIdFromState, {
          PageNum: 1,
          PageSize: PAGE_SIZE,
        });
        setCourseMinigames(res?.minigames ?? []);
      } catch (err) {
        console.error("Error loading course minigames", err);
      }
    };
    load();
  }, [courseIdFromState]);

  /* ───────── handlers ───────── */
  const handleDrop = (targetIndex: number, keyword: string) => {
    const updated = { ...droppedLetters, [targetIndex]: keyword };
    setDroppedLetters(updated);
    console.log("✅ droppedLetters:", updated);

    const assembled = Object.values(updated).join("");
    const currentWord = words[currentIndex];

    if (assembled.length === currentWord.length) {
      if (assembled === currentWord) {
        if (feedback !== "correct") setCorrectCount((p) => p + 1);
        setFeedback("correct");
      } else {
        setFeedback("incorrect");
      }
    } else {
      setFeedback(null);
    }
  };

  const handleNext = () => currentIndex < words.length - 1 && setCurrentIndex((i) => i + 1);
  const handlePrev = () => currentIndex > 0 && setCurrentIndex((i) => i - 1);

  const handleFinish = async () => {
    if (finished) return;
    setFinished(true);
    setIsPaused(true);

    const percent = Math.round((correctCount / words.length) * 100);
    const durationUsed = duration - timer;

    const payload: Accomplishment = {
      MinigameId: minigameId ?? "",
      Percent: percent,
      DurationInSeconds: durationUsed,
      TakenDate: getLocalISOTime(),
    } as unknown as Accomplishment;

    try {
      await submitAccomplishment(payload);
      toast.success(`✅ Result submitted: ${percent}%`);
    } catch (e) {
      toast.error("❌ Failed to submit result");
      console.error(e);
    }
  };

  const handleRetry = () => {
    setDroppedLetters({});
    setCurrentIndex(0);
    setFinished(false);
    setTimer(duration);
    setIsPaused(false);
    setResetCounter((c) => c + 1);
    setFeedback(null);
  };

  const togglePause = () => setIsPaused((p) => !p);

  /* ───────── computed ───────── */
  const currentWord = words[currentIndex] || "";
  const progress = Math.round(((currentIndex + 1) / words.length) * 100);
  const timerProgress = Math.round((timer / duration) * 100);
  const isTimeRunningOut = timer <= 10 && timer > 0;

  /* ───────── render ───────── */
  if (words.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md mx-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Đang tải trò chơi...</h3>
            <p className="text-gray-600">Không tìm thấy từ cho hoạt động này.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative mt-15">
        
        {/* ───────── Sidebar: Other Minigames ───────── */}
        {courseMinigames.length > 0 && (
          <aside className="fixed top-20 right-4 w-72 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden max-h-[85vh] z-20">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                🎮 <span>Các trò chơi khác</span>
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-2">
              {courseMinigames.map((mg) => {
                const isActive = mg.minigameId === minigameId;
                const path = paths[mg.templateId];
                return (
                  <button
                    key={mg.minigameId}
                    onClick={() =>
                      navigate(`/student/${path}/${mg.minigameId}`, {
                        state: { courseId: courseIdFromState },
                      })
                    }
                    className={`w-full flex items-center gap-3 text-left p-3 m-1 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                      isActive 
                        ? "bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-300 shadow-md" 
                        : "bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 border border-gray-200"
                    }`}
                    disabled={isActive}
                  >
                    <div className="relative">
                      <img
                        src={normalize(baseImageUrl, mg.thumbnailImage)}
                        alt={mg.minigameName}
                        className="w-12 h-12 object-cover rounded-lg shadow-sm"
                      />
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm line-clamp-2 ${isActive ? 'text-indigo-800' : 'text-gray-800'}`}>
                        {mg.minigameName}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1 mt-1">{mg.templateName}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* ───────── Main Game Area ───────── */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          
          {/* ───────── Top Stats Bar ───────── */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Timer */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isTimeRunningOut ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
                }`}>
                  <svg className={`w-6 h-6 ${isTimeRunningOut ? 'text-red-600' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Thời gian còn lại</div>
                  <div className={`text-2xl font-bold ${isTimeRunningOut ? 'text-red-600' : 'text-gray-800'}`}>
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isTimeRunningOut ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${timerProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="text-2xl font-bold text-gray-800">{currentIndex + 1}/{words.length}</div>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Điểm số</div>
                  <div className="text-2xl font-bold text-gray-800">{correctCount}/{words.length}</div>
                  <div className="text-sm text-purple-600 font-medium">
                    {Math.round((correctCount / words.length) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center mt-6">
              <button
                onClick={togglePause}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isPaused
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
                }`}
              >
                {isPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng'}
              </button>
            </div>
          </div>

          {/* ───────── Main Game Card ───────── */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden">
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-30 transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full opacity-30 transform -translate-x-24 translate-y-24"></div>

            {/* Word Display */}
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-sm font-medium text-gray-600 mb-4 uppercase tracking-wider">Sắp xếp các chữ cái để tạo thành từ:</h2>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg">
                {currentWord.split("").map((letter, idx) => (
                  <span key={idx} className="text-2xl font-bold font-mono bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                    {letter}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Slots */}
            <div className="flex justify-center gap-3 mb-8 relative z-10">
              {currentWord.split("").map((_, idx) => (
                <div
                  key={idx}
                  className={`w-14 h-14 rounded-xl border-3 flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-300 ${
                    droppedLetters[idx] 
                      ? 'border-green-400 bg-green-50 text-green-700 scale-105' 
                      : 'border-gray-300 bg-white text-gray-400 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  {droppedLetters[idx] || ""}
                </div>
              ))}
            </div>

            {/* Drag and Drop Component */}
            <div className="mb-8 relative z-10">
              <KeywordDragDrop
                keywords={shuffledLetters}
                targets={currentWord.split("")}
                droppedKeywords={droppedLetters}
                onDrop={handleDrop}
                direction="horizontal"
                paused={isPaused}
                resetTrigger={resetCounter}
              />
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`text-center mb-8 relative z-10 animate-bounce ${
                feedback === "correct" ? "text-green-600" : "text-red-600"
              }`}>
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-lg shadow-lg ${
                  feedback === "correct" 
                    ? "bg-green-100 border-2 border-green-300" 
                    : "bg-red-100 border-2 border-red-300"
                }`}>
                  {feedback === "correct" ? "🎉" : "❌"}
                  <span>{feedback === "correct" ? "Chính xác!" : "Sai rồi!"}</span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-center items-center gap-6 mb-8 relative z-10">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed"
              >
                ←
              </button>
              
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-white/20">
                <span className="text-lg font-bold text-gray-800">{currentIndex + 1}</span>
                <span className="text-gray-500 mx-2">/</span>
                <span className="text-lg font-bold text-gray-800">{words.length}</span>
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === words.length - 1}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 disabled:from-gray-300 disabled:to-gray-300 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 disabled:scale-100 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 relative z-10">
              {!finished ? (
                <button
                  onClick={handleFinish}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  🏁 Hoàn thành
                </button>
              ) : (
                <button
                  onClick={handleRetry}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  🔄 Thử lại
                </button>
              )}
            </div>

            {/* Finish Status */}
            {finished && (
              <div className="text-center mt-6 relative z-10">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 px-6 py-3 rounded-xl">
                  <span className="text-red-600 font-bold">⏰ Hết giờ!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayAnagram;