import React, { useEffect, useState } from "react";
import { Copy, Trash } from "lucide-react";
// import Header from "../../components/HomePage/Header";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { createAnagram } from "../../services/authService";
import { Anagram } from "../../types/index";

interface AnagramEntry {
  word: string;
}
interface AnagramTemplateProps {
  courseId?: string;  
}

const AnagramTemplate: React.FC<AnagramTemplateProps> = ({courseId}) => {

  const [activityName, setActivityNameLocal] = useState("");
  const [entries, setEntries] = useState<AnagramEntry[]>([{ word: "" }]);
  const navigate = useNavigate();
  const teacherId = useSelector((state: RootState) => state.user.userId);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(60);
  const [gameDataJson, setGameDataJson] = useState("");

  const handleChange = (index: number, value: string) => {
    const updated = [...entries];
    updated[index].word = value;
    setEntries(updated);
  };
  const generateGameDataJson = (data: AnagramEntry[]) => {
      const validEntries = data.filter(e => e.word); // Lọc các entry hợp lệ
      const jsonArray = validEntries.map(entry => ({
        Word: entry.word.trim() // Chỉ lấy từ đã nhập, loại bỏ khoảng trắng
      }));
      return JSON.stringify(jsonArray, null, 2); // Trả về mảng JSON
    };
  useEffect(() => {
      setGameDataJson(generateGameDataJson(entries));
    }, [entries]);

  const addEntry = () => {
    setEntries([...entries, { word: "" }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const duplicateEntry = (index: number) => {
    const newEntry = { ...entries[index] };
    setEntries([
      ...entries.slice(0, index + 1),
      newEntry,
      ...entries.slice(index + 1),
    ]);
  };

  const handleFinish = async () => {
    if (!activityName || entries.some((e) => !e.word)) {
      alert("Please complete all fields");
      return;
    }

    // const words = entries.map((e) => e.word.trim());
    const anagramData: Anagram = {
      MinigameName: activityName,
      ImageFile: imageFile,
      GameDataJson: gameDataJson,
      TeacherId: teacherId,
      Duration: duration,
      TemplateId: "TP3", 
      CourseId: courseId || "",
    };
    console.log("Anagram data to be sent:", anagramData);

    const result = await createAnagram(anagramData);

    if (result) {
      navigate("/teacher/activities");
    } else {
      alert("Failed to create anagram activity");
    }
  };

  return (
    <>
    {/* <Header /> */}
    <div className="border p-4 rounded-md w-full max-w-3xl mx-auto mt-25">
      <h2 className="text-xl font-bold mb-3">Activity name</h2>
      <input
        type="text"
        className="w-full border px-2 py-1 mb-4"
        placeholder="Enter activity name"
        value={activityName}
        onChange={(e) => setActivityNameLocal(e.target.value)}
      />

      {entries.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 mb-3">
          <div className="w-6 text-right">{index + 1}.</div>
          <input
            type="text"
            className="flex-grow border px-2 py-1"
            placeholder="Word"
            value={entry.word}
            onChange={(e) => handleChange(index, e.target.value)}
          />
          <button onClick={() => duplicateEntry(index)}><Copy /></button>
          <button onClick={() => removeEntry(index)}><Trash /></button>
        </div>
      ))}

      <button
        onClick={addEntry}
        className="mt-2 bg-yellow-100 px-3 py-1 rounded hover:bg-yellow-200 flex items-center gap-1"
      >
        ➕ Add more
      </button>
      <div className="flex gap-4 mt-4">
        <div className="flex-1">
            <label className="block font-medium mb-1">Upload image (optional):</label>
            <input
              type="file"
              className="w-full border border-gray-300 p-2 rounded"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImageFile(file);
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

      <div className="mt-4 text-right">
        <button
          onClick={handleFinish}
          className="bg-lime-400 hover:bg-lime-500 text-white px-4 py-2 rounded"
        >
          Finish
        </button>
      </div>
    </div>
    </>
  );
};

export default AnagramTemplate;
