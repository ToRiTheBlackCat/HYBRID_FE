import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../../components/HomePage/Header";
import Footer from "../../../components/HomePage/Footer";
import { fetchPlayMinigames, submitAccomplishment, fetchCourseMinigame } from "../../../services/authService";
import { Accomplishment, Minigame } from "../../../types";
import { baseImageUrl } from '../../../config/base';
import { toast } from "react-toastify";
import { getLocalISOTime } from "../../../services/userService";
import "../../../index.css"

// ─── Types ───────────────────────────────────────────────────────
type Card = { id: number; word: string; isFlipped: boolean; isMatched: boolean };

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

// ─── Helpers ─────────────────────────────────────────────────────
const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const parseWords = (xml: string): string[] =>
  Array.from(new DOMParser().parseFromString(xml, "application/xml").getElementsByTagName("words"))
    .map((w) => w.textContent?.trim() ?? "");


// ─── Component ────────────────────────────────────────────────────
const PlayPairing: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();

  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [paused, setPaused] = useState(true);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const colorClasses = [
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-teal-400 to-teal-600",
      "bg-gradient-to-br from-amber-400 to-amber-600",
      "bg-gradient-to-br from-lime-400 to-lime-600",
      "bg-gradient-to-br from-cyan-400 to-cyan-600",
      "bg-gradient-to-br from-red-400 to-red-600",
      "bg-gradient-to-br from-emerald-400 to-emerald-600",
      "bg-gradient-to-br from-violet-400 to-violet-600",
      "bg-gradient-to-br from-blue-400 to-blue-600",
    ];
  
    const wordColorMap = useMemo(() => {
      const uniqueWords = [...new Set(cards.map((c) => c.word))];
      const map: Record<string, string> = {};
      uniqueWords.forEach((word, idx) => {
        map[word] = colorClasses[idx % colorClasses.length];
      });
      return map;
    }, [cards]);

  useEffect(() => {
    if (!minigameId) return;
    (async () => {
      try {
        const data = await fetchPlayMinigames(minigameId);
        setDuration(Number(data.duration));

        const words = parseWords(data.dataText ?? "");
        const shuffled = shuffle(words.flatMap((w) => [w, w]));
        const initCards = shuffled.map((w, i) => ({
          id: i,
          word: w,
          isFlipped: false,
          isMatched: false,
        }));
        setCards(initCards);
        setRemaining(Number(data.duration));
        setStartTime(new Date());
      } catch {
        setError("Không tải được minigame.");
      } finally {
        setLoading(false);
      }
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

  useEffect(() => {
    if (paused || finished || remaining === null || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((t) => (t && t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [paused, remaining, finished]);

  useEffect(() => {
    if (remaining === 0 && !finished && !loading) {
      setPaused(true);
      setFinished(true);
    }
  }, [remaining, finished, loading]);

  useEffect(() => {
    if (flippedCards.length !== 2) return;
    const [a, b] = flippedCards;
    const isMatch = cards[a].word === cards[b].word;

    if (isMatch) {
      setCards((prev) =>
        prev.map((c) => (flippedCards.includes(c.id) ? { ...c, isMatched: true } : c))
      );
      setMatchedPairs((prev) => [...prev, a, b]);
      setFlippedCards([]);
    } else {
      const timeout = setTimeout(() => {
        setCards((prev) =>
          prev.map((c) => (flippedCards.includes(c.id) ? { ...c, isFlipped: false } : c))
        );
        setFlippedCards([]);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (!finished && cards.length && matchedPairs.length === cards.length) {
      setPaused(true);
      setFinished(true);
    }
  }, [matchedPairs, cards.length, finished]);

  const handleSubmit = useCallback(async () => {
    if (!minigameId || !startTime || submitted) return;

    const durationUsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const correct = matchedPairs.length / 2;
    const total = cards.length / 2;
    const percent = Math.round((correct / total) * 100);

    const payload: Accomplishment = {
      MinigameId: minigameId,
      Percent: percent,
      DurationInSecond: durationUsed,
      TakenDate: getLocalISOTime(),
    } as unknown as Accomplishment;

    try {
      const result = await submitAccomplishment(payload);
      if (result) {
        setSubmitted(true);
        toast.success(`You got ${percent} points`);
      }
    } catch (err) {
      console.error("submitAccomplishment error:", err);
    }
  }, [minigameId, cards.length, matchedPairs.length, startTime, submitted]);

  useEffect(() => {
    if (finished && !submitted) {
      handleSubmit();
    }
  }, [finished, submitted, handleSubmit]);

  const handleCardClick = (id: number) => {
    if (paused || finished || flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c)));
    setFlippedCards((prev) => [...prev, id]);
  };

  const resetGame = () => {
    const reshuffled = shuffle(cards.map((c) => ({ ...c, isFlipped: false, isMatched: false })))
      .map((c, i) => ({ ...c, id: i }));
    setCards(reshuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setRemaining(duration);
    setPaused(false);
    setFinished(false);
    setSubmitted(false);
    setStartTime(new Date());
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const progressPercentage = matchedPairs.length / cards.length * 100;

  if (loading) return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading game...</p>
        </div>
      </div>
      <Footer />
    </>
  );

  if (error) return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-8 mt-20 relative">
        {/* Sidebar Toggle Button */}
        {courseMinigames.length > 0 && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-28 right-4 z-50 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Sidebar */}
        {courseMinigames.length > 0 && (
          <div className={`fixed top-24 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}>
            <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl text-white">Other Games</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto h-full pb-24">
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
                    className={`w-full flex items-center gap-4 text-left p-4 hover:bg-gray-50 transition-colors border-b ${isActive ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                    disabled={isActive}
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={normalize(baseImageUrl, mg.thumbnailImage)}
                        alt={mg.minigameName}
                        className="w-12 h-12 object-cover rounded-lg shadow-md"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{mg.minigameName}</p>
                      <p className="text-sm text-gray-500 truncate">{mg.templateName}</p>
                    </div>
                    {isActive && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Game Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${(remaining ?? 0) <= 10 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-2xl">{formatTime(remaining ?? 0)}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{matchedPairs.length / 2} / {cards.length / 2} pairs</span>
                </div>
              </div>
              <button
                onClick={() => setPaused((p) => !p)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${paused
                    ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-200"
                  }`}
              >
                {paused ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Start Game
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Pause Game
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Game Progress</span>
                <span>{Math.round(progressPercentage)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-8 max-w-4xl">
                {cards.map((card) => {

                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      className="w-32 h-20 cursor-pointer"
                      style={{ perspective: '1000px' }}
                    >
                      <div
                        className="relative w-full h-full transition-transform duration-700"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        {/* Mặt trước – dấu ? */}
                        <div
                          className="absolute inset-0 flex items-center justify-center rounded-2xl text-white text-2xl"
                          style={{
                            backfaceVisibility: 'hidden',
                            background: 'linear-gradient(to right, #a78bfa, #f472b6)',
                          }}
                        >
                          ?
                        </div>

                        {/* Mặt sau – hiện từ (xoay 180 độ) */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center rounded-2xl text-white text-lg font-bold ${wordColorMap[card.word]}`}
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                        >
                          {card.word}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          {finished && (
            <div className="flex justify-center">
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Game Over Modal */}
        {finished && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md mx-4 transform animate-bounce">
              <div className="text-6xl mb-4">
                {matchedPairs.length === cards.length ? '🎉' : '⏰'}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {matchedPairs.length === cards.length ? 'Perfect Match!' : 'Game Over!'}
              </h2>
              <div className="mb-6">
                <p className="text-lg text-gray-600 mb-2">You matched</p>
                <p className="text-4xl font-bold text-blue-600">
                  {matchedPairs.length / 2} / {cards.length / 2}
                </p>
                <p className="text-lg text-gray-600">pairs</p>
                {submitted && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-green-700 font-medium">
                      Score: {Math.round((matchedPairs.length / cards.length) * 100)}%
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={resetGame}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Overlay for sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PlayPairing;