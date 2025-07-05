import React, { useEffect, useState, useRef } from "react";
import { fetchPlayMinigames } from "../../services/authService";
import { useParams } from "react-router-dom";
import Header from "../../components/HomePage/Header";
import EditQuiz from "../Teacher/Template/EditQuiz";
import { baseImageUrl } from "../../config/base";
import Quiz from "../Teacher/RawMinigameInfo/Quiz";

interface ParsedQuestion {
  text: string;
  answer: string[];
  correctIndex: number;
}

const QuizReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // Khởi tạo bằng 0, sẽ được cập nhật trong loadData
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activityName, setActivityName] = useState("");
  const [duration, setDuration] = useState(60);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const normalizeUrl = (base: string, path: string): string => {
    return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  const loadData = async () => {
    try {
      const res = await fetchPlayMinigames(minigameId!);
      const parsed = parseXMLData(res.dataText);
      const thumbnailUrl = res.thumbnailImage
        ? normalizeUrl(baseImageUrl, res.thumbnailImage)
        : null;
      setActivityName(res.minigameName);
      setThumbnailUrl(thumbnailUrl);
      setDuration(res.duration);
      setTimeLeft(res.duration); // Đồng bộ timeLeft với duration
      setQuestions(parsed);
      setSelectedIndexes(Array(parsed.length).fill(null));
    } catch (err) {
      console.error("Failed to load quiz:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [minigameId]);

  useEffect(() => {
    if (paused || showResult || timeLeft === 0) return; // Không chạy timer nếu chưa có duration

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [paused, showResult, timeLeft]);

  const parseXMLData = (xmlString: string): ParsedQuestion[] => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    const questionNodes = Array.from(xml.querySelectorAll("question"));

    return questionNodes.map((node) => {
      const text = node.querySelector("header")?.textContent?.trim() || "";
      const options = Array.from(node.querySelectorAll("options")).map((el) =>
        el.textContent?.trim() || ""
      );
      const correctIndex =
        parseInt(node.querySelector("answers")?.textContent?.trim() || "1") - 1;
      return { text, answer: options, correctIndex };
    });
  };

  const handleSelectAnswer = (index: number) => {
    if (paused || showResult) return;
    const updated = [...selectedIndexes];
    updated[currentIndex] = index;
    setSelectedIndexes(updated);
  };

  const handleFinish = () => {
    if (paused) return;
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (selectedIndexes[i] === q.correctIndex) correctCount++;
    });
    setScore(correctCount);
    setShowResult(true);
    clearInterval(timerRef.current!);
  };

  const handleTryAgain = () => {
    setSelectedIndexes(Array(questions.length).fill(null));
    setCurrentIndex(0);
    setShowResult(false);
    setScore(0);
    setTimeLeft(duration); // Đặt lại timeLeft bằng duration
    setPaused(false);
  };

  const togglePause = () => setPaused((prev) => !prev);

  if (!questions.length) return <p className="text-center mt-12">Loading questions...</p>;

  const currentQuestion = questions[currentIndex];
  const selected = selectedIndexes[currentIndex];

  return (
    <>
    <Header />
    {!isPlaying?(
      <Quiz onStart={() => setIsPlaying(true)}/>
    ):
      
      <div className="w-[900px] mx-auto mt-20 p-8 border-0 rounded-3xl shadow-2xl bg-gradient-to-br from-white via-blue-50 to-indigo-100 backdrop-blur-sm">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              ⏱ Time left: {timeLeft}s
            </div>
          </div>
          <button
            onClick={togglePause}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            {paused ? "▶️ Resume" : "⏸️ Pause"}
          </button>
        </div>

        <EditQuiz
          initialActivityName={activityName}
          initialQuestions={questions.map((q) => ({
            question: q.text,
            options: q.answer,
            correctAnswerIndexes: [q.correctIndex + 1], // Chuyển sang 1-based
          }))}
          initialDuration={duration}
          initialThumbnailUrl={thumbnailUrl}
          onSave={(data) => {
            setActivityName(data.activityName);
            setDuration(data.duration);
            setThumbnailUrl(data.thumbnail ? URL.createObjectURL(data.thumbnail) : thumbnailUrl);
            setQuestions(
              data.questions.map((q) => ({
                text: q.question,
                answer: q.options,
                correctIndex: q.correctAnswerIndexes[0] - 1, // Chuyển về 0-based
              }))
            );
          }}
          onRefresh={loadData} // Truyền hàm loadData
        />

        {/* Question Display */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-1 shadow-xl">
            <div className="bg-white rounded-3xl p-8 h-32 flex items-center justify-center">
              <div className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
                {currentQuestion.text}
              </div>
            </div>
          </div>
          {/* Question Number Badge */}
          <div className="absolute -top-4 -right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
            {currentIndex + 1}
          </div>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {currentQuestion.answer.map((answer, index) => {
            const isSelected = selected === index;
            const isCorrect = index === currentQuestion.correctIndex;
            const showColor =
              showResult && isSelected
                ? isCorrect
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200"
                  : "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-200"
                : isSelected
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-200"
                : "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-blue-300";

            return (
              <button
                key={index}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${showColor} shadow-lg font-semibold text-lg min-h-[80px] flex items-center justify-center text-center`}
                onClick={() => handleSelectAnswer(index)}
                disabled={showResult || paused}
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {answer}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation and Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            disabled={currentIndex === 0 || paused}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:from-gray-500 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
          >
            ← Prev
          </button>

          <div className="flex items-center gap-6">
            {showResult ? (
              <>
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    🎉 Score: {score} / {questions.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    ({Math.round((score / questions.length) * 100)}%)
                  </div>
                </div>
                <button
                  onClick={handleTryAgain}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  🔄 Try Again
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="flex gap-1">
                    {questions.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-3 h-3 rounded-full ${
                          idx === currentIndex 
                            ? 'bg-blue-500' 
                            : idx < currentIndex 
                              ? 'bg-green-500' 
                              : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium ml-2">
                    {currentIndex + 1} / {questions.length}
                  </span>
                </div>
                <button
                  disabled={currentIndex === questions.length - 1 || paused}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  Next →
                </button>
                <button
                  onClick={handleFinish}
                  disabled={paused}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                >
                  ✅ Finish
                </button>
              </>
            )}
          </div>
        </div>
      </div>
}
    </>
  );
};

export default QuizReview;