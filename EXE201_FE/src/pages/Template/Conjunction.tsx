import React, { useState, useEffect } from "react";
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
  const [Entries, setEntries] = useState<ConjunctionEntry[]>([{ keyword: "", meaning: "" }]); // Dùng để nhập keyword và meaning
  // const [GameData] = useState<ConjunctionEntry[]>([]); // GameData luôn rỗng
  const [ImageFile, setImageFile] = useState<File | null>(null);
  const [GameDataJson, setGameDataJson] = useState("");
  const [Duration, setDuration] = useState(0);
  const teacherId = useSelector((state: RootState) => state.user.userId); // Lấy TeacherId từ Redux store

  const navigate = useNavigate();

  // Tạo GameDataJson dưới dạng mảng từ các entry hợp lệ của Entries
  const generateGameDataJson = (data: ConjunctionEntry[]) => {
    const validEntries = data.filter(e => e.keyword && e.meaning); // Lọc các entry hợp lệ
    const jsonArray = validEntries.map(entry => ({
      Term: entry.keyword,
      Definition: entry.meaning
    }));
    return JSON.stringify(jsonArray, null, 2); // Trả về mảng JSON
  };

  // Cập nhật GameDataJson khi Entries thay đổi
  useEffect(() => {
    setGameDataJson(generateGameDataJson(Entries));
  }, [Entries]);

  const handleChange = (index: number, field: keyof ConjunctionEntry, value: string) => {
    const updated = [...Entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...Entries, { keyword: "", meaning: "" }]);
  };

  const removeEntry = (index: number) => {
    const updated = Entries.filter((_, i) => i !== index);
    setEntries(updated.length > 0 ? updated : [{ keyword: "", meaning: "" }]); // Đảm bảo không rỗng
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
    // Lọc bỏ các entry rỗng trong Entries để kiểm tra validation
    const validEntries = Entries.filter(e => e.keyword && e.meaning);

    if (
      !MinigameName ||
      validEntries.length === 0 || // Đảm bảo có ít nhất một entry hợp lệ
      !ImageFile ||
      !GameDataJson ||
      Duration <= 0
    ) {
      alert("Please fill in all fields with valid data.");
      return;
    }

    const conjunctionData = {
      MinigameName: MinigameName,
      ImageFile: ImageFile,
      TeacherId: teacherId,
      GameDataJson: GameDataJson,
      Duration: Duration,
      TemplateId: "TP1",
      CourseId: courseId,
      // GameData: GameData, // GameData là mảng rỗng
    };

    try {
      const response = await createConjunction(conjunctionData);
      if (response) {
        toast.success("Minigame created successfully!");
        navigate("/teacher/accomplishments");
      } else {
        toast.error("Failed to create minigame. Please check the console for more details.");
      }
    } catch (error) {
      console.error("Error creating conjunction:", error);
      toast.error("An error occurred while creating the minigame. Please try again later.");
    }
  };

  return (
    <>
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

              {/* Keyword */}
              <input
                type="text"
                className="border border-gray-300 p-2 rounded w-1/3"
                placeholder="Keyword"
                value={entry.keyword}
                onChange={(e) => handleChange(index, "keyword", e.target.value)}
              />
              <div className="flex gap-1">
                <VoiceInput onResult={(value) => handleChange(index, "keyword", value)} />
                <button className="p-1">
                  <ImageIcon size={18} />
                </button>
              </div>

              {/* Meaning */}
              <input
                type="text"
                className="border border-gray-300 p-2 rounded w-1/3"
                placeholder="Meaning"
                value={entry.meaning}
                onChange={(e) => handleChange(index, "meaning", e.target.value)}
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
    </>
  );
};

export default ConjunctionTemplate;