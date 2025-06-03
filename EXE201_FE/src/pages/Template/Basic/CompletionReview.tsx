import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CompletionReview: React.FC = () => {
  const { state } = useLocation();
  const { activityName, originalSentences, modifiedSentences, options } = state || {};
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<string[][]>(options.map(() => []));
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (modifiedSentences && options) {
      setAnswers(options.map(() => [])); // Reset answers on mount
    }
  }, [modifiedSentences, options]);

  const handleAnswerChange = (sentenceIndex: number, word: string) => {
    const newAnswers = [...answers];
    newAnswers[sentenceIndex] = [word]; // Only one answer per sentence for simplicity
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Add your submission logic here (e.g., validate answers, save to backend)
    console.log("Submitted answers:", answers);
    alert("Answers submitted! Implement your submission logic here.");
  };

  const handleTryAgain = () => {
    navigate("/completion-template");
  };

  if (!modifiedSentences || !options) {
    return <div>No data available. Please go back and try again.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Activity name</h2>
        <input
          type="text"
          value={activityName || ""}
          readOnly
          className="w-full p-2 mb-4 border rounded bg-gray-100"
        />
        {modifiedSentences.map((sentence, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center">
              <span className="mr-2">{index + 1}.</span>
              <span className="flex-1 p-2 border rounded bg-yellow-100 text-gray-700">
                {sentence.split("___").map((part, partIndex, array) => (
                  <span key={partIndex}>
                    {part}
                    {partIndex < array.length - 1 && (
                      <span className="bg-yellow-200 p-1 mx-1 rounded">___</span>
                    )}
                  </span>
                ))}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 ml-6">
              {options[index].map((word, wordIndex) => (
                <button
                  key={wordIndex}
                  onClick={() => handleAnswerChange(index, word)}
                  className={`px-2 py-1 rounded ${
                    answers[index].includes(word)
                      ? "bg-green-400 text-white"
                      : wordIndex === 0 || wordIndex === 1
                      ? "bg-green-200"
                      : wordIndex === 2
                      ? "bg-blue-200"
                      : "bg-orange-200"
                  }`}
                  disabled={submitted}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleTryAgain}
            className="bg-blue-400 text-white px-4 py-2 rounded-full hover:bg-blue-500"
          >
            Try again
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-400 text-black px-4 py-2 rounded-full hover:bg-green-500"
            disabled={submitted}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionReview;