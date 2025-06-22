import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../../components/HomePage/Header";
import Footer from "../../../components/HomePage/Footer";
import { fetchPlayMinigames, submitAccomplishment, fetchCourseMinigame } from "../../../services/authService";
import { Accomplishment, Minigame } from "../../../types";
import { baseImageUrl } from '../../../config/base';

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

const getColorClass = (word: string) => {
  const colors: Record<string, string> = {
    Toy: "bg-green-500",
    Summer: "bg-blue-500",
    Winter: "bg-red-500",
    Park: "bg-yellow-600",
    Fall: "bg-orange-500",
    Spring: "bg-purple-500",
  };
  return colors[word] || "bg-gray-500";
};

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
      TakenDate: new Date(),
    };

    try {
      await submitAccomplishment(payload);
      setSubmitted(true);
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

  if (loading) return <><Header /><div className="min-h-screen flex items-center justify-center">Loading…</div><Footer /></>;
  if (error) return <><Header /><div className="min-h-screen flex items-center justify-center text-red-600">{error}</div><Footer /></>;

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center bg-white px-4 py-8 mt-20">
        {courseMinigames.length > 0 && (
          <aside className="absolute top-24 right-4 w-60 bg-white border rounded-lg shadow-md overflow-auto max-h-[80vh]">
            <h3 className="font-bold text-center py-2 border-b">Other games</h3>
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
                  className={`w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-blue-50 ${isActive ? "bg-blue-100 font-semibold" : ""
                    }`}
                  disabled={isActive}
                >
                  <img
                    src={normalize(baseImageUrl, mg.thumbnailImage)}
                    alt={mg.minigameName}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex flex-col">
                    <span className="line-clamp-2">{mg.minigameName}</span>
                    <span className="line-clamp-2 text-gray-500 text-xs">{mg.templateName}</span>
                  </div>
                </button>
              );
            })}
          </aside>
        )}
        <div className="w-[900px] flex justify-between items-center mb-4">
          <p className={`font-semibold ${(remaining ?? 0) <= 10 ? "text-red-600" : "text-gray-700"}`}>
            ⏰ {formatTime(remaining ?? 0)}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setPaused((p) => !p)}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-1 rounded"
            >
              {paused ? "Play" : "Pause"}
            </button>
          </div>
        </div>

        <div className="w-[900px] min-h-[400px] bg-pink-100 border rounded-lg p-6 mb-10 flex justify-center items-center">
          <div className="grid grid-cols-3 gap-12">
            {cards.map((card) => {
              const show = card.isFlipped || card.isMatched;
              const bg = show ? getColorClass(card.word) : "bg-yellow-200";
              const border = card.isMatched ? "border-green-500" : "border-gray-400";
              return (
                <div key={card.id} onClick={() => handleCardClick(card.id)} className="w-28 h-12 perspective">
                  <div className={`card-inner ${show ? "rotate-y-180" : ""}`}>
                    <div className="backface-hidden bg-yellow-200 border border-gray-400 rounded-full w-full h-full" />
                    <div className={`backface-hidden rotate-y-180 ${bg} border ${border} rounded-full flex items-center justify-center text-white text-lg font-medium w-full h-full`}>
                      {card.word}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {finished && (
          <div className="w-full max-w-[700px] flex justify-center">
            <button onClick={resetGame} className="px-6 py-2 bg-blue-200 text-blue-800 font-semibold rounded-full hover:bg-blue-300 transition">
              Try again
            </button>
          </div>
        )}

        {finished && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg text-center space-y-4">
              <h2 className="text-xl font-bold">Game Over</h2>
              <p>
                You matched <span className="font-semibold">{matchedPairs.length / 2}</span> / {cards.length / 2} pairs
              </p>
              <button onClick={resetGame} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Play again
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PlayPairing;
