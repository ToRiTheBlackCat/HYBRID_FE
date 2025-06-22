import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { FiVolume2 } from "react-icons/fi";
import { useParams } from "react-router-dom";

import Header from "../../../components/HomePage/Header";
import { fetchPlayMinigames, submitAccomplishment } from "../../../services/authService";
import { baseImageUrl } from "../../../config/base";
import { Accomplishment } from "../../../types";

interface Question {
  word: string;
  imagePath: string;
}

const PlaySpelling: React.FC = () => {
  /* ───────── params / refs ───────── */
  const { minigameId } = useParams<{ minigameId: string }>();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ───────── gameplay state ───────── */
  const [questions, setQuestions] = useState<Question[]>([]);
  const [curIdx, setCurIdx] = useState(0);
  const [letters, setLetters] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<number>(0);
  const [initialDuration, setInitialDuration] = useState<number>(0);
  const [paused, setPaused] = useState(true);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [activityName, setActivityName] = useState("");

  /* ───────── helpers ───────── */
  const normalize = (base: string, path: string) => {
    const url = `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/,
 "")}`;
    return `${url}?t=${Date.now()}`;
  };

  const speakWord = (w: string) => {
    const ut = new SpeechSynthesisUtterance(w);
    ut.lang = "en-US";
    window.speechSynthesis.speak(ut);
  };

  /* ───────── submit result ───────── */
  const submitResult = useCallback(
    async (finalScore: number = score) => {
      if (submitted || !questions.length || !minigameId) return;

      const percent = Math.round((finalScore / questions.length) * 100);
      const durationUsed = initialDuration - remaining;

      const payload: Accomplishment = {
        MinigameId: minigameId,
        Percent: percent,
        DurationInSecond: durationUsed,
        TakenDate: new Date(),
      };

      try {
        await submitAccomplishment(payload);
        toast.success(`✅ Result submitted: ${percent}%`);
        setSubmitted(true);
      } catch (e) {
        toast.error("❌ Failed to submit result");
        console.error(e);
      }
    },
    [submitted, questions.length, score, minigameId, initialDuration, remaining]
  );

  /* ───────── fetch data ───────── */
  const initGame = useCallback(async () => {
    if (!minigameId) return;
    setLoading(true);
    try {
      const res = await fetchPlayMinigames(minigameId);
      if (!res) return;

      setActivityName(res.minigameName ?? "Spelling Review");
      setRemaining(res.duration ?? 0);
      setInitialDuration(res.duration ?? 0);

      const xml = new DOMParser().parseFromString(res.dataText, "text/xml");
      const qs: Question[] = [];

      for (const q of Array.from(xml.getElementsByTagName("question"))) {
        const word = q.getElementsByTagName("word")[0]?.textContent?.trim().toUpperCase() ?? "";
        const img = q.getElementsByTagName("image")[0]?.textContent?.trim() ?? "";
        qs.push({ word, imagePath: img });
      }

      setQuestions(qs);
      setLetters(Array(qs[0]?.word.length || 0).fill(""));
      setCurIdx(0);
      setScore(0);
      setFinished(false);
      setPaused(true);
      setSubmitted(false);
    } catch (e) {
      toast.error("Failed to load minigame");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [minigameId]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  /* ───────── countdown ───────── */
  useEffect(() => {
    if (paused || remaining <= 0) return;
    const t = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [paused, remaining]);

  /* ───────── time up submit ───────── */
  useEffect(() => {
    if (remaining === 0 && !paused && !submitted) {
      setFinished(true);
      submitResult(score); // use current score
    }
  }, [remaining, paused, submitted, submitResult, score]);

  /* ───────── gameplay handlers ───────── */
  const curQ = questions[curIdx];

  const onType = (i: number, v: string) => {
    if (paused || !/^[A-Za-z]?$/.test(v)) return;
    const up = [...letters];
    up[i] = v.toUpperCase();
    setLetters(up);
    if (v && i < letters.length - 1) inputRefs.current[i + 1]?.focus();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = letters.join("") === curQ.word;

    let nextScore = score;
    if (isCorrect) {
      toast.success("Correct!");
      nextScore = score + 1;
      setScore(nextScore);
    } else {
      toast.error("Incorrect!");
    }

    const lastQuestion = curIdx === questions.length - 1;

    if (!lastQuestion) {
      const next = curIdx + 1;
      setCurIdx(next);
      setLetters(Array(questions[next].word.length).fill(""));
    } else {
      setFinished(true);
      setPaused(true);
      toast.success("🎉 Finished!");
      submitResult(nextScore); // ensure final score is used
    }
  };

  /* ───────── UI ───────── */
  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">Loading…</div>
      </>
    );

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
          {/* top bar */}
          <div className="flex justify-between mb-4">
            <p className={`font-semibold ${remaining === 0 ? "text-red-600" : "text-gray-600"}`}>
              Time left: {remaining}s
            </p>
            <button
              onClick={() => setPaused((p) => !p)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
            >
              {paused ? "Resume" : "Pause"}
            </button>
          </div>

          <h2 className="text-xl font-bold text-center mb-4">
            {activityName} ({curIdx + 1}/{questions.length})
          </h2>

          {/* image / speaker */}
          <div className="flex justify-center mb-6">
            {curQ?.imagePath ? (
              <img
                src={normalize(baseImageUrl, curQ.imagePath)}
                alt="img"
                className="w-32 h-32 object-cover rounded"
              />
            ) : (
              <button onClick={() => speakWord(curQ?.word || "")} className="text-4xl text-blue-600">
                <FiVolume2 />
              </button>
            )}
          </div>

          {/* inputs */}
          <form onSubmit={onSubmit} className="flex flex-col items-center">
            <div className="flex gap-2 mb-6">
              {letters.map((ch, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={ch}
                  onChange={(e) => onType(i, e.target.value)}
                  className="w-10 h-10 text-center uppercase border text-xl font-bold rounded"
                  maxLength={1}
                  disabled={paused || remaining === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mb-2 disabled:opacity-50"
              disabled={paused || remaining === 0}
            >
              Check
            </button>
            <button
              type="button"
              onClick={initGame}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded disabled:opacity-50"
            >
              Try Again
            </button>

            {remaining === 0 && (
              <p className="text-red-600 font-semibold mt-3">⏰ Time's up!</p>
            )}
          </form>

          {finished && (
            <div className="text-center mt-6">
              <p className="text-lg font-bold text-green-600">
                ✅ You scored {score} / {questions.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PlaySpelling;
