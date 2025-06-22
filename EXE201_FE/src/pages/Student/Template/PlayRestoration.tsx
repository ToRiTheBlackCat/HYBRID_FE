import React, { useState, useEffect, useCallback, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "../../../components/HomePage/Header";
import Footer from "../../../components/HomePage/Footer";
import { fetchPlayMinigames, submitAccomplishment, fetchCourseMinigame } from "../../../services/authService";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Accomplishment, Minigame } from "../../../types";
import { baseImageUrl } from "../../../config/base";
import { toast } from "react-toastify";

/* ─── constants & helpers ─── */
const ItemTypes = { WORD: "WORD" } as const;
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

type Word = { id: number; text: string };
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

/* ─── draggable card ─── */
const WordCard: React.FC<{ word: Word; disabled: boolean }> = ({ word, disabled }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WORD,
    item: word,
    canDrag: !disabled,
    collect: (m) => ({ isDragging: m.isDragging() }),
  }), [word, disabled]);
  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`px-4 py-2 bg-yellow-200 rounded-full cursor-move text-center select-none transition-opacity ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {word.text}
    </div>
  );
};

const Pool: React.FC<{ words: Word[]; disabled: boolean }> = ({ words, disabled }) => (
  <div className="grid grid-cols-3 gap-4">
    {words.map((w) => (
      <WordCard key={w.id} word={w} disabled={disabled} />
    ))}
  </div>
);

const DropArea: React.FC<{
  answer: Word[];
  onDropWord: (w: Word) => void;
  disabled: boolean;
}> = ({ answer, onDropWord, disabled }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.WORD,
    canDrop: () => !disabled,
    drop: (item: Word) => onDropWord(item),
    collect: (m) => ({ isOver: m.isOver(), canDrop: m.canDrop() }),
  }), [onDropWord, disabled]);

  return (
    <div
      ref={(node) => {
        if (node) drop(node);
        ref.current = node;
      }}
      className={`w-full min-h-14 border-2 rounded flex items-center flex-wrap gap-2 p-3 transition-colors ${canDrop && isOver ? "border-green-500" : "border-gray-400"
        }`}
    >
      {answer.length ? (
        answer.map((w) => (
          <span key={w.id} className="px-3 py-1 bg-green-200 rounded-full">
            {w.text}
          </span>
        ))
      ) : (
        <span className="text-gray-400">Drop words here</span>
      )}
    </div>
  );
};

/* ─── main component ─── */
const PlayRestoration: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();

  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pool, setPool] = useState<Word[]>([]);
  const [answer, setAnswer] = useState<Word[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<number, Word[]>>({});
  const [remaining, setRemaining] = useState(0);
  const [initialDuration, setInitialDuration] = useState(0);
  const [paused, setPaused] = useState(true);
  const [thumb, setThumb] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const resetGame = async () => {
    if (!minigameId) return;
    const data = await fetchPlayMinigames(minigameId);
    if (!data) return;

    const xml = new DOMParser().parseFromString(data.dataText, "application/xml");
    const list = Array.from(xml.getElementsByTagName("words"))
      .map((n) => n.textContent?.trim() ?? "")
      .filter(Boolean);
    if (!list.length) return;

    setQuestions(list);
    setCurrentIdx(0);
    setThumb(data.thumbnailImage ?? null);
    const dur = data.duration ?? 60;
    setRemaining(dur);
    setInitialDuration(dur);
    setPaused(true);
    setSubmitted(false);
    setAnswersMap({});
    setAnswer([]);
    setPool([]);
  };

  useEffect(() => {
    resetGame();
  }, [minigameId]);

  useEffect(() => {
    const sentence = questions[currentIdx] ?? "";
    const words = sentence.split(" ").map((t, i) => ({ id: i, text: t }));

    const savedAnswer = answersMap[currentIdx] ?? [];
    const usedIds = new Set(savedAnswer.map((w) => w.id));

    setPool(shuffle(words.filter((w) => !usedIds.has(w.id))));
    setAnswer(savedAnswer);
  }, [questions, currentIdx, answersMap]);
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
    if (paused || remaining <= 0) return;
    const id = setInterval(() => setRemaining((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [paused, remaining]);

  const dropWord = useCallback(
    (w: Word) => {
      if (!paused) {
        setPool((p) => p.filter((x) => x.id !== w.id));
        setAnswer((prev) => {
          const newAns = [...prev, w];
          setAnswersMap((m) => ({ ...m, [currentIdx]: newAns }));
          return newAns;
        });
      }
    },
    [paused, currentIdx]
  );

  const tryAgain = () => {
    const s = questions[currentIdx] ?? "";
    const freshWords = s.split(" ").map((t, i) => ({ id: i, text: t }));
    setPool(shuffle(freshWords));
    setAnswer([]);
    setAnswersMap((m) => ({ ...m, [currentIdx]: [] }));
  };

  const goToSentence = (idx: number) => {
    setCurrentIdx(idx);
  };

  const handleSubmit = async () => {
    if (submitted || !minigameId) return;

    const correctCount = questions.reduce((acc, sentence, idx) => {
      const ans = answersMap[idx] ?? [];
      if (ans.map((w) => w.text).join(" ") === sentence) {
        return acc + 1;
      }
      return acc;
    }, 0);

    const percent = Math.round((correctCount / questions.length) * 100);
    const durationUsed = initialDuration - remaining;

    const payload: Accomplishment = {
      MinigameId: minigameId,
      Percent: percent,
      DurationInSecond: durationUsed,
      TakenDate: new Date(),
    };

    try {
      await submitAccomplishment(payload);
      toast.success(`✅ You scored ${percent}%! (${correctCount}/${questions.length} correct)`);
      setSubmitted(true);
    } catch (err) {
      console.error("submitAccomplishment error", err);
      toast.error("❌ Failed to submit score");
    }
  };

  return (

    <DndProvider backend={HTML5Backend}>
      <Header />
      <div className="min-h-screen flex flex-col items-center gap-6 bg-white px-4 py-12 mt-20">
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
        {thumb && (
          <img
            src={baseImageUrl + thumb}
            alt="thumb"
            className="w-64 h-36 rounded object-cover border shadow"
          />
        )}

        <div className="text-xl font-semibold">⏰ {fmt(remaining)}</div>

        <div className="w-full max-w-3xl bg-pink-100 border rounded-lg p-6">
          <Pool words={pool} disabled={paused} />
        </div>
        <div className="w-full max-w-3xl">
          <DropArea answer={answer} onDropWord={dropWord} disabled={paused} />
        </div>
        <div className="text-gray-600">
          Sentence {currentIdx + 1} / {questions.length}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <button
            disabled={currentIdx === 0}
            onClick={() => goToSentence(currentIdx - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ⬅️
          </button>
          <button
            disabled={currentIdx === questions.length - 1}
            onClick={() => goToSentence(currentIdx + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            ➡️
          </button>
          <button onClick={tryAgain} className="px-5 py-2 bg-blue-200 rounded hover:bg-blue-300">
            Try Again
          </button>
          <button onClick={resetGame} className="px-5 py-2 bg-red-200 rounded hover:bg-red-300">
            Reset
          </button>
          {!submitted && (
            <button onClick={handleSubmit} className="px-5 py-2 bg-green-200 rounded hover:bg-green-300">
              Submit
            </button>
          )}
          <button
            onClick={() => setPaused((p) => !p)}
            className="px-5 py-2 bg-yellow-200 rounded hover:bg-yellow-300"
          >
            {paused ? "▶️ Play" : "⏸ Pause"}
          </button>
        </div>
      </div>
      <Footer />
    </DndProvider>
  );
};

export default PlayRestoration;
