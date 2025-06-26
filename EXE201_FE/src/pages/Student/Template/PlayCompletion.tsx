import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  fetchPlayMinigames,
  submitAccomplishment,
  fetchCourseMinigame,
} from "../../../services/authService";
import Header from "../../../components/HomePage/Header";
import { Accomplishment, Minigame } from "../../../types";
import { toast } from "react-toastify";
import { baseImageUrl } from "../../../config/base";
import { getLocalISOTime } from "../../../services/userService";

/* ───────── helpers ───────── */
type QuestionParsed = {
  modifiedSentence: string;
  options: string[];
  correctIndex: number;
};

function parseDataText(xml: string): QuestionParsed[] {
  const dom = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(dom.getElementsByTagName("question")).map((q) => ({
    modifiedSentence: q.getElementsByTagName("sentence")[0]?.textContent ?? "",
    options: Array.from(q.getElementsByTagName("options")).map((o) => o.textContent ?? ""),
    correctIndex: parseInt(q.getElementsByTagName("answers")[0]?.textContent ?? "0", 10) || 0,
  }));
}

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
const PlayCompletion: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;

  /* ───────── state ───────── */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityName, setActivityName] = useState("");
  const [questions, setQuestions] = useState<QuestionParsed[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [paused, setPaused] = useState(true);
  const [duration, setDuration] = useState<number>(0);
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);

  /* ───────── effects ───────── */
  // Load minigame data
  useEffect(() => {
    if (!minigameId) {
      setError("Không tìm thấy minigameId trên URL");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await fetchPlayMinigames(minigameId);
        setActivityName(data.minigameName ?? "");
        const parsed = parseDataText(data.dataText ?? "");
        setQuestions(parsed);
        setAnswers(new Array(parsed.length).fill(-1));
        const d = Number(data.duration) || 120;
        setTimeLeft(d);
        setDuration(d);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("Không thể tải dữ liệu minigame.");
      } finally {
        setLoading(false);
      }
    })();
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

  /* ───────── handlers ───────── */
  const handleAnswer = (optIdx: number) => {
    if (paused || submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optIdx;
      return next;
    });
  };

  const handleSubmit = useCallback(async () => {
    if (submitted || !minigameId) return;
    const pts = answers.reduce((acc, a, i) => acc + (a === questions[i].correctIndex ? 1 : 0), 0);
    setScore(pts);
    setSubmitted(true);

    const percent = Math.round((pts / questions.length) * 100);
    const durationUsed = duration - timeLeft;

    const payload: Accomplishment = {
      MinigameId: minigameId,
      Percent: percent,
      DurationInSeconds: durationUsed,
      TakenDate: getLocalISOTime(),
    } as unknown as Accomplishment;

    try {
      await submitAccomplishment(payload);
      toast.success(`✅ Result submitted. You got ${percent}`);
    } catch (e) {
      console.error("submitAccomplishment error", e);
    }
  }, [submitted, answers, questions, minigameId, timeLeft, duration]);

  // Countdown timer
  useEffect(() => {
    if (loading || submitted || paused) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [loading, submitted, paused, handleSubmit]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ───────── early returns ───────── */
  if (loading) return <div className="p-4">Đang tải minigame...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  /* ───────── submitted view ───────── */
  if (submitted && score !== null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold mb-4">Kết quả của bạn</h2>
          <p className="text-3xl font-semibold mb-4">
            {score} / {questions.length}
          </p>
          <button
            onClick={() => navigate(0)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Chơi lại
          </button>
        </div>
      </div>
    );

  /* ───────── playing view ───────── */
  const q = questions[current];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative">
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

        {/* ───────── Main card ───────── */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">{activityName}</h2>
            <span className="font-mono text-sm bg-black text-white px-2 py-1 rounded">
              {formatTime(timeLeft)}
            </span>
          </div>

          <p className="mb-2">
            Câu {current + 1} / {questions.length}
          </p>

          <div className="p-3 border rounded bg-yellow-100 text-gray-700 mb-4">
            {q.modifiedSentence.split("___").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="bg-yellow-200 px-1 mx-1 rounded">___</span>
                )}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {q.options.map((word, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`px-2 py-1 rounded w-full text-left ${answers[current] === idx ? "bg-green-400 text-white" : "bg-orange-200"
                  }`}
                disabled={paused}
              >
                {word}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-40"
            >
              ‹ Prev
            </button>
            <button
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              disabled={current === questions.length - 1}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-40"
            >
              Next ›
            </button>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Thoát
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setPaused((p) => !p)}
                className="bg-yellow-400 px-4 py-2 rounded hover:bg-yellow-500"
              >
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-60"
                disabled={answers.includes(-1) || paused}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayCompletion;
