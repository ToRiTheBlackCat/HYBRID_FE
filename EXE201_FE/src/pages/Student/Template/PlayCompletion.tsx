import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPlayMinigames } from "../../../services/authService";  // <– đã import sẵn
import Header from "../../../components/HomePage/Header";

/* ───────── helpers ───────── */
type QuestionParsed = { modifiedSentence: string; options: string[]; correctIndex: number };

function parseDataText(xml: string): QuestionParsed[] {
  const dom = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(dom.getElementsByTagName("question")).map((q) => ({
    modifiedSentence: q.getElementsByTagName("sentence")[0]?.textContent ?? "",
    options: Array.from(q.getElementsByTagName("options")).map((o) => o.textContent ?? ""),
    correctIndex: parseInt(q.getElementsByTagName("answers")[0]?.textContent ?? "0", 10) || 0,
  }));
}

/* ───────── component ───────── */
const PlayCompletion: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const navigate = useNavigate();

  /* -------- state -------- */
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
 // ★ NEW

  /* -------- fetch data -------- */
  useEffect(() => {
    if (!minigameId) {
      setError("Không tìm thấy minigameId trên URL");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await fetchPlayMinigames(minigameId);

        setActivityName(data.minigameName ?? "");           // ★ NEW

        const parsed = parseDataText(data.dataText ?? "");
        setQuestions(parsed);
        setAnswers(new Array(parsed.length).fill(-1));

        const d = Number(data.duration) || 120;                                            // ★ NEW
        setTimeLeft(d);

        setError(null);
      } catch (e) {
        console.error(e);
        setError("Không thể tải dữ liệu minigame.");
      } finally {
        setLoading(false);
      }
    })();
  }, [minigameId]);

  /* -------- answer / submit -------- */
  const handleAnswer = (optIdx: number) => {
    if (paused || submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optIdx;
      return next;
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSubmit = useCallback(() => {
    if (submitted) return;
    const pts = answers.reduce(
      (acc, a, i) => acc + (a === questions[i].correctIndex ? 1 : 0),
      0
    );
    setScore(pts);
    setSubmitted(true);
  }, [submitted, answers, questions]);

  /* -------- timer -------- */
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

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;


  /* -------- UI -------- */
  if (loading) return <div className="p-4">Đang tải minigame...</div>;
  if (error)   return <div className="p-4 text-red-600">{error}</div>;

  /* -- kết quả -- */
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

  const q = questions[current];

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {/* ---------- header ---------- */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{activityName}</h2>

          </div>

          <span className="font-mono text-sm bg-black text-white px-2 py-1 rounded">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* ---------- progress ---------- */}
        <p className="mb-2">
          Câu {current + 1} / {questions.length}
        </p>

        {/* ---------- sentence ---------- */}
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

        {/* ---------- options ---------- */}
        <div className="flex flex-wrap gap-2">
          {q.options.map((word, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`px-2 py-1 rounded w-full text-left ${
                answers[current] === idx ? "bg-green-400 text-white" : "bg-orange-200"
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

        {/* ---------- footer ---------- */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(0)}
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
