import React, {useState} from "react";
import { Question } from "../../types/index";

const sampleQuestions: Question = {
    text: "What is the capital of France?",
    answer: ["Paris", "London", "Hanoi", "Tokyo"],
}

const correctIndex = 0;
const QuizReview: React.FC = () => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const handleAnswerClick = (index: number) => {
        setSelectedIndex(index);
    };

    return (
        <>
            <div className="w-[900px] mx-auto mt-12 p-6 border rounded-md shadow-md bg-white">
                <div className="bg-gray-300 rounded-2xl h-24 flex items-center justify-center mb-6 text-xl font-semibold px-4 text-center" >
                    {sampleQuestions.text}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {sampleQuestions.answer.map((answer, index) => (
                        <button
                            key={index}
                            className={`p-3 border rounded cursor-pointer transition duration-300 ease-in-out ${
                                selectedIndex === index
                                ? index === correctIndex
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                                    : "bg-pink-50"
                            }`}
                            onClick={() => handleAnswerClick(index)}
                        >
                            {answer}
                        </button>
                    ))}
                </div>
            </div>

        </>
    )
}
export default QuizReview;