/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import KeywordDragDrop from "../../components/Conjunction/DragDrop";
import Header from "../../components/HomePage/Header";
import { fetchPlayMinigames } from "../../services/authService";
import EditConjunction from "../Teacher/Template/EditConjunction";
import { baseImageUrl } from "../../config/base";
import { toast } from "react-toastify";
import Conjunction from "../Teacher/RawMinigameInfo/Conjunction";

const ConjunctionReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [activityName, setActivityName] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [meanings, setMeanings] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [dropped, setDropped] = useState<{ [index: number]: string | null }>({});
  const [duration, setDuration] = useState<number>(0);
  const [initialDuration, setInitialDuration] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDrop = (targetIndex: number, keyword: string) => {
    if (!isTimeUp && !isPaused) {
      setDropped((prev) => ({ ...prev, [targetIndex]: keyword }));
    }
  };

  const normalizeUrl = (base: string, path: string): string => {
    return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  };

  const loadMinigame = async () => {
    if (!minigameId) return;

    try {
      const result = await fetchPlayMinigames(minigameId);
      setActivityName(result.minigameName || "");
      setDuration(result.duration || 0);
      setInitialDuration(result.duration || 0);

      const thumbnailUrl = result.thumbnailImage ? normalizeUrl(baseImageUrl, result.thumbnailImage) : null;
      setThumbnail(thumbnailUrl);

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
      toast.error("Failed to load minigame.");
    }
  };

  useEffect(() => {
    loadMinigame();
  }, [minigameId]);

  const calculateScore = () => {
    let correct = 0;
    meanings.forEach((meaning, index) => {
      console.log(meaning)
      if (dropped[index] === keywords[index]) correct++;
    });
    setScore(correct);
    setShowResult(true);
  };

  const finishEarly = useCallback(() => {
    setIsTimeUp(true);
    calculateScore();
  }, [calculateScore]);

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

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getTimeProgress = (): number => {
    if (initialDuration === 0) return 100;
    return (duration / initialDuration) * 100;
  };

  const getTimeColor = (): string => {
    const progress = getTimeProgress();
    if (progress > 50) return "text-green-600";
    if (progress > 25) return "text-yellow-600";
    return "text-red-600";
  };

  const tryAgain = () => {
    setDropped({});
    setDuration(0);
    setIsTimeUp(false);
    setIsPaused(false);
    setShowResult(false);
    setScore(0);
    loadMinigame();
  };

  const startGame = () => {
    setIsPlaying(true);
    setIsPaused(true);
  };

  const getScoreColor = (): string => {
    const percentage = (score / keywords.length) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreEmoji = (): string => {
    const percentage = (score / keywords.length) * 100;
    if (percentage === 100) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 60) return "👍";
    return "💪";
  };

  return (
    <>
      <Header />
      {!isPlaying ? (
        <Conjunction onStart={startGame}/>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {thumbnail && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/20 p-1">
                        <img 
                          src={thumbnail} 
                          alt="Activity thumbnail" 
                          className="w-full h-full object-cover rounded-lg" 
                        />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-bold">{activityName}</h1>
                      <p className="text-blue-100">Match terms with their definitions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <EditConjunction
                      initialActivityName={activityName}
                      initialDuration={initialDuration}
                      initialEntries={keywords.map((k, i) => ({
                        Term: k,
                        Definition: meanings[i] || "",
                      }))}
                      initialThumbnailUrl={thumbnail}
                      onSave={(newData) => {
                        setActivityName(newData.activityName);
                        setInitialDuration(newData.duration);
                        setDuration(newData.duration);
                        setKeywords(newData.entries.map((e) => e.Term));
                        setMeanings(newData.entries.map((e) => e.Definition));
                        setThumbnail(newData.thumbnailUrl);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Timer and Controls */}
              <div className="p-6 bg-gray-50 border-t">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Timer */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <div className={`text-xl font-bold ${getTimeColor()}`}>
                          {formatTime(duration)}
                        </div>
                      </div>
                      <svg className="absolute top-0 left-0 w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          fill="none"
                          stroke={getTimeProgress() > 25 ? "#3b82f6" : "#ef4444"}
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 36}`}
                          strokeDashoffset={`${2 * Math.PI * 36 * (1 - getTimeProgress() / 100)}`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold">Time Remaining</div>
                      <div className="text-xs">
                        {Math.round(getTimeProgress())}% left
                      </div>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Object.values(dropped).filter(Boolean).length}
                      </div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {keywords.length}
                      </div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      disabled={isTimeUp}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                        isPaused
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isPaused ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                          </svg>
                          Resume
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"/>
                          </svg>
                          Pause
                        </>
                      )}
                    </button>

                    {!isTimeUp && (
                      <button
                        onClick={finishEarly}
                        className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold transition-all duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Finish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Time Up Alert */}
            {isTimeUp && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-800">Time's Up!</h3>
                  <p className="text-red-600 text-sm">You can no longer interact with this activity.</p>
                </div>
              </div>
            )}

            {/* Game Area */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Match the Keywords</h2>
                <p className="text-gray-600">Drag keywords to their corresponding definitions</p>
              </div>
              
              <KeywordDragDrop
                keywords={keywords}
                targets={meanings}
                onDrop={handleDrop}
                droppedKeywords={dropped}
                disabled={isTimeUp || isPaused}
              />
            </div>

            {/* Results */}
            {showResult && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{getScoreEmoji()}</div>
                      <div>
                        <h3 className="text-2xl font-bold">Game Complete!</h3>
                        <p className="text-green-100">Here are your results</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor()}`}>
                        {score}/{keywords.length}
                      </div>
                      <div className="text-green-100 text-sm">
                        {Math.round((score / keywords.length) * 100)}% Correct
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Detailed Results:</h4>
                  <div className="space-y-3">
                    {meanings.map((meaning, index) => {
                      const isCorrect = dropped[index] === keywords[index];
                      const userAnswer = dropped[index] || "No answer";
                      
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border-2 ${
                            isCorrect
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{meaning}</div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-gray-600">Your answer:</span>
                                <span className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                  {userAnswer}
                                </span>
                              </div>
                              {!isCorrect && (
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Correct answer:</span>
                                  <span className="font-medium text-green-600">{keywords[index]}</span>
                                </div>
                              )}
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCorrect ? "bg-green-100" : "bg-red-100"
                            }`}>
                              {isCorrect ? (
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

            {/* Try Again Button */}
            {isTimeUp && (
              <div className="text-center">
                <button
                  onClick={tryAgain}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConjunctionReview;