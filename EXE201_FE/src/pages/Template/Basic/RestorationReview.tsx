import React, { useState, useEffect, useCallback, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Header from "../../../components/HomePage/Header";
import Footer from "../../../components/HomePage/Footer";
import { fetchPlayMinigames } from "../../../services/authService";
import { useParams } from "react-router-dom";
import EditRestoration from "../../Teacher/Template/EditRestoration";
import { baseImageUrl } from "../../../config/base";
import RestorationRaw from "../../Teacher/RawMinigameInfo/Restoration";
import { ChevronLeft, ChevronRight, Clock, Pause, Play, RotateCcw, Send, Target } from "lucide-react";

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
  return (
    <div 
      ref={ref} 
      className={`
        px-4 py-3 bg-gradient-to-r from-blue-400 to-purple-500 text-white 
        rounded-xl cursor-move text-center select-none transition-all duration-300 
        transform hover:scale-105 shadow-lg hover:shadow-xl
        ${isDragging ? "opacity-50 scale-95" : "opacity-100"}
        ${disabled ? "cursor-not-allowed grayscale" : "hover:from-blue-500 hover:to-purple-600"}
      `}
    >
      <span className="font-medium text-sm">{word.text}</span>
    </div>
  );
};

const Pool: React.FC<{ words: Word[]; disabled: boolean }> = ({ words, disabled }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
    {words.map((w) => (
      <WordCard key={w.id} word={w} disabled={disabled} />
    ))}
  </div>
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
    <div 
      ref={dropRef} 
      className={`
        w-full min-h-20 border-2 rounded-xl flex items-center flex-wrap gap-2 p-4 
        transition-all duration-300 bg-gradient-to-br from-gray-50 to-white
        ${active ? "border-green-400 bg-green-50 shadow-lg scale-102" : "border-gray-300 hover:border-gray-400"}
      `}
    >
      {answer.length ? (
        answer.map((w, index) => (
          <span 
            key={w.id} 
            className="px-3 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg font-medium text-sm shadow-md animate-in fade-in-0 slide-in-from-top-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {w.text}
          </span>
        ))
      ) : (
        <div className="flex items-center justify-center w-full text-gray-400">
          <Target className="w-5 h-5 mr-2" />
          <span>Kéo và thả các từ vào đây để tạo thành câu</span>
        </div>
      )}
    </div>
  );
};

const RestorationReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pool, setPool] = useState<Word[]>([]);
  const [answer, setAnswer] = useState<Word[]>([]);
  const [remaining, setRemaining] = useState<number>(0);
  const [paused, setPaused] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const [activityName, setActivityName] = useState("Restoration Activity");
  const [duration, setDuration] = useState<number>(60);
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
      setActivityName(data.minigameName ?? "Restoration Activity");
      setDuration(data.duration ?? 60);
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
  const getFullThumbUrl = (url: string): string =>
  url.startsWith("http") ? url : baseImageUrl + url;

  const dropWord = useCallback((w: Word) => { if (!paused) { setPool((p) => p.filter((x) => x.id !== w.id)); setAnswer((a) => [...a, w]); } }, [paused]);
  const tryAgain = () => { const s = questions[currentIdx] ?? ""; setPool(shuffle(s.split(" ").map((t, i) => ({ id: i, text: t })))); setAnswer([]); };
  const submit = () => { alert(answer.map((w) => w.text).join(" ") === questions[currentIdx] ? "✅ Correct!" : "❌ Incorrect."); };
  const saveEdit = (d: { activityName: string; duration: number; words: string[]; thumbnailUrl: string | null; }) => { setActivityName(d.activityName); setDuration(d.duration); setThumb(d.thumbnailUrl); setQuestions(d.words); setCurrentIdx(0); setRemaining(d.duration); setPaused(true); };

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <Header />
        {!isPlaying ? (
          <RestorationRaw onStart={() => setIsPlaying(true)} />
        ) : (
          <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 mt-20">
              <div className="container mx-auto px-4 max-w-5xl">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Thumbnail */}
                    <div className="relative group">
                      {thumb ? (
                        <img 
                          src={baseImageUrl + thumb} 
                          alt="Activity thumbnail" 
                          className="w-48 h-28 rounded-xl object-cover border shadow-lg group-hover:shadow-xl transition-shadow duration-300" 
                        />
                      ) : (
                        <div className="w-48 h-28 bg-gray-200 rounded-xl flex items-center justify-center">
                          <div className="text-gray-400 text-sm">No Image</div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Timer and Progress */}
                    <div className="flex-1 text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                        <Clock size={24} className="text-blue-500" />
                        <div className="text-3xl font-bold text-gray-800">
                          {fmt(remaining)}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          paused ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {paused ? 'Paused' : 'Active'}
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-gray-600 font-medium">
                        Question {currentIdx + 1} of {questions.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Area */}
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                  {/* Word Pool */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <Pool words={pool} disabled={paused} />
                  </div>
                  
                  {/* Drop Area */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <DropArea answer={answer} onDropWord={dropWord} disabled={paused} />
                  </div>
                </div>

                {/* Control Panel */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-wrap justify-center gap-3">
                    {/* Navigation */}
                    <button 
                      disabled={currentIdx === 0} 
                      onClick={() => setCurrentIdx((i) => i - 1)} 
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 font-medium"
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    
                    <button 
                      disabled={currentIdx === questions.length - 1} 
                      onClick={() => setCurrentIdx((i) => i + 1)} 
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 font-medium"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                    
                    {/* Actions */}
                    <button 
                      onClick={tryAgain} 
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105"
                    >
                      <RotateCcw size={16} />
                      Try Again
                    </button>
                    
                    <button 
                      onClick={submit} 
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105"
                    >
                      <Send size={16} />
                      Submit
                    </button>
                    
                    <button 
                      onClick={() => setPaused((p) => !p)} 
                      className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105"
                    >
                      {paused ? <Play size={16} /> : <Pause size={16} />}
                      {paused ? "Resume" : "Pause"}
                    </button>
                    
                    <EditRestoration 
                      initialActivityName={activityName} 
                      initialDuration={duration} 
                      initialWords={questions} 
                      initialThumbnailUrl={getFullThumbUrl(thumb ?? "")} 
                      onSave={saveEdit} 
                    />
                  </div>
                </div>
              </div>
            </div>
            <Footer />
          </>
        )}
      </DndProvider>
    </>
  );
};

export default RestorationReview;
