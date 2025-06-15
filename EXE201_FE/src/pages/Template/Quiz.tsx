import React, { useState,  } from "react";
import { useNavigate } from "react-router-dom";
import { QuizData, Question } from "../../types";
import { Trash, Copy, Image as ImageIcon } from "lucide-react";
import VoiceInput from "../../components/Conjunction/VoiceInput";
import Header from "../../components/HomePage/Header";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { createQuiz } from "../../services/authService";

interface QuizProps {
    courseId?: string;
}

const Quiz: React.FC<QuizProps> = ({ courseId }) => {
    const [activityName, setActivityName] = useState("");
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const navigate = useNavigate();
    const teacherId = useSelector((state: RootState) => state.user.userId);
    const [duration, setDuration] = useState<number>(60);

    const [questions, setQuestions] = useState<Question[]>([
        { Header: "", Options: ["", ""], AnswerIndexes: [] },
    ]);

    const handleQuestionChange = (index: number, text: string) => {
        const update = [...questions];
        update[index].Header = text;
        setQuestions(update);
    };

    const handleAnswerChange = (questionIndex: number, answerIndex: number, text: string) => {
        const update = [...questions];
        update[questionIndex].Options[answerIndex] = text;
        setQuestions(update);
    };

    const addAnswer = (qIndex: number) => {
        const update = [...questions];
        update[qIndex].Options.push("");
        setQuestions(update);
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { Header: "", Options: ["", ""], AnswerIndexes: [] },
        ]);
    };

    const deleteQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const duplicateQuestion = (index: number) => {
        setQuestions([
            ...questions.slice(0, index + 1),
            {
                ...questions[index],
                Options: [...questions[index].Options],
                AnswerIndexes: [...(questions[index].AnswerIndexes || [])],
            },
            ...questions.slice(index + 1),
        ]);
    };

    // Sửa đổi hàm toggleCorrectAnswer để lưu trữ index + 1
    const toggleCorrectAnswer = (qIndex: number, aIndex: number) => {
        const update = [...questions];
        const correct = update[qIndex].AnswerIndexes || [];
        const answerNumber = aIndex + 1; // Chuyển từ index (0-based) sang number (1-based)
        
        if (correct.includes(answerNumber)) {
            update[qIndex].AnswerIndexes = correct.filter((i) => i !== answerNumber);
        } else {
            update[qIndex].AnswerIndexes = [...correct, answerNumber];
        }
        setQuestions(update);
    };

    const handleSubmit = async () => {
        // Construct MinigameData object
        const minigameData: QuizData = {
            MinigameName: activityName,
            TeacherId: teacherId,
            Duration: duration,
            TemplateId: "TP2",
            CourseId: courseId || "",
            ImageFile: thumbnail || null,
            GameData: questions.map((q) => ({
                Header: q.Header,
                Options: q.Options,
                AnswerIndexes: q.AnswerIndexes || [], // Giữ nguyên vì đã được lưu dưới dạng 1-based
            })),
        };

        const result = await createQuiz(minigameData);
        if (result) {
            navigate("/teacher/activities");
        } else {
            alert("Tạo quiz thất bại!");
        }
    };

    return (
        <>
            <Header />
            <div className="w-[900px] mx-auto mt-25 p-6 space-y-6 bg-white border shadow rounded-md">
                <label className="text-2xl font-bold">Activity name</label>
                <input
                    className="border p-2 w-full rounded"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="Enter activity name"
                />

                {/* Thumbnail Upload */}
                <div className="flex gap-4 mt-4">
                    <div className="flex-1">
                        <label className="block font-medium mb-1">Upload image (optional):</label>
                        <input
                        type="file"
                        className="w-full border border-gray-300 p-2 rounded"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setThumbnail(file);
                        }}
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block font-medium mb-1">Duration (seconds):</label>
                        <input
                        type="number"
                        className="border px-2 py-1 w-32"
                        min={10}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        />
                    </div>
                </div>

                {questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-50 p-4 rounded-md border space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{qIndex + 1}</span>
                            <div className="flex-1 relative">
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="Question"
                                    value={q.Header}
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
                            {q.Options.map((a, aIndex) => (
                                <div key={aIndex} className="relative">
                                    <input
                                        className={`border p-2 rounded w-40 ${
                                            q.AnswerIndexes?.includes(aIndex + 1) // Kiểm tra với aIndex + 1
                                                ? "border-green-500"
                                                : ""
                                        }`}
                                        value={a}
                                        onChange={(e) =>
                                            handleAnswerChange(qIndex, aIndex, e.target.value)
                                        }
                                        placeholder={`Answer ${String.fromCharCode(65 + aIndex)}`}
                                    />
                                    <input
                                        type="checkbox"
                                        className="absolute -top-2 -right-2"
                                        checked={q.AnswerIndexes?.includes(aIndex + 1)} // Kiểm tra với aIndex + 1
                                        onChange={() => toggleCorrectAnswer(qIndex, aIndex)}
                                        title="Mark as correct answer"
                                    />
                                </div>
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
    );
};

export default Quiz;