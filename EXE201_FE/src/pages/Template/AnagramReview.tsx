import React, { useState, useEffect } from "react";
import KeywordDragDrop from "../../components/Anagram/DragDrop";
import Header from "../../components/HomePage/Header";
import { fetchPlayMinigames } from "../../services/authService";
import { useParams } from "react-router-dom";
import EditAnagram from "../Teacher/Template/EditAnagram";
import { baseImageUrl } from "../../config/base";
import Anagram from "../Teacher/RawMinigameInfo/Anagram";

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
    words.push(wordElements[i].textContent || "");
  }
  return words;
};

const AnagramReview: React.FC = () => {
  const { minigameId } = useParams();
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
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [activityName, setActivityName] = useState("");
  // const [teacherName, setTeacherName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false); // 👈 NEW STATE

  const normalizeUrl = (base: string, path: string): string =>
    `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  useEffect(() => {
    if (minigameId) {
      fetchPlayMinigames(minigameId).then((res) => {
        const parsedWords = parseXmlWords(res.dataText);
        const thumbnailUrl = res.thumbnailImage ? normalizeUrl(baseImageUrl, res.thumbnailImage) : null;
        setActivityName(res.minigameName);
        setThumbnail(thumbnailUrl);
        setWords(parsedWords);
        setDuration(res.duration || 60);
        setTimer(res.duration || 60);
      });
    }
  }, [minigameId]);

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      const currentWord = words[currentIndex];
      const shuffled = shuffleArray(currentWord.split(""));
      setShuffledLetters(shuffled);
      setDroppedLetters(Object.fromEntries(Array(currentWord.length).fill(null).map((_, idx) => [idx, null])));
      setFeedback(null);
    }
  }, [words, currentIndex]);

  useEffect(() => {
    if (!isPaused && timer > 0 && !finished && isPlaying) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, timer, finished, isPlaying]);

  const handleDrop = (targetIndex: number, keyword: string) => {
    const updated = { ...droppedLetters, [targetIndex]: keyword };
    setDroppedLetters(updated);

    const assembled = Object.values(updated).join("");
    const currentWord = words[currentIndex];

    if (assembled.length === currentWord.length) {
      setFeedback(assembled === currentWord ? "correct" : "incorrect");
    } else {
      setFeedback(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleFinish = () => setFinished(true);

  const handleRetry = () => {
    setDroppedLetters({});
    setCurrentIndex(0);
    setFinished(false);
    setTimer(duration);
    setIsPaused(false);
    setResetCounter((prev) => prev + 1);
    setFeedback(null);
  };

  const togglePause = () => setIsPaused((prev) => !prev);

  const currentWord = words[currentIndex];

  if (words.length === 0) {
    return <div className="text-center mt-10 text-gray-600">Không tìm thấy từ cho hoạt động này.</div>;
  }

  return (
    <>
      <Header />
      {!isPlaying ? (
        <Anagram onStart={() => setIsPlaying(true)}/>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 mt-15">
          <div className="max-w-4xl mx-auto px-4">
            {/* Game Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                {/* Timer Section */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-2 rounded-xl shadow-md">
                    <span className="text-xl">⏰</span>
                    <span className="font-bold text-lg">{timer}s</span>
                  </div>
                  <button 
                    onClick={togglePause} 
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                      isPaused 
                        ? 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600' 
                        : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500'
                    }`}
                  >
                    {isPaused ? "▶️ Resume" : "⏸️ Pause"}
                  </button>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-4 py-2 rounded-xl shadow-md">
                    <span className="font-bold">{currentIndex + 1} / {words.length}</span>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Edit Section */}
              <EditAnagram
                initialActivityName={activityName}
                initialDuration={duration}
                initialWords={words}
                initialThumbnailUrl={thumbnail}
                onSave={(data) => {
                  setWords(data.words);
                  setDuration(data.duration);
                }}
              />
            </div>

            {/* Main Game Area */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              {/* Scrambled Word Display */}
              <div className="text-center mb-8">
                <h2 className="text-gray-600 text-lg font-medium mb-4">Sắp xếp lại các chữ cái:</h2>
                <div className="flex justify-center items-center gap-3 mb-6">
                  {currentWord.split("").map((letter, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      {letter.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer Slots */}
              <div className="text-center mb-8">
                <h3 className="text-gray-600 text-lg font-medium mb-4">Đáp án của bạn:</h3>
                <div className="flex justify-center gap-3 mb-6">
                  {currentWord.split("").map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-14 h-14 border-2 border-dashed rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                        droppedLetters[idx] 
                          ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-green-700' 
                          : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {droppedLetters[idx]?.toUpperCase() || ""}
                    </div>
                  ))}
                </div>
              </div>

              {/* Drag and Drop Area */}
              <div className="mb-8">
                <KeywordDragDrop
                  keywords={shuffledLetters}
                  targets={currentWord.split("")}
                  droppedKeywords={droppedLetters}
                  onDrop={handleDrop}
                  direction="horizontal"
                  paused={isPaused}
                  resetTrigger={resetCounter}
                />
              </div>

              {/* Feedback */}
              {feedback === "correct" && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-3 rounded-2xl shadow-lg animate-bounce">
                    <span className="text-2xl">🎉</span>
                    <span className="text-lg font-bold">Chính xác! Tuyệt vời!</span>
                  </div>
                </div>
              )}
              {feedback === "incorrect" && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-400 to-red-500 text-white px-6 py-3 rounded-2xl shadow-lg animate-pulse">
                    <span className="text-2xl">❌</span>
                    <span className="text-lg font-bold">Sai rồi! Thử lại nhé!</span>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex justify-center items-center gap-6 mb-8">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span className="text-lg">←</span>
                  <span>Trước</span>
                </button>

                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-md border">
                  <span className="text-gray-600">Câu</span>
                  <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {currentIndex + 1}
                  </span>
                  <span className="text-gray-600">trên</span>
                  <span className="font-bold text-lg">{words.length}</span>
                </div>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === words.length - 1}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span>Sau</span>
                  <span className="text-lg">→</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                {!finished ? (
                  <button 
                    onClick={handleFinish} 
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="text-xl">🏁</span>
                    <span>Hoàn thành</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleRetry} 
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="text-xl">🔄</span>
                    <span>Thử lại</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AnagramReview;
