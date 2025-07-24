import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchCourseMinigame, fetchPlayMinigames, submitAccomplishment } from "../../../services/authService";
import { Pause, Play, Clock, Check, X, RotateCcw, GamepadIcon, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "../../../components/HomePage/Header";
import { Accomplishment, Minigame } from "../../../types";
import { toast } from "react-toastify";
import { baseImageUrl } from "../../../config/base";
import { getLocalISOTime } from "../../../services/userService";

interface QuestionAnswer {
  question: string;
  answer: "True" | "False";
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

const PlayTrueFalse: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();

  /* ───── state cho phần chơi ───── */
  const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [duration, setDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);

  /* ───── state bổ sung ───── */
  const [activityName, setActivityName] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ───── load dữ liệu minigame ───── */
  useEffect(() => {
    if (!minigameId) return;

    (async () => {
      const data = await fetchPlayMinigames(minigameId);
      if (!data) return;

      setActivityName(data.minigameName);
      const parsedXML = parseQuestions(data.dataText);
      setQuestions(parsedXML);
      setUserAnswers(Array(parsedXML.length).fill(null));
      setDuration(data.duration);
      setTimeLeft(data.duration);
    })();
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

  /* ───── Timer ───── */
  useEffect(() => {
    if (paused || timeLeft <= 0) return;
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, timeLeft > 0]);

  /* ───── helpers ───── */
  const parseQuestions = (xml: string): QuestionAnswer[] => {
    const doc = new DOMParser().parseFromString(xml, "application/xml");
    const nodes = Array.from(doc.getElementsByTagName("question"));
    return nodes.map(q => ({
      question: q.getElementsByTagName("statement")[0].textContent || "",
      answer: q.getElementsByTagName("answer")[0].textContent?.toLowerCase() === "true" ? "True" : "False",
    }));
  };

  const handleAnswer = (val: "True" | "False") => {
    if (paused) return;
    setUserAnswers(prev => prev.map((a, i) => i === currentIndex ? val : a));
  };

  const goToIndex = (idx: number) => {
    if (paused  || idx < 0 || idx >= questions.length) return;
    setCurrentIndex(idx);
  };

  const handleTryAgain = () => {
    setUserAnswers(Array(questions.length).fill(null));
    setCurrentIndex(0);
    setTimeLeft(duration);
    setPaused(false);
  };

  const handleSubmit = async () => {
    setPaused(true);
    const correct = questions.reduce(
      (c, q, i) => c + (userAnswers[i] === q.answer ? 1 : 0),
      0
    );
    const percent = Math.round((correct / questions.length) * 100);
    const durationUsed = duration - timeLeft;

    const payload: Accomplishment = {
      MinigameId: minigameId ?? "",
      Percent: percent,
      DurationInSecond: durationUsed,
      TakenDate: getLocalISOTime(),
    } as unknown as Accomplishment;

    const res = await submitAccomplishment(payload);
    if (res) {
      toast.success(`Submit successfully! You got ${correct}/${questions.length}.`);
    } else {
      toast.error("Lưu điểm thất bại, vui lòng thử lại.");
    }
  };

  const currentQA = questions[currentIndex];
  const selectedAnswer = userAnswers[currentIndex];
  const answeredCount = userAnswers.filter(a => a !== null).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time warning color
  const getTimeColor = () => {
    if (timeLeft <= 30) return 'text-red-500';
    if (timeLeft <= 60) return 'text-orange-500';
    return 'text-green-600';
  };

  /* ───── render ───── */
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative mt-20">
        
        {/* Sidebar Toggle Button */}
        {courseMinigames.length > 0 && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-24 right-4 z-50 bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg border border-gray-200 transition-all"
          >
            <GamepadIcon size={20} className="text-gray-600" />
          </button>
        )}

        {/* Enhanced Sidebar */}
        {courseMinigames.length > 0 && (
          <aside className={`fixed top-24 right-4 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-40 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <GamepadIcon size={18} />
                  Other Games
                </h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">{courseMinigames.length} games available</p>
            </div>
            
            <div className="overflow-auto max-h-[70vh] p-2">
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
                    className={`w-full flex items-center gap-3 text-left p-3 rounded-xl text-sm transition-all hover:bg-gray-50 ${
                      isActive ? "bg-blue-50 border-2 border-blue-200" : "border-2 border-transparent"
                    }`}
                    disabled={isActive}
                  >
                    <img
                      src={normalize(baseImageUrl, mg.thumbnailImage)}
                      alt={mg.minigameName}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">{mg.minigameName}</div>
                      <div className="text-xs text-gray-500 truncate">{mg.templateName}</div>
                      {isActive && (
                        <div className="text-xs text-blue-600 font-medium mt-1">Currently Playing</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                
                {/* Activity Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Check size={32} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">{activityName}</h1>
                    <p className="text-gray-600 text-sm">True/False Quiz Challenge</p>
                  </div>
                </div>

                {/* Timer and Controls */}
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border ${getTimeColor()}`}>
                    <Clock size={18} />
                    <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
                  </div>
                  <button
                    onClick={() => setPaused(p => !p)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      paused 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {paused ? <Play size={18} /> : <Pause size={18} />}
                    {paused ? "Play" : "Pause"}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress: {answeredCount}/{questions.length} questions</span>
                  <span>{Math.round(progressPercentage)}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Main Quiz Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              
              {/* Question Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-blue-100 font-medium">Question {currentIndex + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToIndex(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {currentIndex + 1} / {questions.length}
                    </span>
                    <button
                      onClick={() => goToIndex(currentIndex + 1)}
                      disabled={currentIndex === questions.length - 1}
                      className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold leading-relaxed">
                  {currentQA?.question}
                </h2>
              </div>

              {/* Answer Section */}
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
                  
                  {/* True Button */}
                  <button
                    onClick={() => handleAnswer("True")}
                    disabled={paused}
                    className={`group relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 ${
                      selectedAnswer === "True"
                        ? "border-green-500 bg-green-50 shadow-lg scale-105"
                        : "border-green-200 bg-green-50/50 hover:bg-green-50 hover:border-green-300 hover:scale-102"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className={`p-2 rounded-full transition-colors ${
                        selectedAnswer === "True" ? "bg-green-500 text-white" : "bg-green-200 text-green-700"
                      }`}>
                        <Check size={20} />
                      </div>
                      <span className="text-xl font-bold text-green-800">True</span>
                    </div>
                    {selectedAnswer === "True" && (
                      <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
                    )}
                  </button>

                  {/* False Button */}
                  <button
                    onClick={() => handleAnswer("False")}
                    disabled={paused}
                    className={`group relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 ${
                      selectedAnswer === "False"
                        ? "border-red-500 bg-red-50 shadow-lg scale-105"
                        : "border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-300 hover:scale-102"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className={`p-2 rounded-full transition-colors ${
                        selectedAnswer === "False" ? "bg-red-500 text-white" : "bg-red-200 text-red-700"
                      }`}>
                        <X size={20} />
                      </div>
                      <span className="text-xl font-bold text-red-800">False</span>
                    </div>
                    {selectedAnswer === "False" && (
                      <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                    )}
                  </button>
                </div>

                {/* Answer Status */}
                {selectedAnswer && (
                  <div className="mt-6 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      selectedAnswer === "True" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {selectedAnswer === "True" ? <Check size={16} /> : <X size={16} />}
                      You answered: {selectedAnswer}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={handleTryAgain}
                disabled={paused}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all hover:scale-105"
              >
                <RotateCcw size={18} />
                Try Again
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={paused}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
              >
                <Check size={18} />
                Submit Quiz
              </button>
            </div>

            {/* Question Navigation Pills */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Navigation</h3>
              <div className="flex flex-wrap gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToIndex(idx)}
                    className={`w-10 h-10 rounded-full font-medium transition-all ${
                      idx === currentIndex
                        ? "bg-blue-500 text-white shadow-lg"
                        : userAnswers[idx] !== null
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayTrueFalse;