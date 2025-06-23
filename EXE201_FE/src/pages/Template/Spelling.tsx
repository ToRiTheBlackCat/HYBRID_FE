import React, { useState } from "react";
import { SpellingItem } from "../../types/common";
import { useNavigate } from "react-router-dom";
// import Header from "../../components/HomePage/Header";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { createSpelling } from "../../services/authService";
import { toast } from "react-toastify";

interface SpellingProps {
  courseId?: string;
}

const Spelling: React.FC<SpellingProps> = ({ courseId }) => {
    const [activityName, setActivityName] = useState<string>("");
    const [mode, setMode] = useState<"none" | "voice" | "qa">("none");
    const [inputWord, setInputWord] = useState([""]);
    const [items, setItems] = useState<SpellingItem[]>([
        { Word: "", Image: null },
    ]);
    const [duration, setDuration] = useState(0);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const teacherId = useSelector((state: RootState) => state.user.userId);

    const navigate = useNavigate();
    const handleThumbnail = (f: File | null) => setThumbnail(f);

    const handleChangeWord = (index: number, value: string) => {
        const updated = [...items];
        updated[index].Word = value;
        setItems(updated);
    };

    const handleFileChange = (index: number, file: File | null) => {
        const updated = [...items];
        updated[index].Image = file;
        setItems(updated);
    };

    const handleAddItem = () => {
        setItems([...items, { Word: "", Image: null }]);
    };

    const handleRemoveItem = (idx: number) => {
        setItems(items.filter((_, i) => i !== idx));
    };

    /* voice‑mode words */
    const handleInputWord = (i: number, val: string) => {
        const words = [...inputWord];
        words[i] = val;
        setInputWord(words);
    };

    const handleFinish = async () => {
        try{
            const spellingData = {
                MinigameName: activityName,
                TeacherId: teacherId,
                Duration: duration.toString(),
                TemplateId: "TP5",
                CourseId: courseId ?? "",
                ImageFile: thumbnail,
                GameData: mode === "voice" ? inputWord.map((word) =>({
                    Word: word,
                    ImagePath:null,
                    Image: null,
                }))
                :items,
            };
            await createSpelling(spellingData);
            toast.success("Create successfully")
            navigate("/teacher/activities");
        } catch(error){
            toast.error("Failed to create spelling activity");
            console.log(error);
        }
    }

    return (
        <>
        {/* <Header /> */}

        <div className="w-[900px] mx-auto mt-25 p-6 border rounded-md shadow-md bg-white">
            <h2 className="text-2xl font-bold mb-4">Spelling Activity</h2>

            {/* activity name */}
            <input
                className="w-full mt-2 p-2 border rounded mb-4"
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="Enter activity name"
            />
            <div className="flex gap-6 mb-6">
                {/* Duration */}
                <div className="flex-1">
                    <label className="block font-semibold mb-1">Duration (seconds)</label>
                    <input
                    type="number"
                    min={0}
                    className="w-full p-2 border rounded"
                    placeholder="e.g. 60"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    />
                </div>

                {/* Thumbnail */}
                <div className="flex-1">
                    <label className="block font-semibold mb-1">Thumbnail</label>
                    <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnail(e.target.files?.[0] ?? null)}
                    className="block"
                    />
                    {thumbnail && (
                    <img
                        src={URL.createObjectURL(thumbnail)}
                        alt="thumbnail preview"
                        className="h-20 w-20 object-cover rounded mt-2"
                    />
                    )}
                </div>
            </div>

            <div className="mb-6 flex gap-6">
            {(["voice", "qa"] as const).map((m) => (
                <label key={m}>
                <input
                    type="radio"
                    name="mode"
                    value={m}
                    checked={mode === m}
                    onChange={() => setMode(m)}
                />
                <span className="ml-2">
                    {m === "voice" ? "Use Voice" : "Use Word + Image"}
                </span>
                </label>
            ))}
            </div>

            {mode === "voice" && (
            <div className="space-y-2">
                {inputWord.map((val, idx) => (
                <div key={idx} className="flex items-center mb-2">
                    <p className="mb-2 font-semibold mr-5">{idx + 1}</p>

                    <input
                    type="text"
                    value={val}
                    onChange={(e) => handleInputWord(idx, e.target.value)}
                    placeholder={`Word ${idx + 1}`}
                    className="w-full p-2 border rounded mr-2 mb-2"
                    />

                    {inputWord.length > 1 && (
                    <button
                        type="button"
                        onClick={() =>
                        setInputWord(inputWord.filter((_, i) => i !== idx))
                        }
                        className="text-red-500 hover:text-red-700"
                    >
                        🗑
                    </button>
                    )}
                </div>
                ))}
            </div>
            )}

            {/* ───────── QA mode (Word + Image) ───────── */}
            {mode === "qa" &&
            items.map((it, idx) => (
                <div
                key={idx}
                className="border p-4 mb-4 rounded relative space-y-2"
                >
                <p className="font-semibold mb-1">Item {idx + 1}</p>

                {/* Word */}
                <input
                    type="text"
                    placeholder="Word"
                    value={it.Word}
                    onChange={(e) => handleChangeWord(idx, e.target.value)}
                    className="w-full p-2 border rounded"
                />

                {/* Image upload */}
                <div className="flex items-center gap-4 mt-2">
                    <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        handleFileChange(idx, e.target.files?.[0] ?? null)
                    }
                    />
                    {it.Image && (
                    <img
                        src={URL.createObjectURL(it.Image)}
                        alt="preview"
                        className="h-16 w-16 object-cover rounded"
                    />
                    )}
                </div>

                {/* delete btn */}
                {items.length > 1 && (
                    <button
                    onClick={() => handleRemoveItem(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                    🗑
                    </button>
                )}
                </div>
            ))}

            <div className="flex justify-between mt-4">
            <button
                onClick={
                mode === "voice"
                    ? () => setInputWord([...inputWord, ""])
                    : handleAddItem
                }
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                + Add more
            </button>

            <button
                onClick={handleFinish}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
                Finish
            </button>
            </div>
        </div>
        </>
  );
};

export default Spelling;
