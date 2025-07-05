import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { FiVolume2, FiPlay, FiPause, FiRefreshCw, FiClock, FiTrendingUp, FiGrid, FiCheck, FiX } from "react-icons/fi";
import { useLocation, useParams, useNavigate } from "react-router-dom";

import Header from "../../../components/HomePage/Header";
import { fetchPlayMinigames, submitAccomplishment, fetchCourseMinigame } from "../../../services/authService";
import { baseImageUrl } from "../../../config/base";
import { Accomplishment, Minigame } from "../../../types";

interface Question {
  word: string;
  imagePath: string;
}

const PAGE_SIZE = 50;

const PlaySpelling: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [curIdx, setCurIdx] = useState(0);
  const [letters, setLetters] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<number>(0);
  const [initialDuration, setInitialDuration] = useState<number>(0);
  const [paused, setPaused] = useState(true);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);

  const [activityName, setActivityName] = useState("");
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);

  const normalize = (base: string, path: string) => `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}?t=${Date.now()}`;
  const speakWord = (w: string) => window.speechSynthesis.speak(new SpeechSynthesisUtterance(w));

  const submitResult = useCallback(async (finalScore: number = score) => {
    if (submitted || !questions.length || !minigameId) return;

    const percent = Math.round((finalScore / questions.length) * 100);
    const durationUsed = initialDuration - remaining;
    const getLocalISOTime = () => {
      const now = new Date();
      const offset = now.getTimezoneOffset(); // in minutes
      const localTime = new Date(now.getTime() - offset * 60 * 1000);
      return localTime.toISOString().slice(0, -1); // remove the 'Z'
    };

    const payload: Accomplishment = {
      MinigameId: minigameId,
      Percent: percent,
      DurationInSeconds: durationUsed,
      TakenDate: getLocalISOTime(),
    } as unknown as Accomplishment;
    console.log(payload);

    try {
      await submitAccomplishment(payload);
      toast.success(`✅ Result submitted: ${percent}%`);
      setSubmitted(true);
    } catch (e) {
      toast.error("❌ Failed to submit result");
      console.error(e);
    }
  }, [submitted, questions.length, score, minigameId, initialDuration, remaining]);

  const initGame = useCallback(async () => {
    if (!minigameId) return;
    setLoading(true);
    try {
      const res = await fetchPlayMinigames(minigameId);
      if (!res) return;

      setActivityName(res.minigameName ?? "Spelling Review");
      setRemaining(res.duration ?? 0);
      setInitialDuration(res.duration ?? 0);

      const xml = new DOMParser().parseFromString(res.dataText, "text/xml");
      const qs: Question[] = Array.from(xml.getElementsByTagName("question")).map(q => ({
        word: q.getElementsByTagName("word")[0]?.textContent?.trim().toUpperCase() ?? "",
        imagePath: q.getElementsByTagName("image")[0]?.textContent?.trim() ?? ""
      }));

      setQuestions(qs);
      setLetters(Array(qs[0]?.word.length || 0).fill(""));
      setCurIdx(0);
      setScore(0);
      setFinished(false);
      setPaused(true);
      setSubmitted(false);
      setLastAnswerCorrect(null);
      setStreak(0);
    } catch (e) {
      toast.error("Failed to load minigame");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [minigameId]);

  useEffect(() => {
    if (!courseIdFromState) return;
    const loadCourseMinigames = async () => {
      try {
        const res = await fetchCourseMinigame(courseIdFromState, { PageNum: 1, PageSize: PAGE_SIZE });
        setCourseMinigames(res?.minigames ?? []);
      } catch (err) {
        console.error("Error loading course minigames", err);
      }
    };
    loadCourseMinigames();
  }, [courseIdFromState]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (paused || remaining <= 0) return;
    const t = setInterval(() => setRemaining(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [paused, remaining]);

  useEffect(() => {
    if (remaining === 0 && !paused && !submitted) {
      setFinished(true);
      submitResult(score);
    }
  }, [remaining, paused, submitted, submitResult, score]);

  const curQ = questions[curIdx];

  const onType = (i: number, v: string) => {
    if (paused || !/^[A-Za-z]?$/.test(v)) return;
    const up = [...letters];
    up[i] = v.toUpperCase();
    setLetters(up);
    if (v && i < letters.length - 1) inputRefs.current[i + 1]?.focus();
  };

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = letters.join("") === curQ.word;
    let nextScore = score;
    let nextStreak = streak;
    
    if (isCorrect) {
      toast.success("🎉 Correct!");
      nextScore += 1;
      nextStreak += 1;
      setScore(nextScore);
      setStreak(nextStreak);
      setLastAnswerCorrect(true);
    } else {
      toast.error("❌ Incorrect!");
      setStreak(0);
      setLastAnswerCorrect(false);
    }

    if (curIdx < questions.length - 1) {
      setCurIdx(curIdx + 1);
      setLetters(Array(questions[curIdx + 1].word.length).fill(""));
    } else {
      setFinished(true);
      setPaused(true);
      toast.success("🎉 Game Finished!");
      submitResult(nextScore);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (remaining === 0) return "text-red-500";
    if (remaining <= 30) return "text-orange-500";
    return "text-green-500";
  };

  const getProgressPercentage = () => {
    return ((curIdx + 1) / questions.length) * 100;
  };

  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your spelling challenge...</p>
          </div>
        </div>
      </>
    );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 mt-20">
        {/* Sidebar Toggle Button */}
        {courseMinigames.length > 0 && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-24 right-4 z-50 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          >
            <FiGrid className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Sidebar */}
        {courseMinigames.length > 0 && (
          <aside className={`fixed top-24 right-4 w-80 bg-white border rounded-xl shadow-xl overflow-hidden max-h-[80vh] transition-transform duration-300 z-40 ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <h3 className="font-bold text-lg">Other Games</h3>
              <p className="text-blue-100 text-sm">{courseMinigames.length} activities available</p>
            </div>
            <div className="overflow-auto max-h-[calc(80vh-80px)]">
              {courseMinigames.map((mg) => {
                const isActive = mg.minigameId === minigameId;
                const path = paths[mg.templateId];
                return (
                  <button
                    key={mg.minigameId}
                    onClick={() => {
                      navigate(`/student/${path}/${mg.minigameId}`, {
                        state: { courseId: courseIdFromState },
                      });
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 text-left p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 ${
                      isActive ? "bg-blue-100 border-l-4 border-l-blue-500" : ""
                    }`}
                    disabled={isActive}
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={normalize(baseImageUrl, mg.thumbnailImage)}
                        alt={mg.minigameName}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm line-clamp-2 ${isActive ? "text-blue-700" : "text-gray-800"}`}>
                        {mg.minigameName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{mg.templateName}</p>
                    </div>
                    {isActive && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            {/* Header Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 text-center">
                <FiClock className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Time Left</p>
                <p className={`text-xl font-bold ${getTimeColor()}`}>
                  {formatTime(remaining)}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 text-center">
                <FiTrendingUp className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm font-medium">Score</p>
                <p className="text-xl font-bold">{score}/{questions.length}</p>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4 text-center">
                <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">🔥</div>
                <p className="text-sm font-medium">Streak</p>
                <p className="text-xl font-bold">{streak}</p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 text-center">
                <div className="w-6 h-6 mx-auto mb-2 flex items-center justify-center">📈</div>
                <p className="text-sm font-medium">Progress</p>
                <p className="text-xl font-bold">{Math.round(getProgressPercentage())}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-gray-800">{activityName}</h2>
                <span className="text-sm font-medium text-gray-600">
                  Question {curIdx + 1} of {questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setPaused(!paused)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  paused 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                }`}
              >
                {paused ? <FiPlay className="w-5 h-5" /> : <FiPause className="w-5 h-5" />}
                {paused ? "Resume" : "Pause"}
              </button>
              
              <button
                onClick={initGame}
                className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
              >
                <FiRefreshCw className="w-5 h-5" />
                Restart
              </button>
            </div>

            {/* Question Image/Audio */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {curQ?.imagePath ? (
                  <div className="relative group">
                    <img
                      src={normalize(baseImageUrl, curQ.imagePath)}
                      alt="Question"
                      className="w-48 h-48 object-cover rounded-2xl shadow-lg"
                    />
                    <div className="absolute bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-2xl"></div>
                  </div>
                ) : (
                  <button
                    onClick={() => speakWord(curQ?.word || "")}
                    className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center text-white hover:from-blue-600 hover:to-purple-700 transition-all group"
                  >
                    <FiVolume2 className="w-16 h-16 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            </div>

            {/* Answer Input */}
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="flex justify-center gap-3 mb-8">
                {letters.map((ch, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    value={ch}
                    onChange={(e) => onType(i, e.target.value)}
                    className={`w-14 h-14 text-center uppercase border-2 text-2xl font-bold rounded-xl transition-all focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                      paused || remaining === 0
                        ? "border-gray-300 bg-gray-100 cursor-not-allowed"
                        : "border-gray-300 bg-white hover:border-blue-400 focus:border-blue-500"
                    }`}
                    maxLength={1}
                    disabled={paused || remaining === 0}
                  />
                ))}
              </div>

              {/* Answer Feedback */}
              {lastAnswerCorrect !== null && (
                <div className={`text-center p-4 rounded-xl ${
                  lastAnswerCorrect 
                    ? "bg-green-100 text-green-800 border border-green-200" 
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}>
                  {lastAnswerCorrect ? (
                    <div className="flex items-center justify-center gap-2">
                      <FiCheck className="w-5 h-5" />
                      <span className="font-semibold">Correct! Well done!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FiX className="w-5 h-5" />
                      <span className="font-semibold">Incorrect. Try the next one!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                disabled={paused || remaining === 0}
              >
                Check Answer
              </button>

              {/* Time's Up Message */}
              {remaining === 0 && (
                <div className="text-center p-6 bg-red-100 text-red-800 rounded-xl border border-red-200">
                  <div className="text-4xl mb-2">⏰</div>
                  <p className="text-xl font-bold">Time's Up!</p>
                  <p className="text-sm">Your final score: {score}/{questions.length}</p>
                </div>
              )}
            </form>

            {/* Final Results */}
            {finished && (
              <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border border-green-200">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h3>
                <p className="text-xl font-semibold text-green-600 mb-2">
                  Final Score: {score} / {questions.length}
                </p>
                <p className="text-lg text-gray-600">
                  {Math.round((score / questions.length) * 100)}% Accuracy
                </p>
                {streak > 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    🔥 Best streak: {streak} in a row!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlaySpelling;