import React, { useState } from "react";
import { Question } from "../../types";
import { Trash, Copy, Image as ImageIcon } from "lucide-react";
import VoiceInput from "../../components/Conjunction/VoiceInput";
import Header from "../../components/HomePage/Header";

const Quiz: React.FC = () => {
    const [activityName, setActivityName] = useState("");
    const [questions, setQuestions] = useState<Question[]>([
        {text: "", answer: ["", ""]},
    ]);

    const handleQuestionChange = (index: number, text: string) => {
        const update = [...questions];
        update[index].text = text;
        setQuestions(update);
    }
    const handleAnswerChange = (questionIndex: number, answerIndex: number, text: string) => {
        const update = [...questions];
        update[questionIndex].answer[answerIndex] = text;
        setQuestions(update);
    }
    const addAnswer = (qIndex: number) =>{
        const update = [...questions];
        update[qIndex].answer.push("");
        setQuestions(update);
    } 
    const addQuestion = () => {
        setQuestions([...questions, {text: "", answer: ["",""]}]);
    }
    const deleteQuestion = (index: number) =>{
        setQuestions(questions.filter((_, i) => i !== index));
    }
    const duplicateQuestion = (index: number) => {
        setQuestions([
            ...questions.slice(0, index + 1),
            {...questions[index], answer: [...questions[index].answer]},
            ...questions.slice(index + 1),
        ]);
    }
    const handleSubmit = () =>{
        console.log("Success");
    }

    return (
        <>
            <Header/>
            <div className="w-[900px] mx-auto mt-25 p-6 space-y-6 bg-white border shadow rounded-md">
                <label className="text-2xl font-bold">Activity name</label>
                <input 
                    className="border p-2 w-full rounded"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="Enter activity name" 
                />
            
            {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-gray-50 p-4 rounded-md border space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{qIndex + 1}</span>
                        <div className="flex-1 relative">
                            <input 
                                className="w-full border rounded px-3 py-2"
                                placeholder="Question"
                                value={q.text}
                                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                            />
                            <div className="absolute right-2 top-2 flex gap-2">
                                <VoiceInput onResult={(text) => handleQuestionChange(qIndex, text)} />
                                <button className="p-1">
                                    <ImageIcon size={18} />
                                </button>
                            </div>
                        </div>
                        <Copy
                            size={20}
                            onClick={() => duplicateQuestion(qIndex)}
                            className="cursor-pointer text-gray-600 hover:text-black"
                        />
                        <Trash
                            size={20}
                            onClick={() => deleteQuestion(qIndex)}
                            className="cursor-pointer text-red-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 pl-6">
                        {q.answer.map((a, aIndex) =>(
                            <input
                                key={aIndex}
                                className="border p-2 rounded w-40"
                                value={a}
                                onChange={(e) => handleAnswerChange(qIndex, aIndex, e.target.value)}
                                placeholder={`Answer ${String.fromCharCode(65 + aIndex)}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={() => addAnswer(qIndex)}
                        className="text-sm text-gray-600 pl-6 hover:underline"
                    >
                        + More answer
                    </button>
                </div>
            ))}
            <div className="flex justify-between items-center">
                <button
                    onClick={addQuestion}
                    className="flex items-center gap-1 bg-yellow-200 text-black font-medium px-4 py-2 rounded"
                >
                    <span className="text-xl">+</span> Add more
                </button>
                <button 
                    onClick={handleSubmit}
                    className="bg-green-400 text-white px-6 py-2 rounded text-lg hover:bg-green-500"
                >
                    Finish
                </button>
            </div>
            </div>
        </>
    )

}
export default Quiz