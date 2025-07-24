/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import KeywordDragDrop from "../../../components/Conjunction/DragDrop";
import Header from "../../../components/HomePage/Header";
import {
  fetchPlayMinigames,
  submitAccomplishment,
  fetchCourseMinigame,
} from "../../../services/authService";
import { Accomplishment, Minigame } from "../../../types";
import { baseImageUrl } from "../../../config/base";
import { getLocalISOTime } from "../../../services/userService";

/* ───────── helpers ───────── */
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

/* ───────── component ───────── */
const PlayConjunction: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;

  /* ───────── state ───────── */
  const [activityName, setActivityName] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [meanings, setMeanings] = useState<string[]>([]);
  const [dropped, setDropped] = useState<{ [index: number]: string | null }>({});
  const [duration, setDuration] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);
  const initialDuration = useRef<number>(0);
  const [showSidebar, setShowSidebar] = useState(true);


  /* ───────── data loading ───────── */
  const loadMinigame = async () => {
    if (!minigameId) return;

    try {
      const result = await fetchPlayMinigames(minigameId);
      setActivityName(result.minigameName || "");
      setDuration(result.duration || 0);
      initialDuration.current = result.duration || 0;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(result.dataText, "text/xml");
      const questions = xmlDoc.getElementsByTagName("question");

      const terms: string[] = [];
      const defs: string[] = [];

      for (let i = 0; i < questions.length; i++) {
        const term = questions[i].getElementsByTagName("term")[0]?.textContent || "";
        const def = questions[i].getElementsByTagName("definition")[0]?.textContent || "";
        if (term && def) {
          terms.push(term);
          defs.push(def);
        }
      }

      setKeywords(terms);
      setMeanings(defs);
    } catch (error) {
      console.error("Failed to load minigame:", error);
    }
  };

  useEffect(() => {
    loadMinigame();
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

  /* ───────── logic ───────── */
  const correctAnswersMap = useMemo(() => {
    return keywords.reduce((acc, keyword, index) => {
      acc[index] = keyword;
      return acc;
    }, {} as { [index: number]: string });
  }, [keywords]);

  const calculateScore = useCallback(() => {
    let correct = 0;
    meanings.forEach((_, index) => {
      if (dropped[index] === keywords[index]) correct++;
    });
    setScore(correct);
    setShowResult(true);
    return correct;
  }, [dropped, keywords, meanings]);

  const submitResult = useCallback(
    async (_correctCount: number) => {
      if (!minigameId) return;

      const percent = Math.round((_correctCount / keywords.length) * 100);
      const used = initialDuration.current - duration;

      const payload: Accomplishment = {
        MinigameId: minigameId,
        Percent: percent,
        DurationInSecond: used,
        TakenDate: getLocalISOTime(),
      } as unknown as Accomplishment;

      await submitAccomplishment(payload);
    },
    [duration, keywords.length, minigameId]
  );

  const finishEarly = useCallback(() => {
    setIsTimeUp(true);
    const correct = calculateScore();
    submitResult(correct);
  }, [calculateScore, submitResult]);

  // Countdown timer
  useEffect(() => {
    if (duration <= 0 || isPaused || isTimeUp) return;

    const interval = setInterval(() => {
      setDuration((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishEarly();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, finishEarly, isPaused, isTimeUp]);

  /* ───────── helpers ───────── */
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const tryAgain = () => {
    setDropped({});
    setDuration(initialDuration.current);
    setIsTimeUp(false);
    setIsPaused(false);
    setShowResult(false);
    setScore(0);
  };

  /* ───────── render ───────── */
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 relative mt-10">
        {/* ───────── Enhanced Aside: other minigames ───────── */}
        <button
          onClick={() => setShowSidebar((prev) => !prev)}
          className="fixed top-24 right-6 z-30 bg-white border border-gray-300 shadow-lg rounded-full p-3 hover:bg-gray-100 transition-all"
        >
          {showSidebar ? (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        {showSidebar && courseMinigames.length > 0 && (
          <aside className="fixed top-24 right-6 w-72 bg-white/95 backdrop-blur-md border border-white/50 rounded-2xl shadow-2xl overflow-hidden z-20 max-h-[75vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-lg">Other Activities</h3>
              </div>
              <p className="text-indigo-100 text-sm mt-1">{courseMinigames.length} games available</p>
            </div>

            {/* Games List */}
            <div className="flex-1 overflow-y-auto p-2">
              {courseMinigames.map((mg, index) => {
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
                    className={`w-full flex items-center gap-4 text-left p-4 m-1 rounded-xl transition-all duration-300 hover:scale-[1.02] ${isActive
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 shadow-lg"
                      : "bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                    disabled={isActive}
                  >
                    <div className="relative">
                      <img
                        src={normalize(baseImageUrl, mg.thumbnailImage)}
                        alt={mg.minigameName}
                        className="w-12 h-12 object-cover rounded-xl shadow-sm"
                      />
                      {isActive && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-sm line-clamp-2 ${isActive ? "text-blue-800" : "text-gray-800"
                        }`}>
                        {mg.minigameName}
                      </h4>
                      <p className={`text-xs mt-1 line-clamp-1 ${isActive ? "text-blue-600" : "text-gray-500"
                        }`}>
                        {mg.templateName}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive
                          ? "bg-blue-200 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                          }`}>
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* ───────── Enhanced Main Content ───────── */}
        <div className="max-w-5xl mx-auto pt-8 pb-12">

          {/* ───────── Header Card ───────── */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-6 mb-6">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Activity Review</h1>
                    <p className="text-indigo-100 text-lg">Complete the challenge within the time limit</p>
                  </div>

                  {/* Enhanced Timer Display */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                        <div className="text-xl font-bold text-white">
                          {formatTime(duration)}
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 ${isPaused
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                    >
                      {isPaused ? (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" />
                          </svg>
                          Resume
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z" />
                          </svg>
                          Play
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Activity Name with enhanced styling */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {activityName}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* ───────── Time Up Alert ───────── */}
          {isTimeUp && (
            <div className="bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200 rounded-2xl p-6 flex items-center gap-4 shadow-lg mb-8 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-rose-800 text-xl">⏰ Time's Up!</h3>
                <p className="text-rose-600 text-lg">The activity has ended. You can no longer interact with this challenge.</p>
              </div>
            </div>
          )}

          {/* ───────── Enhanced Game Card ───────── */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-3 rounded-full mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-indigo-800">Interactive Challenge</span>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                Match the Keywords
              </h2>
              <p className="text-gray-600 text-lg">Drag and drop to match terms with their definitions</p>
            </div>

            <KeywordDragDrop
              keywords={keywords}
              targets={meanings}
              correctAnswers={correctAnswersMap}
              showResults={true}
              onDropUpdate={(newDropped) => setDropped(newDropped)}
              onComplete={(isCorrect) => console.log(isCorrect)}
            />
          </div>

          {/* ───────── Enhanced Results Card ───────── */}
          {showResult && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 text-white p-8">
                <div className="flex items-center justify-between flex-wrap gap-6">
                  <div className="flex items-center gap-6">
                    <div className="text-6xl">🎉</div>
                    <div>
                      <h3 className="text-3xl font-bold tracking-tight">Results</h3>
                      <p className="text-emerald-100 text-lg">Here's how you performed!</p>
                    </div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                    <div className="text-5xl font-bold mb-2">
                      {score}/{keywords.length}
                    </div>
                    <div className="text-emerald-100 text-lg font-semibold">
                      {Math.round((score / keywords.length) * 100)}% Correct
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h4 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Detailed Breakdown
                </h4>

                <div className="space-y-4">
                  {meanings.map((meaning, index) => {
                    const isCorrect = dropped[index] === keywords[index];
                    const userAnswer = dropped[index] || "No answer";

                    return (
                      <div
                        key={index}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 ${isCorrect
                          ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50"
                          : "border-rose-200 bg-gradient-to-r from-rose-50 to-red-50"
                          }`}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 text-lg mb-4">{meaning}</div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 font-medium min-w-[80px]">Your answer:</span>
                                <span className={`font-semibold px-4 py-2 rounded-full ${isCorrect
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                                  }`}>
                                  {userAnswer}
                                </span>
                              </div>
                              {!isCorrect && (
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-gray-600 font-medium min-w-[80px]">Correct:</span>
                                  <span className="font-semibold bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full">
                                    {keywords[index]}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${isCorrect
                            ? "bg-gradient-to-r from-emerald-500 to-green-600"
                            : "bg-gradient-to-r from-rose-500 to-red-600"
                            }`}>
                            {isCorrect ? (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ───────── Enhanced Action Buttons ───────── */}
          <div className="flex justify-center gap-6">
            {isTimeUp ? (
              <button
                onClick={tryAgain}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-bold text-lg hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 group"
              >
                <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            ) : (
              <button
                onClick={finishEarly}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg hover:from-emerald-600 hover:to-green-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 group"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Finish Challenge
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PlayConjunction;
