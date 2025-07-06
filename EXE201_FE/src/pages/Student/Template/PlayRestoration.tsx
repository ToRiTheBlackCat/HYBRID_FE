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
import { getLocalISOTime } from "../../../services/userService";
import { ChevronLeft, ChevronRight, Clock, Gamepad2, Pause, Play, RefreshCw, RotateCcw, Send, Target, Trophy } from "lucide-react";

/* ─── constants & helpers ─── */
const ItemTypes = { WORD: "WORD" } as const;
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

type Word = { id: number; text: string };
const normalize = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}?t=${Date.now()}`;

const PAGE_SIZE = 50;

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
  const [showSidebar, setShowSidebar] = useState(true);


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
      TakenDate: getLocalISOTime(),
    } as unknown as Accomplishment;

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

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Game Header Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Thumbnail */}
                  <div className="relative group">
                    {thumb && (
                      <div className="relative">
                        <img
                          src={baseImageUrl + thumb}
                          alt="Game thumbnail"
                          className="w-48 h-28 rounded-xl object-cover border shadow-lg group-hover:shadow-xl transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}
                  </div>

                  {/* Timer and Progress */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                      <Clock size={28} className="text-blue-500" />
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {fmt(remaining)}
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${paused ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {paused ? 'Paused' : 'Active'}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600 font-medium">
                      <Target size={16} />
                      Question {currentIdx + 1} of {questions.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Area */}
              <div className="grid gap-6">
                {/* Word Pool */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <Pool words={pool} disabled={paused} />
                </div>

                {/* Drop Area */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <DropArea answer={answer} onDropWord={dropWord} disabled={paused} />
                </div>
              </div>

              {/* Control Panel */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex flex-wrap justify-center gap-3">
                  {/* Navigation */}
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => goToSentence(currentIdx - 1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <button
                    disabled={currentIdx === questions.length - 1}
                    onClick={() => goToSentence(currentIdx + 1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>

                  {/* Game Actions */}
                  <button
                    onClick={tryAgain}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105"
                  >
                    <RotateCcw size={16} />
                    Try Again
                  </button>

                  <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105"
                  >
                    <RefreshCw size={16} />
                    Reset
                  </button>

                  {!submitted && (
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105 shadow-lg"
                    >
                      <Send size={16} />
                      Submit
                    </button>
                  )}

                  <button
                    onClick={() => setPaused((p) => !p)}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-all duration-200 flex items-center gap-2 font-medium transform hover:scale-105"
                  >
                    {paused ? <Play size={16} /> : <Pause size={16} />}
                    {paused ? "Play" : "Pause"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar - Other Games */}
            {courseMinigames.length > 0 && (
              <div className="w-80">
                <button
                  onClick={() => setShowSidebar((prev) => !prev)}
                  className="mb-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 font-medium"
                >
                  {showSidebar ? (
                    <>
                      <ChevronLeft size={16} />
                      Hide Other Games
                    </>
                  ) : (
                    <>
                      <ChevronRight size={16} />
                      Show Other Games
                    </>
                  )}
                </button>

                {showSidebar && (
                  <aside className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-fit sticky top-24">
                    <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                      <Gamepad2 size={20} className="text-purple-500" />
                      Other Games
                    </h3>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                      {courseMinigames.map((mg) => {
                        const isActive = mg.minigameId === minigameId;
                        const templatePath = paths[mg.templateId] || "game";
                        return (
                          <button
                            key={mg.minigameId}
                            onClick={() =>
                              navigate(`/student/${templatePath}/${mg.minigameId}`, {
                                state: { courseId: courseIdFromState },
                              })
                            }
                            className={`w-full flex items-center gap-3 text-left p-3 rounded-xl transition-all duration-200 ${isActive
                              ? "bg-gradient-to-r from-blue-100 to-purple-100 font-semibold border-2 border-blue-200"
                              : "hover:bg-gray-50 hover:shadow-md"
                              }`}
                            disabled={isActive}
                          >
                            <div className="relative">
                              <img
                                src={normalize(baseImageUrl, mg.thumbnailImage)}
                                alt={mg.minigameName}
                                className="w-12 h-12 object-cover rounded-lg shadow-sm"
                              />
                              {isActive && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">{mg.minigameName}</div>
                              <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                                <Trophy size={12} />
                                {mg.templateName}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </aside>
                )}
              </div>

            )}
          </div>
        </div>
      </div>

      <Footer />
    </DndProvider>
  );
};

export default PlayRestoration;
