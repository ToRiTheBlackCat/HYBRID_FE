import React, { useEffect, useState, useRef } from "react";
import { fetchPlayMinigames, submitAccomplishment, fetchCourseMinigame } from "../.././../services/authService";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/HomePage/Header";
import { Accomplishment, Minigame } from "../../../types";
import { baseImageUrl } from "../../../config/base";
import { toast } from "react-toastify";
import { getLocalISOTime } from "../../../services/userService";
import { motion, AnimatePresence } from "framer-motion";


interface ParsedQuestion {
  text: string;
  answer: string[];
  correctIndex: number;
}

const normalize = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}?t=${Date.now()}`;

const PAGE_SIZE = 50;

// Map templateId → route segment; keep in sync with router
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

const PlayQuiz: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();

  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // Khởi tạo bằng 0, sẽ được cập nhật trong loadData
  const [paused, setPaused] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialDurationRef = useRef<number>(0);
  const [showSidebar, setShowSidebar] = useState(true);



  const loadData = async () => {
    try {
      const res = await fetchPlayMinigames(minigameId!);
      const parsed = parseXMLData(res.dataText);
      initialDurationRef.current = res.duration || 60;
      setTimeLeft(res.duration); // Đồng bộ timeLeft với duration
      setQuestions(parsed);
      setSelectedIndexes(Array(parsed.length).fill(null));
    } catch (err) {
      console.error("Failed to load quiz:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [minigameId]);

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

  useEffect(() => {
    if (paused || showResult || timeLeft === 0) return; // Không chạy timer nếu chưa có duration

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [paused, showResult, timeLeft]);

  const parseXMLData = (xmlString: string): ParsedQuestion[] => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    const questionNodes = Array.from(xml.querySelectorAll("question"));

    return questionNodes.map((node) => {
      const text = node.querySelector("header")?.textContent?.trim() || "";
      const options = Array.from(node.querySelectorAll("options")).map((el) =>
        el.textContent?.trim() || ""
      );
      const correctIndex =
        parseInt(node.querySelector("answers")?.textContent?.trim() || "1") - 1;
      return { text, answer: options, correctIndex };
    });
  };

  const handleSelectAnswer = (index: number) => {
    if (paused || showResult) return;
    const updated = [...selectedIndexes];
    updated[currentIndex] = index;
    setSelectedIndexes(updated);
  };
  const sendResult = async (correctCnt: number) => {
    if (!minigameId) return;
    const percent = Math.round((correctCnt / questions.length) * 100);
    const used = initialDurationRef.current - timeLeft;

    const payload: Accomplishment = {
      MinigameId: minigameId,
      Percent: percent,
      DurationInSecond: used < 0 ? 0 : used,
      TakenDate: getLocalISOTime(),
    } as unknown as Accomplishment;
    const result = await submitAccomplishment(payload);
    if (result) {
      toast.success(`Submit successfully. You got ${percent} points`);
    }
  };

  const handleFinish = () => {
    if (paused) return;
    const correct = questions.reduce((cnt, q, i) => {
      return cnt + (selectedIndexes[i] === q.correctIndex ? 1 : 0);
    }, 0);
    setScore(correct);
    setShowResult(true);
    clearInterval(timerRef.current!);
    sendResult(correct)
  };

  const handleTryAgain = () => {
    setSelectedIndexes(Array(questions.length).fill(null));
    setCurrentIndex(0);
    setShowResult(false);
    setScore(0);
    setTimeLeft(initialDurationRef.current); // Đặt lại timeLeft bằng duration
    setPaused(false);
  };

  const togglePause = () => setPaused((prev) => !prev);

  if (!questions.length) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">Loading questions...</p>
      </div>
    </div>
  );

  const currentQuestion = questions[currentIndex];
  const selected = selectedIndexes[currentIndex];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-8">
        <div className="max-w-5xl mx-auto px-4 relative">
          {/* Toggle Sidebar Button */}
          <motion.button
            onClick={() => setShowSidebar(!showSidebar)}
            className="fixed top-28 right-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-3 shadow-xl transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {showSidebar ? "❌" : "📂"}
          </motion.button>

          {/* Sidebar: Other games */}
          <AnimatePresence>
            {showSidebar && courseMinigames.length > 0 && (
              <motion.aside
                key="sidebar"
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-24 right-4 w-80 bg-white/90 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl overflow-hidden max-h-[80vh] z-40"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                  <h3 className="font-bold text-lg text-center">🎮 Other Games</h3>
                </div>
                <div className="p-3 space-y-2 overflow-y-auto max-h-[70vh]">
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
                        className={`w-full flex items-center gap-3 text-left p-3 rounded-2xl transition-all transform hover:scale-105 ${isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                            : "bg-white/80 hover:bg-white shadow-md hover:shadow-lg"
                          }`}
                        disabled={isActive}
                      >
                        <img
                          src={normalize(baseImageUrl, mg.thumbnailImage)}
                          alt={mg.minigameName}
                          className="w-12 h-12 object-cover rounded-xl shadow-md"
                        />
                        <div className="flex flex-col flex-1">
                          <span className="truncate font-semibold text-sm">{mg.minigameName}</span>
                          <span className={`text-xs ${isActive ? "text-blue-100" : "text-gray-500"}`}>
                            {mg.templateName}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>


          {/* Main Quiz Container */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Timer and Pause Header */}
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 p-6">
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                  <div className="text-2xl font-bold">⏱ Time Left: {timeLeft}s</div>
                </div>
                <button
                  onClick={togglePause}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 shadow-lg font-semibold transition-all transform hover:scale-105"
                >
                  {paused ? "▶️ Play" : "⏸️ Pause"}
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Question Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Question Progress</span>
                  <span className="text-sm font-bold text-blue-600">{currentIndex + 1} of {questions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Text */}
              <div className="relative mb-8">
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-1 shadow-xl">
                  <div className="bg-white rounded-3xl p-8 min-h-[120px] flex items-center justify-center">
                    <div className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
                      {currentQuestion.text}
                    </div>
                  </div>
                </div>
                {/* Question Number Badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                  {currentIndex + 1}
                </div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {currentQuestion.answer.map((answer, index) => {
                  const isSelected = selected === index;
                  const isCorrect = index === currentQuestion.correctIndex;
                  const showColor =
                    showResult && isSelected
                      ? isCorrect
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200"
                        : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-200"
                      : isSelected
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200"
                        : "bg-white/80 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-blue-300";

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={showResult || paused}
                      className={`p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${showColor} shadow-lg font-semibold text-lg min-h-[80px] flex items-center justify-center text-center disabled:cursor-not-allowed`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-sm font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {answer}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation & Score */}
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6">
                <button
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  disabled={currentIndex === 0 || paused}
                  className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold transition-all transform hover:scale-105"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-2">
                  {/* Progress dots */}
                  <div className="flex gap-1">
                    {questions.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex
                            ? 'bg-blue-500 scale-125'
                            : selectedIndexes[idx] !== null
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {showResult && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          🎉 Score: {score}/{questions.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          ({Math.round((score / questions.length) * 100)}%)
                        </div>
                      </div>
                    </div>
                  )}
                  {!showResult && (
                    <button
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                      disabled={currentIndex === questions.length - 1 || paused}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold transition-all transform hover:scale-105"
                    >
                      Next →
                    </button>
                  )}
                </div>

                
              </div>

              {/* Finish + Try Again */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleFinish}
                  disabled={paused}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-semibold text-lg transition-all transform hover:scale-105"
                >
                  ✅ Finish Quiz
                </button>
                {showResult && (
                  <button
                    onClick={handleTryAgain}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 shadow-lg font-semibold text-lg transition-all transform hover:scale-105"
                  >
                    🔄 Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default PlayQuiz