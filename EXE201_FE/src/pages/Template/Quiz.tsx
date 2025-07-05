import React, { useState, } from "react";
import { useNavigate } from "react-router-dom";
import { QuizData, Question } from "../../types";
import { Trash, Copy, Image as ImageIcon } from "lucide-react";
import VoiceInput from "../../components/Conjunction/VoiceInput";
// import Header from "../../components/HomePage/Header";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { createQuiz } from "../../services/authService";
import { toast } from "react-toastify";

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
            toast.success("Tạo quiz thành công!");
            navigate("/teacher/activities");
        } else {
            alert("Tạo quiz thất bại!");
        }
    };

    return (
        <>
            {/* <Header /> */}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Tạo Quiz Mới
                        </h1>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                    </div>

                    {/* Main Form Container */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                        {/* Activity Settings */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                            <h2 className="text-2xl font-bold mb-4">Cài đặt hoạt động</h2>

                            {/* Activity Name */}
                            <div className="mb-6">
                                <label className="block text-lg font-medium mb-2">Tên hoạt động</label>
                                <input
                                    className="w-full bg-white/90 backdrop-blur-sm border-0 p-3 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white/50 transition-all duration-300"
                                    value={activityName}
                                    onChange={(e) => setActivityName(e.target.value)}
                                    placeholder="Nhập tên hoạt động"
                                />
                            </div>

                            {/* Thumbnail and Duration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-lg font-medium mb-2">Hình ảnh (tùy chọn)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            className="w-full bg-white/90 backdrop-blur-sm border-0 p-3 rounded-lg text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all duration-300"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setThumbnail(file);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-lg font-medium mb-2">Thời gian (giây)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/90 backdrop-blur-sm border-0 p-3 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white/50 transition-all duration-300"
                                        min={10}
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        placeholder="Nhập thời gian"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Questions Section */}
                        <div className="p-6 space-y-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Câu hỏi</h2>

                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                    {/* Question Header */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                                            {qIndex + 1}
                                        </div>

                                        <div className="flex-1 relative">
                                            <input
                                                className="w-full bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                                placeholder="Nhập câu hỏi"
                                                value={q.Header}
                                                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                            />
                                            <div className="absolute right-3 top-3 flex gap-2">
                                                <VoiceInput onResult={(text) => handleQuestionChange(qIndex, text)} />
                                                <button className="p-1 hover:bg-gray-200 rounded transition-colors duration-200">
                                                    <ImageIcon size={18} className="text-gray-500" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => duplicateQuestion(qIndex)}
                                                className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200 hover:scale-105"
                                                title="Sao chép câu hỏi"
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteQuestion(qIndex)}
                                                className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-200 hover:scale-105"
                                                title="Xóa câu hỏi"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Answer Options */}
                                    <div className="ml-12 space-y-3">
                                        <h4 className="font-medium text-gray-700 mb-3">Đáp án:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.Options.map((a, aIndex) => (
                                                <div key={aIndex} className="relative group">
                                                    <input
                                                        className={`w-full p-3 rounded-lg border-2 transition-all duration-300 ${q.AnswerIndexes?.includes(aIndex + 1)
                                                                ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                                                                : "border-gray-300 bg-white hover:border-gray-400"
                                                            }`}
                                                        value={a}
                                                        onChange={(e) =>
                                                            handleAnswerChange(qIndex, aIndex, e.target.value)
                                                        }
                                                        placeholder={`Đáp án ${String.fromCharCode(65 + aIndex)}`}
                                                    />
                                                    <div className="absolute -top-2 -right-2">
                                                        <input
                                                            type="checkbox"
                                                            className="w-5 h-5 text-green-600 bg-white border-2 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                                                            checked={q.AnswerIndexes?.includes(aIndex + 1)}
                                                            onChange={() => toggleCorrectAnswer(qIndex, aIndex)}
                                                            title="Đánh dấu là đáp án đúng"
                                                        />
                                                    </div>
                                                    {q.AnswerIndexes?.includes(aIndex + 1) && (
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">✓</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => addAnswer(qIndex)}
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mt-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                        >
                                            <span className="text-lg">+</span> Thêm đáp án
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                                <button
                                    onClick={addQuestion}
                                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    <span className="text-xl">+</span> Thêm câu hỏi
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    Hoàn thành
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                            <span className="text-sm text-gray-600">Tổng câu hỏi:</span>
                            <span className="font-bold text-blue-600">{questions.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Quiz;