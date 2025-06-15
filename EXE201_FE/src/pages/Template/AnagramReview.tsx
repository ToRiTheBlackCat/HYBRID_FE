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

  // if (!isPlaying) {
  //   return (
  //     <>
  //       <Header />
  //       <div className="max-w-2xl mx-auto mt-20 border rounded-lg bg-white p-6 shadow">
  //         <div className="flex gap-6">
  //           <img src={thumbnail || "/default-thumbnail.png"} alt="thumbnail" className="w-40 h-40 rounded-lg object-cover" />
  //           <div className="flex flex-col justify-center gap-2">
  //             <h1 className="text-2xl font-bold">{activityName}</h1>
  //             <p className="text-gray-600">👨‍🏫 {teacherName}</p>
  //             <p className="text-gray-600">⏱ Duration: {duration}s</p>
  //             <button
  //               className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
  //               onClick={() => setIsPlaying(true)}
  //             >
  //               ▶️ Play Now
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     </>
  //   );
  // }

  if (words.length === 0) {
    return <div className="text-center mt-10 text-gray-600">Không tìm thấy từ cho hoạt động này.</div>;
  }

  return (
    <>
      <Header />
      {!isPlaying ? (
        <Anagram onStart={() => setIsPlaying(true)}/>
      ):
      <div className="border rounded-lg p-6 w-full max-w-3xl mx-auto mt-20 bg-pink-50">
        <div className="flex justify-between mb-4 text-lg font-medium">
          <div>⏰ Thời gian còn lại: {timer}s</div>
          <button onClick={togglePause} className="bg-gray-400 px-3 py-1 rounded text-white">
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>

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

        <div className="text-center text-2xl mb-6 font-semibold tracking-wide">
          {currentWord.split("").map((letter, idx) => (
            <span key={idx} className="inline-block mx-2 font-mono">
              {letter}
            </span>
          ))}
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {currentWord.split("").map((_, idx) => (
            <div
              key={idx}
              className="w-10 h-10 border border-black rounded flex items-center justify-center text-xl bg-white"
            >
              {droppedLetters[idx] || ""}
            </div>
          ))}
        </div>

        <KeywordDragDrop
          keywords={shuffledLetters}
          targets={currentWord.split("")}
          droppedKeywords={droppedLetters}
          onDrop={handleDrop}
          direction="horizontal"
          paused={isPaused}
          resetTrigger={resetCounter}
        />

        {feedback === "correct" && (
          <div className="text-green-600 text-center text-lg font-semibold mt-4">✅ Chính xác!</div>
        )}
        {feedback === "incorrect" && (
          <div className="text-red-600 text-center text-lg font-semibold mt-4">❌ Sai rồi!</div>
        )}

        <div className="flex justify-center items-center gap-4 mt-8 text-lg font-medium">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            ←
          </button>
          <span>
            {currentIndex + 1} / {words.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === words.length - 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            →
          </button>
        </div>

        <div className="flex justify-center gap-6 mt-6">
          {!finished ? (
            <button onClick={handleFinish} className="bg-blue-500 text-white px-4 py-2 rounded">
              Finish
            </button>
          ) : (
            <button onClick={handleRetry} className="bg-yellow-500 text-white px-4 py-2 rounded">
              Try Again
            </button>
          )}
        </div>
      </div>
}
    </>
  );
};

export default AnagramReview;
