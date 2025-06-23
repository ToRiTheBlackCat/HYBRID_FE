import React, { useEffect, useState, useRef } from "react";
import { fetchPlayMinigames, submitAccomplishment, fetchCourseMinigame } from "../.././../services/authService";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/HomePage/Header";
import { Accomplishment, Minigame } from "../../../types";
import { baseImageUrl } from "../../../config/base";
import { toast } from "react-toastify";

interface ParsedQuestion {
  text: string;
  answer: string[];
  correctIndex: number;
}

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

const PlayQuiz: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();

  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndexes, setSelectedIndexes] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // Khởi tạo bằng 0, sẽ được cập nhật trong loadData
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialDurationRef = useRef<number>(0);


  const loadData = async () => {
    try {
      const res = await fetchPlayMinigames(minigameId!);
      const parsed = parseXMLData(res.dataText);
      initialDurationRef.current = res.duration || 60;
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
  const sendResult = async (correctCnt: number) => {
    if (!minigameId) return;
    const percent = Math.round((correctCnt / questions.length) * 100);
    const used = initialDurationRef.current - timeLeft;

    const payload: Accomplishment = {
      MinigameId: minigameId,
      Percent: percent,
      DurationInSecond: used < 0 ? 0 : used,
      TakenDate: new Date(),
    };
    const result = await submitAccomplishment(payload);
    if(result){
      toast.success(`Submit successfully. You got ${percent} points`);
    }
  };

  const handleFinish = () => {
    if (paused) return;
    const correct = questions.reduce((cnt, q, i) => {
      return cnt + (selectedIndexes[i] === q.correctIndex ? 1 : 0);
    }, 0);
    setScore(correct);
    setShowResult(true);
    clearInterval(timerRef.current!);
    sendResult(correct)
  };

  const handleTryAgain = () => {
    setSelectedIndexes(Array(questions.length).fill(null));
    setCurrentIndex(0);
    setShowResult(false);
    setScore(0);
    setTimeLeft(initialDurationRef.current); // Đặt lại timeLeft bằng duration
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
                disabled={showResult || paused}
              >
                {answer}
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentIndex === 0 || paused}
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
                  disabled={currentIndex === questions.length - 1 || paused}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={handleFinish}
                  disabled={paused}
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
}
export default PlayQuiz