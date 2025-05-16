import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import KeywordDragDrop from "../../components/Anagram/DragDrop";
import Header from "../../components/HomePage/Header";

const shuffleArray = (array: string[]) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const AnagramReview: React.FC = () => {
  const words = useSelector((state: RootState) => state.anagram.words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [droppedLetters, setDroppedLetters] = useState<{ [index: number]: string | null }>({});

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      const currentWord = words[currentIndex];
      const shuffled = shuffleArray(currentWord.split(""));
      setShuffledLetters(shuffled);
      // Khởi tạo droppedLetters với các giá trị null
      setDroppedLetters(
        Object.fromEntries(
          Array(currentWord.length)
            .fill(null)
            .map((_, idx) => [idx, null])
        )
      );
    } else {
      setShuffledLetters([]);
      setDroppedLetters({});
    }
  }, [words, currentIndex]);

  const handleDrop = (targetIndex: number, keyword: string) => {
    setDroppedLetters((prev) => ({ ...prev, [targetIndex]: keyword }));
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (words.length === 0) {
    return <div className="text-center mt-10 text-gray-600">Không tìm thấy từ cho hoạt động này.</div>;
  }

  const currentWord = words[currentIndex]

  return (
    <>
      <Header />
      <div className="border rounded-lg p-6 w-full max-w-3xl mx-auto mt-20 bg-pink-50">
        {/* Hiển thị chữ cái xáo trộn */}
        <div className="text-center text-2xl mb-6 font-semibold tracking-wide">
          {currentWord.split("").map((letter, idx) => (
            <span key={idx} className="inline-block mx-2 font-mono">
              {letter}
            </span>
          ))}
        </div>

        {/* Các ô trống để thả chữ cái */}
        <div className="flex justify-center gap-2 mb-6">
          {words[currentIndex].split("").map((_, idx) => (
            <div
              key={idx}
              className="w-10 h-10 border border-black rounded flex items-center justify-center text-xl bg-white"
            >
              {droppedLetters[idx] || ""}
            </div>
          ))}
        </div>

        {/* Component kéo thả */}
        <KeywordDragDrop
          keywords={shuffledLetters}
          targets={words[currentIndex].split("")}
          droppedKeywords={droppedLetters}
          onDrop={handleDrop}
          direction="horizontal"
        />

        {/* Nút điều hướng */}
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
      </div>
    </>
  );
};

export default AnagramReview;