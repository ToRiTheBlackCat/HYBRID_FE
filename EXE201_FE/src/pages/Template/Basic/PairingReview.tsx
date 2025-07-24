import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Header from "../../../components/HomePage/Header";
import Footer from "../../../components/HomePage/Footer";
import { fetchPlayMinigames } from "../../../services/authService";
import EditPairing from "../../Teacher/Template/EditParing";
import { baseImageUrl } from "../../../config/base";
import PairingRaw from "../../Teacher/RawMinigameInfo/Pairing";
import "../../../index.css";

type Card = { id: number; word: string; isFlipped: boolean; isMatched: boolean };

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const parseWords = (xml: string): string[] =>
  Array.from(new DOMParser().parseFromString(xml, "application/xml").getElementsByTagName("words")).map(
    (w) => w.textContent?.trim() ?? ""
  );

const getFullThumbUrl = (url: string): string =>
  url.startsWith("http") ? url : baseImageUrl + url;

const PairingReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);

  const [activityName, setActivityName] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>();

  const [remaining, setRemaining] = useState<number | null>(null);
  const [paused, setPaused] = useState(true);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const originalWords = useMemo(() => [...new Set(cards.map((c) => c.word))], [cards]);

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
        setActivityName(data.minigameName);
        setDuration(Number(data.duration));
        setThumbnailUrl(data.thumbnailImage ?? "");

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
      } catch {
        setError("Không tải được minigame.");
      } finally {
        setLoading(false);
      }
    })();
  }, [minigameId]);

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
  };

  const handleSaveEdit = (data: {
    activityName: string;
    duration: number;
    words: string[];
    thumbnailUrl: string | null;
  }) => {
    setActivityName(data.activityName);
    setDuration(data.duration);
    setThumbnailUrl(data.thumbnailUrl?.replace(baseImageUrl, "") ?? "");

    const deck = shuffle(data.words.flatMap((w) => [w, w]));
    const newCards = deck.map((w, i) => ({
      id: i,
      word: w,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setRemaining(data.duration);
    setPaused(true);
    setFinished(false);
  };

  const handleSubmit = () => {
    setPaused(true);
    setFinished(true);
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
          <p className="text-gray-600 text-lg">Đang tải game...</p>
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
      {!isPlaying ? (
        <PairingRaw onStart={() => setIsPlaying(true)} />
      ) : (
        <>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 py-8 mt-20">
            <div className="max-w-6xl mx-auto">
              {/* Header Section */}
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{activityName}</h1>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${(remaining ?? 0) <= 10 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-xl">{formatTime(remaining ?? 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{matchedPairs.length / 2} / {cards.length / 2} pairs</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
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
                          Play
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Pause
                        </>
                      )}
                    </button>
                    <EditPairing
                      initialActivityName={activityName}
                      initialDuration={duration}
                      initialWords={originalWords}
                      initialThumbnailUrl={getFullThumbUrl(thumbnailUrl)}
                      onSave={handleSaveEdit}
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Game Board */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="flex justify-center">
                  <div className="grid grid-cols-3 gap-8">
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
              <div className="flex justify-center gap-6">
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Try Again
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Submit
                </button>
              </div>
            </div>

            {/* Game Over Modal */}
            {finished && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-md mx-4 transform animate-bounce">
                  <div className="text-6xl mb-4">
                    {matchedPairs.length === cards.length ? '🎉' : '⏰'}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    {matchedPairs.length === cards.length ? 'Congratulations!' : 'Time\'s Up!'}
                  </h2>
                  <div className="mb-6">
                    <p className="text-lg text-gray-600 mb-2">You matched</p>
                    <p className="text-4xl font-bold text-blue-600">
                      {matchedPairs.length / 2} / {cards.length / 2}
                    </p>
                    <p className="text-lg text-gray-600">pairs</p>
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
          </div>
          <Footer />
        </>
      )
      }
    </>
  );
};

export default PairingReview;