import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchPlayMinigames, submitAccomplishment } from "../../../services/authService";
import { ArrowUp, ArrowDown, Pause, Play } from "lucide-react";
import Header from "../../../components/HomePage/Header";
import { Accomplishment } from "../../../types";
import { toast } from "react-toastify";

interface QuestionAnswer {
  question: string;
  answer: "True" | "False";
}

const PlayTrueFalse: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();

  /* ───── state cho phần chơi ───── */
  const [questions, setQuestions]   = useState<QuestionAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers]   = useState<(string | null)[]>([]);
  const [duration, setDuration]         = useState(0);
  const [timeLeft, setTimeLeft]         = useState(0);
  const [paused, setPaused]             = useState(true);

  /* ───── state bổ sung để truyền vào EditTrueFalse ───── */
  const [activityName, setActivityName]     = useState("");       

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ───── load dữ liệu minigame ───── */
  useEffect(() => {
    if (!minigameId) return;

    (async () => {
      const data = await fetchPlayMinigames(minigameId);
      if (!data) return;

      /* Giả định api trả về field MinigameName & ThumbnailUrl */
      setActivityName(data.minigameName);

      const parsedXML = parseQuestions(data.dataText);
      setQuestions(parsedXML);

      setUserAnswers(Array(parsedXML.length).fill(null));
      setDuration(data.duration);
      setTimeLeft(data.duration);
    })();
  }, [minigameId]);

  /* ───── Timer ───── */
  useEffect(() => {
    if (paused || timeLeft <= 0) return;
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, timeLeft > 0]);

  /* ───── helpers ───── */
  const parseQuestions = (xml: string): QuestionAnswer[] => {
    const doc  = new DOMParser().parseFromString(xml, "application/xml");
    const nodes = Array.from(doc.getElementsByTagName("question"));
    return nodes.map(q => ({
      question: q.getElementsByTagName("statement")[0].textContent || "",
      answer:   q.getElementsByTagName("answer")[0].textContent?.toLowerCase() === "true" ? "True" : "False",
    }));
  };

  const handleAnswer = (val: "True" | "False") => {
    setUserAnswers(prev => prev.map((a, i) => i === currentIndex ? val : a));
  };

  const goToIndex = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIndex(idx);
  };

  const handleTryAgain = () => {
    setUserAnswers(Array(questions.length).fill(null));
    setCurrentIndex(0);
    setTimeLeft(duration);
    setPaused(false);
  };

  const handleSubmit = async () => {
  const correct = questions.reduce(
    (c, q, i) => c + (userAnswers[i] === q.answer ? 1 : 0),
    0
  );
  const percent = Math.round((correct / questions.length) * 100);
  const durationUsed = duration - timeLeft;

  const payload: Accomplishment = {
    MinigameId: minigameId ?? "",
    Percent: percent,
    DurationInSecond: durationUsed,
    TakenDate: new Date(),
  };

  const res = await submitAccomplishment(payload);
  if (res) {
    toast.success(`Đã lưu điểm thành công! Bạn đúng ${correct}/${questions.length}.`);
  } else {
    toast.error("Lưu điểm thất bại, vui lòng thử lại.");
  }
};



  const currentQA      = questions[currentIndex];
  const selectedAnswer = userAnswers[currentIndex];

  /* ───── render ───── */
  return (
    <>
    <Header/>
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Nút edit (mở dialog) */}
      

      {/* Khung chơi */}
      <div className="bg-pink-100 border border-gray-300 rounded-md p-6 w-[450px] text-center">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm text-gray-700">
            Time left: <b>{timeLeft}s</b>
          </p>
          <button
            onClick={() => setPaused(p => !p)}
            className="text-sm text-gray-700 hover:text-black flex items-center gap-1"
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
            {paused ? "Resume" : "Pause"}
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-3">{activityName}</h2>

        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 font-semibold min-h-[48px] flex items-center justify-center">
          {currentQA?.question}
        </div>

        <div className="flex justify-center gap-6 mb-4">
          {["True", "False"].map(opt => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt as "True" | "False")}
              className={`px-6 py-2 rounded-full text-black font-semibold border ${
                selectedAnswer === opt
                  ? opt === "True" ? "bg-blue-400" : "bg-red-400"
                  : opt === "True" ? "bg-blue-200 hover:bg-blue-300" : "bg-red-300 hover:bg-red-400"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-3">
          <button onClick={() => goToIndex(currentIndex - 1)} disabled={currentIndex === 0}>
            <ArrowUp size={20} className="text-gray-600 hover:text-black" />
          </button>
          <span className="font-bold">
            {currentIndex + 1} / {questions.length}
          </span>
          <button
            onClick={() => goToIndex(currentIndex + 1)}
            disabled={currentIndex === questions.length - 1}
          >
            <ArrowDown size={20} className="text-gray-600 hover:text-black" />
          </button>
        </div>
      </div>

      {/* Nút điều khiển bên dưới */}
      <div className="flex justify-between w-[500px] mt-10 gap-5">
        <button onClick={handleTryAgain} className="bg-blue-200 hover:bg-blue-300 px-6 py-2 rounded-full">
          Try again
        </button>
        <button onClick={handleSubmit} className="bg-lime-300 hover:bg-lime-400 px-6 py-2 rounded-full">
          Submit
        </button>
      </div>
    </div>
    </>
  );
};

export default PlayTrueFalse;
