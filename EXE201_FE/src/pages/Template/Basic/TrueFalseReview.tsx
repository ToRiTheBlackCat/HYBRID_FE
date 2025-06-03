import React, { useState } from 'react';

interface QuestionAnswer {
  question: string;
  answer: 'True' | 'False';
}

const sampleData: QuestionAnswer[] = [
  { question: 'I do my homework yesterday.', answer: 'False' },
  { question: 'She went to school.', answer: 'True' },
  // thêm dữ liệu nếu cần
];

const TrueFalseReview: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(Array(sampleData.length).fill(null));

  const currentQA = sampleData[currentIndex];
  const selectedAnswer = userAnswers[currentIndex];

  const handleAnswer = (value: 'True' | 'False') => {
    const updated = [...userAnswers];
    updated[currentIndex] = value;
    setUserAnswers(updated);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < sampleData.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleTryAgain = () => {
    setUserAnswers(Array(sampleData.length).fill(null));
    setCurrentIndex(0);
  };

  const handleSubmit = () => {
    const correct = sampleData.reduce(
      (count, q, idx) => count + (userAnswers[idx] === q.answer ? 1 : 0),
      0
    );
    alert(`You got ${correct}/${sampleData.length} correct!`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="bg-pink-100 border border-gray-300 rounded-md p-6 w-[400px] text-center">
        <h2 className="text-lg font-semibold mb-4">Is this sentence correct ?</h2>

        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-6 font-semibold">
          {currentQA.question}
        </div>

        <div className="flex justify-center gap-6 mb-6">
          <button
            onClick={() => handleAnswer('True')}
            className={`px-6 py-2 rounded-full text-black font-semibold border ${
              selectedAnswer === 'True' ? 'bg-blue-400' : 'bg-blue-200 hover:bg-blue-300'
            }`}
          >
            True
          </button>

          <button
            onClick={() => handleAnswer('False')}
            className={`px-6 py-2 rounded-full text-black font-semibold border ${
              selectedAnswer === 'False' ? 'bg-red-400' : 'bg-red-300 hover:bg-red-400'
            }`}
          >
            False
          </button>
        </div>

        <div className="flex items-center justify-center text-xl font-bold gap-2">
          <button onClick={handlePrev} disabled={currentIndex === 0}>
            ⬅
          </button>
          <span>{`${currentIndex + 1}/${sampleData.length}`}</span>
          <button onClick={handleNext} disabled={currentIndex === sampleData.length - 1}>
            ➡
          </button>
        </div>
      </div>

      <div className="flex justify-between w-[300px] mt-10">
        <button
          onClick={handleTryAgain}
          className="bg-blue-200 hover:bg-blue-300 text-black px-6 py-2 rounded-full font-medium"
        >
          Try again
        </button>
        <button
          onClick={handleSubmit}
          className="bg-lime-300 hover:bg-lime-400 text-black px-6 py-2 rounded-full font-medium"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default TrueFalseReview;
