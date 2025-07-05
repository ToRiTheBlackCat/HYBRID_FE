import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  fetchPlayMinigames,
  submitAccomplishment,
  fetchCourseMinigame,
} from "../../../services/authService";
import Header from "../../../components/HomePage/Header";
import { Accomplishment, Minigame } from "../../../types";
import { toast } from "react-toastify";
import { baseImageUrl } from "../../../config/base";
import { getLocalISOTime } from "../../../services/userService";

/* ───────── helpers ───────── */
type QuestionParsed = {
  modifiedSentence: string;
  options: string[];
  correctIndex: number;
};

function parseDataText(xml: string): QuestionParsed[] {
  const dom = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(dom.getElementsByTagName("question")).map((q) => ({
    modifiedSentence: q.getElementsByTagName("sentence")[0]?.textContent ?? "",
    options: Array.from(q.getElementsByTagName("options")).map((o) => o.textContent ?? ""),
    correctIndex: (parseInt(q.getElementsByTagName("answers")[0]?.textContent ?? "1", 10) || 1) - 1,
  }));
}

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
const PlayCompletion: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;

  /* ───────── state ───────── */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityName, setActivityName] = useState("");
  const [questions, setQuestions] = useState<QuestionParsed[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [paused, setPaused] = useState(true);
  const [duration, setDuration] = useState<number>(0);
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);

  /* ───────── effects ───────── */
  // Load minigame data
  useEffect(() => {
    if (!minigameId) {
      setError("Không tìm thấy minigameId trên URL");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await fetchPlayMinigames(minigameId);
        setActivityName(data.minigameName ?? "");
        const parsed = parseDataText(data.dataText ?? "");
        setQuestions(parsed);
        setAnswers(new Array(parsed.length).fill(-1));
        const d = Number(data.duration) || 120;
        setTimeLeft(d);
        setDuration(d);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("Không thể tải dữ liệu minigame.");
      } finally {
        setLoading(false);
      }
    })();
  }, [minigameId]);

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
  const handleAnswer = (optIdx: number) => {
    if (paused || submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optIdx;
      return next;
    });
  };

  const handleSubmit = useCallback(async () => {
    if (submitted || !minigameId) return;
    const pts = answers.reduce((acc, a, i) => acc + (a === questions[i].correctIndex ? 1 : 0), 0);
    setScore(pts);
    setSubmitted(true);

    const percent = Math.round((pts / questions.length) * 100);
    const durationUsed = duration - timeLeft;

    const payload: Accomplishment = {
      MinigameId: minigameId,
      Percent: percent,
      DurationInSeconds: durationUsed,
      TakenDate: getLocalISOTime(),
    } as unknown as Accomplishment;

    try {
      await submitAccomplishment(payload);
      toast.success(`✅ Result submitted. You got ${percent}%`);
    } catch (e) {
      console.error("submitAccomplishment error", e);
    }
  }, [submitted, answers, questions, minigameId, timeLeft, duration]);

  // Countdown timer
  useEffect(() => {
    if (loading || submitted || paused) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [loading, submitted, paused, handleSubmit]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const progressPercentage = ((current + 1) / questions.length) * 100;

  /* ───────── early returns ───────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">Đang tải minigame...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-xl hover:bg-red-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  /* ───────── submitted view ───────── */
  if (submitted && score !== null) {
    const percentage = Math.round((score / questions.length) * 100);
    const isExcellent = percentage >= 80;
    const isGood = percentage >= 60;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isExcellent ? 'bg-green-100' : isGood ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <svg className={`w-10 h-10 ${
              isExcellent ? 'text-green-500' : isGood ? 'text-yellow-500' : 'text-red-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isExcellent ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isExcellent ? 'Xuất sắc!' : isGood ? 'Tốt lắm!' : 'Hãy cố gắng hơn!'}
          </h2>
          
          <p className="text-gray-600 mb-6">Kết quả của bạn</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {score} / {questions.length}
            </div>
            <div className={`text-2xl font-semibold ${
              isExcellent ? 'text-green-600' : isGood ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {percentage}%
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Quay lại
            </button>
            <button
              onClick={() => navigate(0)}
              className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              Chơi lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────── playing view ───────── */
  const q = questions[current];
  const timeWarning = timeLeft <= 60; // Warning when less than 1 minute

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 relative mt-20">
        {/* ───────── Aside: other minigames ───────── */}
        {courseMinigames.length > 0 && (
          <aside className="fixed top-24 right-4 w-72 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-[calc(100vh-120px)] z-10">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
              <h3 className="font-bold text-lg">Các trò chơi khác</h3>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
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
                    className={`w-full flex items-center gap-3 text-left p-4 transition-all duration-200 ${
                      isActive 
                        ? "bg-blue-50 border-r-4 border-blue-500" 
                        : "hover:bg-gray-50"
                    }`}
                    disabled={isActive}
                  >
                    <div className="relative">
                      <img
                        src={normalize(baseImageUrl, mg.thumbnailImage)}
                        alt={mg.minigameName}
                        className="w-12 h-12 object-cover rounded-xl"
                      />
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm leading-tight mb-1 ${
                        isActive ? "text-blue-700" : "text-gray-800"
                      }`}>
                        {mg.minigameName}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {mg.templateName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* ───────── Main content ───────── */}
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">{activityName}</h1>
                <div className={`font-mono text-lg px-4 py-2 rounded-xl ${
                  timeWarning ? 'bg-red-500 animate-pulse' : 'bg-black/20'
                }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-2">
                  <span>Câu {current + 1} / {questions.length}</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question content */}
            <div className="p-6 space-y-6">
              {/* Question sentence */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
                <div className="text-lg leading-relaxed text-gray-800">
                  {q.modifiedSentence.split("___").map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="inline-block bg-yellow-300 text-yellow-800 px-3 py-1 rounded-lg mx-1 font-medium">
                          ___
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`p-4 rounded-xl text-left transition-all duration-200 font-medium ${
                      answers[current] === idx
                        ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg transform scale-105"
                        : "bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200"
                    }`}
                    disabled={paused}
                  >
                    <div className="flex items-center">
                      <span className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center text-sm font-bold ${
                        answers[current] === idx ? 'bg-white text-green-500' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {word}
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Câu trước
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, questions.length) }).map((_, i) => {
                    const questionIndex = current - 2 + i;
                    if (questionIndex < 0 || questionIndex >= questions.length) return null;
                    return (
                      <button
                        key={questionIndex}
                        onClick={() => setCurrent(questionIndex)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          questionIndex === current
                            ? "bg-blue-500 text-white"
                            : answers[questionIndex] !== -1
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {questionIndex + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                  disabled={current === questions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Câu sau
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Footer actions */}
            <div className="bg-gray-50 p-6 flex justify-between items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Thoát
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setPaused((p) => !p)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-colors font-medium ${
                    paused 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "bg-yellow-400 hover:bg-yellow-500 text-gray-800"
                  }`}
                >
                  {paused ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9 4h10a1 1 0 001-1V7a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1z" />
                      </svg>
                      Tiếp tục
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Tạm dừng
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={answers.includes(-1) || paused}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayCompletion;