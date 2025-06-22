import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/HomePage/Header";
import KeywordDragDrop from "../../../components/Anagram/DragDrop";
import {
  fetchPlayMinigames,
  submitAccomplishment,
  fetchCourseMinigame,
} from "../../../services/authService";
import { Accomplishment, Minigame } from "../../../types";
import { baseImageUrl } from "../../../config/base";
import { toast } from "react-toastify";

/* ───────── helpers ───────── */
const shuffleArray = (array: string[]) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const parseXmlWords = (xml: string): string[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");
  const wordElements = xmlDoc.getElementsByTagName("word");
  const words: string[] = [];
  for (let i = 0; i < wordElements.length; i++) {
    words.push(wordElements[i].textContent?.toUpperCase() || "");
  }
  return words;
};

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
const PlayAnagram: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;

  /* ───────── state ───────── */
  const [words, setWords] = useState<string[]>([]);
  const [duration, setDuration] = useState(60);
  const [timer, setTimer] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [droppedLetters, setDroppedLetters] = useState<{ [index: number]: string | null }>({});
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [finished, setFinished] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);

  /* ───────── effects ───────── */
  // Load game data
  useEffect(() => {
    if (!minigameId) return;
    fetchPlayMinigames(minigameId).then((res) => {
      const parsedWords = parseXmlWords(res.dataText);

      setWords(parsedWords);
      setDuration(res.duration || 60);
      setTimer(res.duration || 60);
      setFinished(false);
      setIsPaused(false);
      setCurrentIndex(0);
      setCorrectCount(0);
    });
  }, [minigameId]);

  // Shuffle letters whenever we switch to a new word
  useEffect(() => {
    if (words.length && currentIndex < words.length) {
      const cur = words[currentIndex];
      setShuffledLetters(shuffleArray(cur.split("")));
      setDroppedLetters(
        Object.fromEntries(Array(cur.length).fill(null).map((_, idx) => [idx, null]))
      );
      setFeedback(null);
    }
  }, [words, currentIndex]);

  // Countdown timer
  useEffect(() => {
    if (!isPaused && timer > 0 && !finished) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0 && !finished) {
      handleFinish();
    }
  }, [isPaused, timer, finished]);

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
  const handleDrop = (targetIndex: number, keyword: string) => {
    const updated = { ...droppedLetters, [targetIndex]: keyword };
    setDroppedLetters(updated);

    const assembled = Object.values(updated).join("");
    const currentWord = words[currentIndex];

    if (assembled.length === currentWord.length) {
      if (assembled === currentWord) {
        if (feedback !== "correct") setCorrectCount((p) => p + 1);
        setFeedback("correct");
      } else {
        setFeedback("incorrect");
      }
    } else {
      setFeedback(null);
    }
  };

  const handleNext = () => currentIndex < words.length - 1 && setCurrentIndex((i) => i + 1);
  const handlePrev = () => currentIndex > 0 && setCurrentIndex((i) => i - 1);

  const handleFinish = async () => {
    if (finished) return;
    setFinished(true);
    setIsPaused(true);

    const percent = Math.round((correctCount / words.length) * 100);
    const durationUsed = duration - timer;

    const payload: Accomplishment = {
      minigameId: minigameId ?? "",
      percent,
      durationInSeconds: durationUsed,
      takenDate: new Date().toISOString(),
    } as unknown as Accomplishment;

    try {
      await submitAccomplishment(payload);
      toast.success(`✅ Result submitted: ${percent}%`);
    } catch (e) {
      toast.error("❌ Failed to submit result");
      console.error(e);
    }
  };

  const handleRetry = () => {
    setDroppedLetters({});
    setCurrentIndex(0);
    setFinished(false);
    setTimer(duration);
    setIsPaused(false);
    setResetCounter((c) => c + 1);
    setFeedback(null);
  };

  const togglePause = () => setIsPaused((p) => !p);

  /* ───────── render ───────── */
  if (words.length === 0) {
    return (
      <>
        <Header />
        <div className="text-center mt-10 text-gray-600">
          Không tìm thấy từ cho hoạt động này.
        </div>
      </>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4 relative">
        {/* ───────── Aside: other minigames ───────── */}
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
                  className={`w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                    isActive ? "bg-blue-100 font-semibold" : ""
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

        {/* ───────── Main card ───────── */}
        <div className="border rounded-lg p-6 w-full max-w-3xl bg-white shadow-lg">
          <div className="flex justify-between mb-4 text-lg font-medium">
            <div>
              ⏰ Thời gian còn lại: {timer}s
              {finished && <span className="text-red-600 ml-2">(Hết giờ)</span>}
            </div>
            <button
              onClick={togglePause}
              className="bg-gray-400 px-3 py-1 rounded text-white"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
          </div>

          {/* Display current word as reference */}
          <div className="text-center text-2xl mb-6 font-semibold tracking-wide">
            {currentWord.split("").map((letter, idx) => (
              <span key={idx} className="inline-block mx-2 font-mono">
                {letter}
              </span>
            ))}
          </div>

          {/* Target slots */}
          <div className="flex justify-center gap-2 mb-6">
            {currentWord.split("").map((_, idx) => (
              <div
                key={idx}
                className="w-10 h-10 border border-black rounded flex items-center justify-center text-xl bg-white"
              >
                {droppedLetters[idx] || ""}
              </div>
            ))}
          </div>

          {/* Drag-and-drop area */}
          <KeywordDragDrop
            keywords={shuffledLetters}
            targets={currentWord.split("")}
            droppedKeywords={droppedLetters}
            onDrop={handleDrop}
            direction="horizontal"
            paused={isPaused}
            resetTrigger={resetCounter}
          />

          {/* Feedback */}
          {feedback === "correct" && (
            <div className="text-green-600 text-center text-lg font-semibold mt-4">
              ✅ Chính xác!
            </div>
          )}
          {feedback === "incorrect" && (
            <div className="text-red-600 text-center text-lg font-semibold mt-4">
              ❌ Sai rồi!
            </div>
          )}

          {/* Navigation + finish */}
          <div className="flex justify-center items-center gap-4 mt-8 text-lg font-medium">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              ←
            </button>
            <span>
              {currentIndex + 1} / {words.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === words.length - 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              →
            </button>
          </div>

          <div className="flex justify-center gap-6 mt-6">
            {!finished ? (
              <button
                onClick={handleFinish}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Finish
              </button>
            ) : (
              <button
                onClick={handleRetry}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayAnagram;
