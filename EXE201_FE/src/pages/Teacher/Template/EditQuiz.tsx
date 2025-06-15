import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { editQuiz } from "../../../services/authService";
import { Trash, Plus } from "lucide-react";

type QuizEntry = {
  question: string;
  options: string[];
  correctAnswerIndexes: number[]; // Chỉ số bắt đầu từ 1
};

type EditQuizProps = {
  initialActivityName: string;
  initialDuration: number;
  initialQuestions: QuizEntry[];
  initialThumbnailUrl?: string | null;
  onSave: (data: {
    activityName: string;
    duration: number;
    questions: QuizEntry[];
    thumbnail: File | null;
  }) => void;
  onRefresh?: () => Promise<void>;
};

const EditQuiz: React.FC<EditQuizProps> = ({
  initialActivityName,
  initialDuration,
  initialQuestions,
  initialThumbnailUrl,
  onSave,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration] = useState(initialDuration);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [questions, setQuestions] = useState<QuizEntry[]>(initialQuestions);
  const [isLoading, setIsLoading] = useState(false);

  const teacherId = useSelector((state: RootState) => state.user.userId);
  const { minigameId } = useParams<{ minigameId: string }>();

  const openModal = () => {
    setActivityName(initialActivityName);
    setDuration(initialDuration);
    setThumbnail(null);
    setQuestions(initialQuestions);
    setIsOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswerIndexes: [],
      },
    ]);
  };

  const handleChangeQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleChangeOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleAddOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.push("");
    setQuestions(updated);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options.splice(optionIndex, 1);
      // Cập nhật correctAnswerIndexes (đảm bảo 1-based index)
      updated[questionIndex].correctAnswerIndexes = updated[questionIndex].correctAnswerIndexes
        .filter((idx) => idx !== optionIndex + 1) // Loại bỏ chỉ số bị xóa
        .map((idx) => (idx > optionIndex + 1 ? idx - 1 : idx)); // Điều chỉnh các chỉ số lớn hơn
      setQuestions(updated);
    }
  };

  const handleToggleCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const answerNumber = optionIndex + 1; // Chuyển sang 1-based index
    const correctIndexes = updated[questionIndex].correctAnswerIndexes;

    if (correctIndexes.includes(answerNumber)) {
      updated[questionIndex].correctAnswerIndexes = correctIndexes.filter((idx) => idx !== answerNumber);
    } else {
      updated[questionIndex].correctAnswerIndexes = [...correctIndexes, answerNumber];
    }
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      const updated = [...questions];
      updated.splice(index, 1);
      setQuestions(updated);
    }
  };

  const handleSave = async () => {
    // Validation
    if (activityName.trim() === "") {
      alert("Activity name cannot be empty");
      return;
    }
    if (questions.length === 0) {
      alert("At least one question is required");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.question.trim() === "") {
        alert(`Question ${i + 1} cannot be empty`);
        return;
      }
      if (q.options.some((opt) => opt.trim() === "")) {
        alert(`All options for question ${i + 1} must be filled`);
        return;
      }
      if (q.correctAnswerIndexes.length === 0) {
        alert(`Question ${i + 1} must have at least one correct answer`);
        return;
      }
    }

    if (!minigameId) {
      alert("Minigame ID is missing");
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        MinigameId: minigameId,
        MinigameName: activityName,
        Duration: duration,
        TemplateId: "TP2",
        TeacherId: teacherId,
        ImageFile: thumbnail,
        ImageUrl: initialThumbnailUrl,
        GameData: questions.map((q) => ({
          Header: q.question,
          Options: q.options,
          AnswerIndexes: q.correctAnswerIndexes, // Đã là 1-based
        })),
      };
      console.log("Quiz data to be sent:", updateData);

      const result = await editQuiz(updateData);

      if (result) {
        onSave({
          activityName,
          duration,
          questions,
          thumbnail,
        });
        if (onRefresh) {
          await onRefresh(); // Gọi hàm tải lại dữ liệu
        }
        setIsOpen(false);
        alert("Quiz updated successfully!");
      } else {
        alert("Failed to update quiz. Please try again.");
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      alert("An error occurred while updating the quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 rounded bg-blue-400 hover:bg-blue-500 text-white font-semibold"
      >
        ✏️ Edit Quiz
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
        <div className="fixed inset-0 bg-black bg-opacity-30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold mb-4">Edit Quiz</Dialog.Title>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Activity Name</label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Enter activity name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  min="10"
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Upload New Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setThumbnail(file);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {initialThumbnailUrl && (
                <p className="text-sm text-gray-500 mt-1">Current image will be kept if no new image is uploaded</p>
              )}
            </div>

            {/* Questions */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3">Questions</h3>
              {questions.map((q, questionIndex) => (
                <div key={questionIndex} className="border border-gray-200 rounded p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Question {questionIndex + 1}</label>
                    <button
                      onClick={() => handleRemoveQuestion(questionIndex)}
                      className="text-red-500 hover:text-red-700"
                      disabled={questions.length <= 1}
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => handleChangeQuestion(questionIndex, e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                    placeholder="Enter question"
                  />

                  <div className="space-y-2">
                    {q.options.map((opt, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={q.correctAnswerIndexes.includes(optionIndex + 1)} // Kiểm tra với 1-based index
                          onChange={() => handleToggleCorrectAnswer(questionIndex, optionIndex)}
                          className="w-4 h-4"
                          title="Mark as correct answer"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleChangeOption(questionIndex, optionIndex, e.target.value)}
                          className={`flex-1 border rounded px-3 py-2 ${
                            q.correctAnswerIndexes.includes(optionIndex + 1)
                              ? "border-green-500 bg-green-50"
                              : "border-gray-300"
                          }`}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        />
                        {q.options.length > 2 && (
                          <button
                            onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => handleAddOption(questionIndex)}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Option
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddQuestion}
                className="bg-yellow-200 text-black px-4 py-2 rounded hover:bg-yellow-300 flex items-center gap-2"
              >
                <Plus size={16} /> Add Question
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default EditQuiz;