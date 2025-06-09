import React, { useEffect, useState, useRef } from "react";
import { fetchPlayMinigames } from "../../services/authService";
import { useParams } from "react-router-dom";
import Header from "../../components/HomePage/Header";

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
  const [timeLeft, setTimeLeft] = useState(60);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchPlayMinigames(minigameId!);
        const parsed = parseXMLData(res.dataText);
        setQuestions(parsed);
        setSelectedIndexes(Array(parsed.length).fill(null));
      } catch (err) {
        console.error("Failed to load quiz:", err);
      }
    };
    loadData();
  }, [minigameId]);

  useEffect(() => {
    if (paused || showResult) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(timerRef.current!);
          handleFinish();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [paused, showResult]);

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
    if (paused || showResult) return; // 🔒 Disable interaction when paused or finished
    const updated = [...selectedIndexes];
    updated[currentIndex] = index;
    setSelectedIndexes(updated);
  };

  const handleFinish = () => {
    if (paused) return; // 🔒 Prevent finish while paused
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
    setTimeLeft(60);
    setPaused(false);
  };

  const togglePause = () => setPaused((prev) => !prev);

  if (!questions.length) return <p className="text-center mt-12">Loading questions...</p>;

  const currentQuestion = questions[currentIndex];
  const selected = selectedIndexes[currentIndex];

  return (
    <>
    <Header />
    <div className="w-[900px] mx-auto mt-25 p-6 border rounded-md shadow-md bg-white">
      <div className="flex justify-between mb-4">
        <div className="text-lg font-medium">⏱ Time left: {timeLeft}s</div>
        <button
          onClick={togglePause}
          className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white"
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      <div className="bg-gray-300 rounded-2xl h-24 flex items-center justify-center mb-6 text-xl font-semibold px-4 text-center">
        {currentQuestion.text}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {currentQuestion.answer.map((answer, index) => {
          const isSelected = selected === index;
          const isCorrect = index === currentQuestion.correctIndex;
          const showColor =
            showResult && isSelected
              ? isCorrect
                ? "bg-green-500 text-white"
                : "bg-red-400 text-white"
              : isSelected
              ? "bg-blue-400 text-white"
              : "bg-pink-50 hover:bg-pink-100";

          return (
            <button
              key={index}
              className={`p-3 border rounded cursor-pointer transition duration-300 ease-in-out ${showColor}`}
              onClick={() => handleSelectAnswer(index)}
              disabled={showResult || paused} // 🔒 Disable on pause
            >
              {answer}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={currentIndex === 0 || paused} // 🔒 Disable Prev
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>

        <div className="flex gap-4">
          {showResult ? (
            <>
              <div className="text-lg font-semibold text-green-600">
                ✅ Score: {score} / {questions.length}
              </div>
              <button
                onClick={handleTryAgain}
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <button
                disabled={currentIndex === questions.length - 1 || paused} // 🔒 Disable Next
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={handleFinish}
                disabled={paused} // 🔒 Disable Finish
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                Finish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default QuizReview;
