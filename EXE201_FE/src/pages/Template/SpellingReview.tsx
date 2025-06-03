import React, { useState } from "react";
import { toast } from "react-toastify";
import BearImage from "../../assets/AIImg.jpg" 
import Header from "../../components/HomePage/Header";

const SpellingReview: React.FC = () => {
  const correctWord = "BEAR";
  const [letters, setLetters] = useState<string[]>(Array(correctWord.length).fill(""));

  const handleInputChange = (index: number, value: string) => {
    // Only allow single letters (A-Z) and convert to uppercase
    const newLetters = [...letters];
    if (value.length <= 1 && /^[A-Za-z]?$/.test(value)) {
      newLetters[index] = value.toUpperCase();
      setLetters(newLetters);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userWord = letters.join("");
    if (userWord === correctWord) {
      toast.success("Correct! The word is BEAR.");
    } else {
      toast.error("Incorrect. Try again!");
    }
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center">Spelling Review</h2>
        {/* Image */}
        <div className="flex justify-center mb-6">
          <img src={BearImage} alt="Bear" className="w-32 h-32 object-cover rounded-lg" />
        </div>
        {/* Input Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="flex gap-2 mb-6">
            {letters.map((letter, index) => (
              <input
                key={index}
                type="text"
                value={letter}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className="w-12 h-12 text-center text-2xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                maxLength={1}
                placeholder="_"
              />
            ))}
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full max-w-xs bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg"
          >
            Check Answer
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default SpellingReview;