import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { updateCrossword } from "../../../services/authService";
import { toast } from "react-toastify";
import { baseImageUrl } from "../../../config/base";

interface CrosswordData {
  Words: string[];
  Clues: string[];
  DimensionSize: number;
}

interface EditCrosswordProps {
  initialActivityName: string;
  initialDuration: number;
  initialGameData: CrosswordData[];
  initialThumbnailUrl?: string | null;
  onSave: (data: {
    activityName: string;
    duration: number;
    gameData: CrosswordData[];
    thumbnailUrl: string | null;
  }) => void;
}

const EditCrossword: React.FC<EditCrosswordProps> = ({
  initialActivityName,
  initialDuration,
  initialGameData,
  initialThumbnailUrl,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration] = useState(initialDuration);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [gameData, setGameData] = useState<CrosswordData[]>([]);

  const teacherId = useSelector((state: RootState) => state.user.userId);
  const { minigameId } = useParams<{ minigameId: string }>();

  useEffect(() => {
    setGameData(
      initialGameData.length > 0
        ? initialGameData
        : [{ Words: [""], Clues: [""], DimensionSize: 15 }]
    );
  }, [initialGameData]);

  const normalizeUrl = (base: string, path: string): string => {
    return `${base.replace(/\/+$|^\/+/, "")}/${path.replace(/^\/+/g, "")}`;
  };

  const openModal = () => {
    setActivityName(initialActivityName);
    setDuration(initialDuration);
    setThumbnail(null);
    setGameData(
      initialGameData.length > 0
        ? initialGameData
        : [{ Words: [""], Clues: [""], DimensionSize: 15 }]
    );
    setIsOpen(true);
  };

  const handleChange = (index: number, type: "word" | "clue", value: string) => {
    const updated = [...gameData];
    if (type === "word") updated[0].Words[index] = value;
    else updated[0].Clues[index] = value;
    setGameData(updated);
  };

  const handleAddEntry = () => {
    const updated = [...gameData];
    updated[0].Words.push("");
    updated[0].Clues.push("");
    setGameData(updated);
  };

  const handleRemoveEntry = (index: number) => {
    const updated = [...gameData];
    updated[0].Words.splice(index, 1);
    updated[0].Clues.splice(index, 1);
    setGameData(updated);
  };

  const moveEntry = (index: number, direction: "up" | "down") => {
    const updated = [...gameData];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= updated[0].Words.length) return;
    [updated[0].Words[index], updated[0].Words[newIndex]] = [
      updated[0].Words[newIndex],
      updated[0].Words[index],
    ];
    [updated[0].Clues[index], updated[0].Clues[newIndex]] = [
      updated[0].Clues[newIndex],
      updated[0].Clues[index],
    ];
    setGameData(updated);
  };

  const handleFinishEdit = async () => {
    if (!activityName || duration <= 0 || gameData.length === 0) {
      alert("Vui lòng nhập đủ thông tin hợp lệ.");
      return;
    }
    if (!teacherId || !minigameId) {
      alert("Thiếu thông tin giáo viên hoặc minigameId.");
      return;
    }

    try {
      const crosswordData = {
        MinigameId: minigameId,
        MinigameName: activityName,
        ImageFile: thumbnail,
        ImageUrl: !thumbnail && initialThumbnailUrl ? initialThumbnailUrl : undefined,
        Duration: duration,
        TeacherId: teacherId,
        GameData: gameData,
      };

      const result = await updateCrossword(crosswordData);

      if (result) {
        const finalThumbnailUrl = result.thumbnailImage
          ? normalizeUrl(baseImageUrl, result.thumbnailImage)
          : thumbnail
          ? URL.createObjectURL(thumbnail)
          : initialThumbnailUrl ?? null;

        onSave({ activityName, duration, gameData, thumbnailUrl: finalThumbnailUrl });
        toast.success("Crossword updated successfully!");
        window.location.reload();
        setIsOpen(false);
      } else {
        toast.error("Failed to update crossword.");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error updating crossword.");
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
      >
        ✏️ Edit Crossword
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl rounded-lg bg-white p-6 border shadow-lg space-y-4">
            <Dialog.Title className="text-xl font-bold text-center">Edit Crossword</Dialog.Title>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Enter activity name"
              className="w-full border px-3 py-2 rounded"
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-semibold mb-1">Thumbnail</label>
                {thumbnail ? (
                  <img
                    src={URL.createObjectURL(thumbnail)}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded mb-2 border"
                  />
                ) : initialThumbnailUrl ? (
                  <img
                    src={initialThumbnailUrl}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded mb-2 border"
                  />
                ) : null}
                <input type="file" onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>

            <table className="w-full border border-gray-300 rounded bg-gray-50 text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="w-10 px-2 py-2 text-center">#</th>
                  <th className="px-4 py-2">Answer</th>
                  <th className="px-4 py-2">Clue</th>
                  <th className="w-28 px-2 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gameData[0]?.Words.map((word, i) => (
                  <tr key={i} className="border-b">
                    <td className="text-center text-gray-600">{i + 1}.</td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={word}
                        onChange={(e) => handleChange(i, "word", e.target.value)}
                        className="w-full border px-2 py-1 rounded"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        value={gameData[0]?.Clues[i] || ""}
                        onChange={(e) => handleChange(i, "clue", e.target.value)}
                        className="w-full border px-2 py-1 rounded"
                      />
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => moveEntry(i, "up")} disabled={i === 0}>↑</button>
                        <button onClick={() => moveEntry(i, "down")} disabled={i === gameData[0].Words.length - 1}>↓</button>
                        <button onClick={() => handleRemoveEntry(i)} className="text-red-500">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={handleAddEntry}
              className="mt-3 bg-yellow-100 hover:bg-yellow-200 text-black px-3 py-1 rounded"
            >
              ➕ Add more
            </button>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleFinishEdit}
                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
              >
                ✅ Finish
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default EditCrossword;
