import React, { useState } from "react";
import { Plus, Trash2, Copy, Image as ImageIcon } from "lucide-react";
import VoiceInput from "../../components/Conjunction/VoiceInput";
import { ConjunctionEntry } from "../../types/index";
import { useNavigate } from "react-router-dom";
import { createConjunction } from "../../services/authService";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface ConjunctionTemplateProps {
  courseId: string;
}

const ConjunctionTemplate: React.FC<ConjunctionTemplateProps> = ({ courseId }) => {
  const [MinigameName, setMinigameName] = useState("");
  const [Entries, setEntries] = useState<ConjunctionEntry[]>([{ Term: "", Definition: "" }]);
  const [ImageFile, setImageFile] = useState<File | null>(null);
  const [Duration, setDuration] = useState(0);

  const teacherId = useSelector((state: RootState) => state.user.userId);
  const navigate = useNavigate();

  const handleChange = (index: number, field: keyof ConjunctionEntry, value: string) => {
    const updated = [...Entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...Entries, { Term: "", Definition: "" }]);
  };

  const removeEntry = (index: number) => {
    const updated = Entries.filter((_, i) => i !== index);
    setEntries(updated.length > 0 ? updated : [{ Term: "", Definition: "" }]);
  };

  const duplicateEntry = (index: number) => {
    const newEntry = { ...Entries[index] };
    setEntries([...Entries.slice(0, index + 1), newEntry, ...Entries.slice(index + 1)]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleFinish = async () => {
    const validEntries = Entries.filter((e) => e.Term && e.Definition);

    if (!MinigameName || validEntries.length === 0 || !ImageFile || Duration <= 0) {
      alert("Please fill in all fields with valid data.");
      return;
    }

    const conjunctionData = {
      MinigameName,
      ImageFile,
      TeacherId: teacherId,
      Duration,
      TemplateId: "TP1",
      CourseId: courseId,
      GameData: validEntries.map((entry) => ({
        Term: entry.Term,
        Definition: entry.Definition,
      })),
    };

    try {
      const response = await createConjunction(conjunctionData); // Truyền đúng kiểu `ConjunctionRequest`
      if (response) {
        toast.success("Minigame created successfully!");
        navigate("/teacher/activities");
      } else {
        toast.error("Failed to create minigame.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    }
  };


  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4 mt-20 border rounded-lg shadow-lg bg-white">
      <button className="bg-green-200 text-black px-4 py-1 rounded-full">Back</button>

      <h1 className="text-2xl font-bold">Activity name</h1>
      <input
        type="text"
        className="w-full border border-gray-300 p-2 rounded"
        placeholder="Enter activity name"
        value={MinigameName}
        onChange={(e) => setMinigameName(e.target.value)}
      />

      <div className="flex gap-4 mt-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Thumbnail</h1>
          <input
            type="file"
            accept="image/*"
            className="w-full border border-gray-300 p-2 rounded"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-bold">Duration</h1>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full border border-gray-300 p-2 rounded"
            placeholder="Enter duration (in seconds)"
            value={Duration || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) setDuration(value === "" ? 0 : parseInt(value));
            }}
          />
        </div>
      </div>

      <h1 className="text-xl font-bold mt-4">Entries</h1>
      <div className="space-y-4">
        {Entries.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-5">{index + 1}.</span>

            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-1/3"
              placeholder="Term"
              value={entry.Term}
              onChange={(e) => handleChange(index, "Term", e.target.value)}
            />
            <div className="flex gap-1">
              <VoiceInput onResult={(value) => handleChange(index, "Term", value)} />
              <button className="p-1"><ImageIcon size={18} /></button>
            </div>

            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-1/3"
              placeholder="Definition"
              value={entry.Definition}
              onChange={(e) => handleChange(index, "Definition", e.target.value)}
            />

            <button className="p-1" onClick={() => duplicateEntry(index)}>
              <Copy size={18} />
            </button>
            <button className="p-1" onClick={() => removeEntry(index)}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addEntry}
        className="flex items-center gap-2 bg-yellow-100 text-black px-4 py-2 rounded mt-2"
      >
        <Plus size={18} /> Add more
      </button>

      <div className="flex justify-end">
        <button
          onClick={handleFinish}
          className="bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default ConjunctionTemplate;
