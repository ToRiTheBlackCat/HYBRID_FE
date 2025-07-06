import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchPlayMinigames } from "../../../services/authService";
import { ArrowUp, ArrowDown, Pause, Play, Clock, Check, X, RotateCcw } from "lucide-react";
import EditTrueFalse from "../../Teacher/Template/EditTrueFalse";
import { baseImageUrl } from "../../../config/base";
import TrueFalseRaw from "../../Teacher/RawMinigameInfo/TrueFalse";
import Header from "../../../components/HomePage/Header";

interface QuestionAnswer {
  question: string;
  answer: "True" | "False";
}
type TFEntry = { statement: string; answer: boolean };

const TrueFalseReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();

  /* ───── state cho phần chơi ───── */
  const [questions, setQuestions]   = useState<QuestionAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers]   = useState<(string | null)[]>([]);
  const [duration, setDuration]         = useState(0);
  const [timeLeft, setTimeLeft]         = useState(0);
  const [paused, setPaused]             = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  /* ───── state bổ sung để truyền vào EditTrueFalse ───── */
  const [activityName, setActivityName]     = useState("");
  const [thumbnailUrl, setThumbnailUrl]     = useState<string | null>(null);
  const [tfItems, setTfItems]               = useState<TFEntry[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ───── load dữ liệu minigame ───── */
  useEffect(() => {
    if (!minigameId) return;

    (async () => {
      const data = await fetchPlayMinigames(minigameId);
      if (!data) return;

      /* Giả định api trả về field MinigameName & ThumbnailUrl */
      setActivityName(data.minigameName);
      const finalUrl = baseImageUrl + data.thumbnailImage
      setThumbnailUrl(finalUrl);

      const parsedXML = parseQuestions(data.dataText);
      setQuestions(parsedXML);
      setTfItems(parsedXML.map(q => ({
        statement: q.question,
        answer:    q.answer === "True",
      })));

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

  const handleSubmit = () => {
    const correct = questions.reduce((c, q, i) => c + (userAnswers[i] === q.answer ? 1 : 0), 0);
    alert(`You got ${correct}/${questions.length} correct!`);
  };

  /* ───── callback từ EditTrueFalse ───── */
  const handleSaveEdit = ({
    activityName: newName,
    duration: newDur,
    items: newItems,
    thumbnailUrl: newThumb,
  }: {
    activityName: string;
    duration: number;
    items: TFEntry[];
    thumbnailUrl: string | null;
  }) => {
    setActivityName(newName);
    setDuration(newDur);
    setTimeLeft(newDur);
    setThumbnailUrl(newThumb?.startsWith("http") ? newThumb : newThumb ? baseImageUrl + newThumb : null);
    setTfItems(newItems);

    /* chuyển TFEntry → QuestionAnswer + reset đáp án */
    const qs = newItems.map(i => ({
      question: i.statement,
      answer:   (i.answer ? "True" : "False") as "True" | "False",
    }));
    setQuestions(qs);
    setUserAnswers(Array(qs.length).fill(null));
    setCurrentIndex(0);
  };

  const currentQA      = questions[currentIndex];
  const selectedAnswer = userAnswers[currentIndex];
  const answeredCount  = userAnswers.filter(a => a !== null).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time warning color
  const getTimeColor = () => {
    if (timeLeft <= 30) return 'text-red-500';
    if (timeLeft <= 60) return 'text-orange-500';
    return 'text-green-600';
  };

  /* ───── render ───── */
  return (
    <>
      <Header/>
      {!isPlaying ? (
        <TrueFalseRaw onStart={() => setIsPlaying(true)}/>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 mt-20">
          <div className="max-w-4xl mx-auto px-4">
            
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                
                {/* Activity Info */}
                <div className="flex items-center gap-4">
                  {thumbnailUrl && (
                    <img 
                      src={thumbnailUrl} 
                      alt="Activity thumbnail" 
                      className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">{activityName}</h1>
                    <p className="text-gray-600 text-sm">True/False Quiz</p>
                  </div>
                </div>

                {/* Timer and Controls */}
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border ${getTimeColor()}`}>
                    <Clock size={18} />
                    <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
                  </div>
                  <button
                    onClick={() => setPaused(p => !p)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      paused 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {paused ? <Play size={18} /> : <Pause size={18} />}
                    {paused ? "Resume" : "Pause"}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress: {answeredCount}/{questions.length} questions</span>
                  <span>{Math.round(progressPercentage)}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Main Quiz Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              
              {/* Question Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-blue-100 font-medium">Question {currentIndex + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToIndex(currentIndex - 1)}
                      disabled={currentIndex === 0}
                      className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUp size={20} />
                    </button>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      {currentIndex + 1} / {questions.length}
                    </span>
                    <button
                      onClick={() => goToIndex(currentIndex + 1)}
                      disabled={currentIndex === questions.length - 1}
                      className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowDown size={20} />
                    </button>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold leading-relaxed">
                  {currentQA?.question}
                </h2>
              </div>

              {/* Answer Section */}
              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
                  
                  {/* True Button */}
                  <button
                    onClick={() => handleAnswer("True")}
                    className={`group relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 ${
                      selectedAnswer === "True"
                        ? "border-green-500 bg-green-50 shadow-lg scale-105"
                        : "border-green-200 bg-green-50/50 hover:bg-green-50 hover:border-green-300 hover:scale-102"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className={`p-2 rounded-full transition-colors ${
                        selectedAnswer === "True" ? "bg-green-500 text-white" : "bg-green-200 text-green-700"
                      }`}>
                        <Check size={20} />
                      </div>
                      <span className="text-xl font-bold text-green-800">True</span>
                    </div>
                    {selectedAnswer === "True" && (
                      <div className="absolute inset-0 bg-green-500/10 animate-pulse" />
                    )}
                  </button>

                  {/* False Button */}
                  <button
                    onClick={() => handleAnswer("False")}
                    className={`group relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-300 ${
                      selectedAnswer === "False"
                        ? "border-red-500 bg-red-50 shadow-lg scale-105"
                        : "border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-300 hover:scale-102"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className={`p-2 rounded-full transition-colors ${
                        selectedAnswer === "False" ? "bg-red-500 text-white" : "bg-red-200 text-red-700"
                      }`}>
                        <X size={20} />
                      </div>
                      <span className="text-xl font-bold text-red-800">False</span>
                    </div>
                    {selectedAnswer === "False" && (
                      <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                    )}
                  </button>
                </div>

                {/* Answer Status */}
                {selectedAnswer && (
                  <div className="mt-6 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      selectedAnswer === "True" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {selectedAnswer === "True" ? <Check size={16} /> : <X size={16} />}
                      You answered: {selectedAnswer}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={handleTryAgain}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all hover:scale-105"
              >
                <RotateCcw size={18} />
                Try Again
              </button>
              
              <button
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
              >
                <Check size={18} />
                Submit Quiz
              </button>
              
              <div className="flex items-center justify-center">
                <EditTrueFalse
                  initialActivityName  = {activityName}
                  initialDuration      = {duration}
                  initialItems         = {tfItems}
                  initialThumbnailUrl  = {thumbnailUrl}
                  onSave               = {handleSaveEdit}
                />
              </div>
            </div>

            {/* Question Navigation Pills */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Navigation</h3>
              <div className="flex flex-wrap gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToIndex(idx)}
                    className={`w-10 h-10 rounded-full font-medium transition-all ${
                      idx === currentIndex
                        ? "bg-blue-500 text-white shadow-lg"
                        : userAnswers[idx] !== null
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TrueFalseReview;