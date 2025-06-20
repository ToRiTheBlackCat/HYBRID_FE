import React, { useState } from "react";
import { FaCopy, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { createRestoration } from "../../../services/authService";
import { toast } from "react-toastify";
import { RestorationData } from "../../../types";


const RestorationScreen: React.FC = () => {
  const [activityName, setActivityName] = useState("");
  const [sentences, setSentences] = useState<string[]>([""]);
  const [duration, setDuration] = useState<number>(120);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const teacherId = useSelector((s: RootState) => s.user.userId);

  /*────── handlers ──────*/
  const addSentence = () => setSentences((prev) => [...prev, ""]);
  const changeSentence = (idx: number, val: string) => setSentences((p) => p.map((s, i) => (i === idx ? val : s)));
  const deleteSentence = (idx: number) => setSentences((p) => p.filter((_, i) => i !== idx));
  const copySentence = (idx: number) => navigator.clipboard.writeText(sentences[idx]);

  const handleSubmit = async () => {
    if (!activityName.trim()) return toast.warn("Please enter activity name");
    if (sentences.some((s) => !s.trim())) return toast.warn("Sentences cannot be empty");
    if (!teacherId) return toast.error("Missing teacher id");
    if (!courseId) return toast.error("Missing course id");

    const payload: RestorationData = {
      MinigameName: activityName.trim(),
      TeacherId: teacherId,
      Duration: duration,
      TemplateId: "TP9", // TODO: confirm TemplateId for Restoration
      CourseId: courseId,
      ImageFile: imageFile,
      GameData: sentences.map((s) => ({ words: [s.trim()] })),
    };

    const res = await createRestoration(payload);
    if (res) {
      toast.success("Created successfully");
      navigate(`/teacher/activities`); // adjust route as needed
    } else {
      toast.error("Create failed, please try again");
    }
  };

  /*────── render ──────*/
  return (
    <div className="p-4 w-[900px] mx-auto bg-white border rounded shadow mt-10">
      <label className="block text-lg font-semibold mb-2">Activity name</label>
      <input value={activityName} onChange={(e) => setActivityName(e.target.value)} className="w-full border p-2 mb-4 rounded" placeholder="Enter activity name" />

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Duration (sec)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full border p-2 rounded" />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Thumbnail (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
        </div>
      </div>

      {sentences.map((s, idx) => (
        <div key={idx} className="flex items-center mb-4">
          <span className="w-8 text-sm font-medium">{idx + 1}.</span>
          <input value={s} onChange={(e) => changeSentence(idx, e.target.value)} className="flex-1 border p-2 rounded" placeholder={`Sentence ${idx + 1}`} />
          <button onClick={() => copySentence(idx)} className="ml-2 text-blue-500 hover:text-blue-700"><FaCopy /></button>
          <button onClick={() => deleteSentence(idx)} className="ml-2 text-red-500 hover:text-red-700"><FaTrash /></button>
        </div>
      ))}

      <div className="flex justify-between mt-6">
        <button onClick={addSentence} className="bg-yellow-300 px-4 py-2 rounded hover:bg-yellow-400">+ Add more</button>
        <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Finish</button>
      </div>
    </div>
  );
};

export default RestorationScreen;
