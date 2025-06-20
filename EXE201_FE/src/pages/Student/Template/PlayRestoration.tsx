import React, { useState, useEffect, useCallback, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "../../../components/HomePage/Header";
import Footer from "../../../components/HomePage/Footer";
import { fetchPlayMinigames } from "../../../services/authService";
import { useParams } from "react-router-dom";
import { baseImageUrl } from "../../../config/base";

const ItemTypes = { WORD: "WORD" } as const;
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

type Word = { id: number; text: string };

/* ───────── Word card ───────── */
const WordCard: React.FC<{ word: Word; disabled: boolean }> = ({ word, disabled }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.WORD,
    item: word,
    canDrag: !disabled,
    collect: (m) => ({ isDragging: m.isDragging() }),
  }), [word, disabled]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current) drag(ref); }, [drag]);
  return <div ref={ref} className={`px-4 py-2 bg-yellow-200 rounded-full cursor-move text-center select-none transition-opacity ${isDragging ? "opacity-50" : "opacity-100"}`}>{word.text}</div>;
};

const Pool: React.FC<{ words: Word[]; disabled: boolean }> = ({ words, disabled }) => (
  <div className="grid grid-cols-3 gap-4">{words.map((w) => <WordCard key={w.id} word={w} disabled={disabled} />)}</div>
);

const DropArea: React.FC<{ answer: Word[]; onDropWord: (w: Word) => void; disabled: boolean }> = ({ answer, onDropWord, disabled }) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.WORD,
    canDrop: () => !disabled,
    drop: (item: Word) => onDropWord(item),
    collect: (m) => ({ isOver: m.isOver(), canDrop: m.canDrop() }),
  }), [onDropWord, disabled]);
  useEffect(() => { if (dropRef.current) drop(dropRef); }, [drop]);
  const active = canDrop && isOver;
  return (
    <div ref={dropRef} className={`w-full min-h-14 border-2 rounded flex items-center flex-wrap gap-2 p-3 transition-colors ${active ? "border-green-500" : "border-gray-400"}`}>{answer.length ? answer.map((w) => <span key={w.id} className="px-3 py-1 bg-green-200 rounded-full">{w.text}</span>) : <span className="text-gray-400">Drop words here</span>}</div>
  );
};

const PlayRestoration: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pool, setPool] = useState<Word[]>([]);
  const [answer, setAnswer] = useState<Word[]>([]);
  const [remaining, setRemaining] = useState<number>(0);
  const [paused, setPaused] = useState(true);

  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!minigameId) return;
      const data = await fetchPlayMinigames(minigameId);
      if (!data) return;

      const xml = new DOMParser().parseFromString(data.dataText, "application/xml");
      const list = Array.from(xml.getElementsByTagName("words")).map((n) => n.textContent?.trim() ?? "").filter(Boolean);
      if (!list.length) return;
      setQuestions(list);
      setCurrentIdx(0);
      setThumb(data.thumbnailImage ?? null);
      setRemaining(data.duration ?? 60);
      setPaused(true);
    })();
  }, [minigameId]);

  useEffect(() => {
    const sentence = questions[currentIdx] ?? "";
    const words = sentence.split(" ").map((t, i) => ({ id: i, text: t }));
    setPool(shuffle(words));
    setAnswer([]);
  }, [questions, currentIdx]);

  /* ── countdown ── */
  useEffect(() => {
    if (paused || remaining <= 0) return;
    const id = setInterval(() => setRemaining((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [paused, remaining]);

  const dropWord = useCallback((w: Word) => { if (!paused) { setPool((p) => p.filter((x) => x.id !== w.id)); setAnswer((a) => [...a, w]); } }, [paused]);
  const tryAgain = () => { const s = questions[currentIdx] ?? ""; setPool(shuffle(s.split(" ").map((t, i) => ({ id: i, text: t })))); setAnswer([]); };
  const submit = () => { alert(answer.map((w) => w.text).join(" ") === questions[currentIdx] ? "✅ Correct!" : "❌ Incorrect."); };


  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <Header />
          <>
            <div className="min-h-screen flex flex-col items-center gap-6 bg-white px-4 py-12 mt-20">
              {thumb && <img src={baseImageUrl + thumb} alt="thumb" className="w-64 h-36 rounded object-cover border shadow" />}

              <div className="text-xl font-semibold">⏰ {fmt(remaining)}</div>

              <div className="w-full max-w-3xl bg-pink-100 border rounded-lg p-6"><Pool words={pool} disabled={paused} /></div>
              <div className="w-full max-w-3xl"><DropArea answer={answer} onDropWord={dropWord} disabled={paused} /></div>
              <div className="text-gray-600">Sentence {currentIdx + 1} / {questions.length}</div>

              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <button disabled={currentIdx === 0} onClick={() => setCurrentIdx((i) => i - 1)} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">⬅️</button>
                <button disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx((i) => i + 1)} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">➡️</button>
                <button onClick={tryAgain} className="px-5 py-2 bg-blue-200 rounded hover:bg-blue-300">Try Again</button>
                <button onClick={submit} className="px-5 py-2 bg-green-200 rounded hover:bg-green-300">Submit</button>
                <button onClick={() => setPaused((p) => !p)} className="px-5 py-2 bg-yellow-200 rounded hover:bg-yellow-300">{paused ? "▶️ Play" : "⏸ Pause"}</button>
              </div>
            </div>
            <Footer />
          </>
      </DndProvider>
    </>
  );
};

export default PlayRestoration;
