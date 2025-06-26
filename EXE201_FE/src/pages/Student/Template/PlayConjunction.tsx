/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const [isPaused, setIsPaused] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);
  const initialDuration = useRef<number>(0);

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
  const handleDrop = (targetIndex: number, keyword: string) => {
    if (!isTimeUp && !isPaused) {
      setDropped((prev) => ({ ...prev, [targetIndex]: keyword }));
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-white p-4 relative">
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
        <div className="max-w-3xl w-full mx-auto p-6 space-y-4 mt-20 border rounded-lg shadow-lg bg-white">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Activity Review</h1>
            <div className="text-red-600 font-semibold text-lg">⏳ {formatTime(duration)}</div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
            >
              {isPaused ? "▶️ Resume" : "⏸️ Pause"}
            </button>
          </div>

          <h2 className="text-xl font-semibold text-blue-700">Activity Name: {activityName}</h2>

          {isTimeUp && (
            <div className="text-red-600 font-bold mt-2">
              ⏰ Time is up! You can no longer interact with this activity.
            </div>
          )}

          <div className="p-6 mt-6 border rounded-lg shadow bg-white">
            <h2 className="text-xl font-bold mb-4">Match the keywords</h2>

            <KeywordDragDrop
              keywords={keywords}
              targets={meanings}
              onDrop={handleDrop}
              droppedKeywords={dropped}
              disabled={isTimeUp || isPaused}
            />
          </div>

          {showResult && (
            <div className="p-4 mt-6 border rounded bg-yellow-50 text-green-700">
              ✅ You got {score} out of {keywords.length} correct!
              <ul className="mt-2 list-disc pl-5 text-sm text-black">
                {meanings.map((meaning, index) => (
                  <li key={index}>
                    {meaning}: {" "}
                    <span
                      className={
                        dropped[index] === keywords[index] ? "text-green-600" : "text-red-600"
                      }
                    >
                      {dropped[index] || "No answer"}{" "}
                      {dropped[index] === keywords[index]
                        ? "(Correct)"
                        : `(Expected: ${keywords[index]})`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isTimeUp ? (
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={tryAgain}
                className="px-4 py-2 rounded bg-blue-100 hover:bg-blue-200 border"
              >
                🔄 Try Again
              </button>
            </div>
          ) : (
            <div className="flex justify-end mt-6">
              <button
                onClick={finishEarly}
                className="px-4 py-2 rounded bg-green-100 hover:bg-green-200 border"
              >
                ✅ Finish
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PlayConjunction;
