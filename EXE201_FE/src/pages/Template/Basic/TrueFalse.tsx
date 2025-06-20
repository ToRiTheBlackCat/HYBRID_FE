import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { createTrueFalse } from "../../../services/authService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { toast } from "react-toastify";

interface QuestionAnswer {
  question: string;
  answer: "True" | "False";
}

const TrueFalse: React.FC = () => {
  /* ───── local state ───── */
  const [activityName, setActivityName] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [questionsAnswers, setQuestionsAnswers] = useState<QuestionAnswer[]>([
    { question: "", answer: "True" },
  ]);

  /* ───── global / route ───── */
  const teacherId = useSelector((s: RootState) => s.user.userId);
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  /* ───── handlers ───── */
  const handleAddMore = () => setQuestionsAnswers((p) => [...p, { question: "", answer: "True" }]);

  const handleQuestionChange = (idx: number, val: string) =>
    setQuestionsAnswers((p) => p.map((q, i) => (i === idx ? { ...q, question: val } : q)));

  const handleAnswerChange = (idx: number, val: "True" | "False") =>
    setQuestionsAnswers((p) => p.map((q, i) => (i === idx ? { ...q, answer: val } : q)));

  const handleDelete = (idx: number) => setQuestionsAnswers((p) => p.filter((_, i) => i !== idx));

  const handleChooseFile = (f: File | null) => {
    setImageFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  };

  /* ───── submit ───── */
  const handleSubmit = async () => {
    if (!teacherId || !courseId) return alert("Thiếu TeacherId hoặc CourseId");
    if (!activityName.trim()) return alert("Nhập tên activity");

    const payload = {
      MinigameName: activityName.trim(),
      TeacherId: teacherId,
      Duration: duration,
      CourseId: courseId,
      ImageFile: imageFile ?? null,
      GameData: questionsAnswers.map((qa) => ({
        Statement: [qa.question.trim()],
        Answer: qa.answer === "True",
      })),
    } as const;

    const ok = await createTrueFalse(payload);
    if (ok) {
      toast.success("Tạo minigame thành công!");
      navigate("/teacher/activities");
    } else {
      toast.error("Tạo minigame thất bại!");
    }
  };

  /* ───── render ───── */
  return (
    <div className="p-4 w-[900px] mt-25 mb-30 mx-auto bg-white border rounded shadow">
      {/* name */}
      <label className="block text-lg font-semibold mb-2">Activity name</label>
      <input
        value={activityName}
        onChange={(e) => setActivityName(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        placeholder="Enter activity name"
      />

      {/* thumbnail & duration */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Thumbnail</label>
          <input type="file" accept="image/*" onChange={(e) => handleChooseFile(e.target.files?.[0] || null)} className="border p-2 rounded w-full" />
          {previewUrl && <img src={previewUrl} alt="preview" className="mt-2 h-24 object-cover rounded" />}
        </div>
        <div className="w-40">
          <label className="block font-semibold mb-1">Duration (sec)</label>
          <input type="number" min={10} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="border p-2 rounded w-full" />
        </div>
      </div>

      {/* questions */}
      <div className="mb-4">
        <div className="flex justify-between mb-2 font-semibold">
          <span>Questions</span>
          <span>Answer</span>
        </div>
        {questionsAnswers.map((qa, idx) => (
          <div key={idx} className="flex items-center mb-2">
            <span className="w-8 text-sm font-medium">{idx + 1}.</span>
            <input
              value={qa.question}
              onChange={(e) => handleQuestionChange(idx, e.target.value)}
              className="flex-1 border p-2 rounded mr-2"
              placeholder={`Question ${idx + 1}`}
            />
            <select value={qa.answer} onChange={(e) => handleAnswerChange(idx, e.target.value as "True" | "False")} className="border p-2 rounded w-32">
              <option value="True">True</option>
              <option value="False">False</option>
            </select>
            <button onClick={() => handleDelete(idx)} className="ml-2 text-red-500 hover:text-red-700"><FaTrash className="h-5 w-5" /></button>
          </div>
        ))}
      </div>

      {/* actions */}
      <div className="flex justify-between mt-4">
        <button onClick={handleAddMore} className="bg-yellow-300 text-black px-4 py-2 rounded hover:bg-yellow-400">+ Add more</button>
        <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Finish</button>
      </div>
    </div>
  );
};

export default TrueFalse;
