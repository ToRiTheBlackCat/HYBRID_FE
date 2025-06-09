import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { ConjunctionEntry } from "../../../types/index";
import { editConjunction, fetchImageUrlAsFile } from "../../../services/authService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { baseImageUrl } from "../../../config/base";

type EditConjunctionProps = {
  initialActivityName: string;
  initialDuration: number;
  initialEntries: ConjunctionEntry[];
  initialThumbnailUrl?: string | null;
  onSave: (data: {
    activityName: string;
    duration: number;
    entries: ConjunctionEntry[];
    thumbnailUrl: string | null;
  }) => void;
};

const EditConjunction: React.FC<EditConjunctionProps> = ({
  initialActivityName,
  initialDuration,
  initialEntries,
  initialThumbnailUrl,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration] = useState(initialDuration);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [entries, setEntries] = useState<ConjunctionEntry[]>(initialEntries);

  const teacherId = useSelector((state: RootState) => state.user.userId);
  const { minigameId } = useParams<{ minigameId: string }>();

  const normalizeUrl = (base: string, path: string): string => {
    return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  const openModal = () => {
    setActivityName(initialActivityName);
    setDuration(initialDuration);
    setThumbnail(null);
    setEntries(initialEntries);
    setIsOpen(true);
  };

  const handleAddEntry = () => {
    setEntries([...entries, { Term: "", Definition: "" }]);
  };

  const handleChangeEntry = (index: number, field: "Term" | "Definition", value: string) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const handleRemoveEntry = (index: number) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const handleFinishEdit = async () => {
    const validEntries = entries.filter((e) => e.Term && e.Definition);

    if (!activityName || validEntries.length === 0 || duration <= 0) {
      alert("Please fill in all fields with valid data.");
      return;
    }
    if (!teacherId || !minigameId) {
      alert("Missing teacherId or minigameId.");
      return;
    }

    let finalThumbnailFile: File = new File([], ""); // Default empty file
    let finalThumbnailUrl: string | null = null;

    if (thumbnail) {
      finalThumbnailFile = thumbnail;
      finalThumbnailUrl = URL.createObjectURL(thumbnail);
    } else if (initialThumbnailUrl) {
      try {
        const filename = `thumbnail-${minigameId}.jpg`;
        finalThumbnailFile = await fetchImageUrlAsFile(initialThumbnailUrl, filename);
        finalThumbnailUrl = initialThumbnailUrl;
      } catch (error) {
        console.error("❌ Failed to convert URL to File:", error);
        toast.error("Thumbnail fetch failed.");
        return;
      }
    }

    const conjunctionData = {
      MinigameId: minigameId,
      MinigameName: activityName,
      ImageFile: finalThumbnailFile,
      Duration: duration,
      TemplateId: "TP1",
      TeacherId: teacherId,
      GameData: validEntries.map((entry) => ({
        Term: entry.Term,
        Definition: entry.Definition,
      })),
    };

    const result = await editConjunction(conjunctionData);

    if (result) {
      finalThumbnailUrl = result.thumbnailImage
        ? normalizeUrl(baseImageUrl, result.thumbnailImage)
        : finalThumbnailUrl;

      onSave({
        activityName,
        duration,
        entries: validEntries,
        thumbnailUrl: finalThumbnailUrl,
      });

      toast.success("Minigame updated successfully!");
      setIsOpen(false);
    } else {
      toast.error("Failed to update minigame.");
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
      >
        ✏️ Edit Minigame
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 border shadow-lg space-y-4">
            <Dialog.Title className="text-xl font-bold text-center">Edit Minigame</Dialog.Title>

            <div className="space-y-3">
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
                  {(thumbnail || initialThumbnailUrl) && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">Current thumbnail:</p>
                      <img
                        src={thumbnail ? URL.createObjectURL(thumbnail) : initialThumbnailUrl || ""}
                        alt="Current thumbnail"
                        className="w-20 h-20 object-cover rounded"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Duration</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    placeholder="Enter duration (in seconds)"
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold">Entries</label>
                {entries.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 my-2">
                    <input
                      type="text"
                      value={entry.Term}
                      onChange={(e) => handleChangeEntry(index, "Term", e.target.value)}
                      placeholder="Term"
                      className="flex-1 border px-2 py-1 rounded"
                    />
                    <input
                      type="text"
                      value={entry.Definition}
                      onChange={(e) => handleChangeEntry(index, "Definition", e.target.value)}
                      placeholder="Meaning"
                      className="flex-1 border px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => handleRemoveEntry(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddEntry}
                  className="mt-2 bg-yellow-100 hover:bg-yellow-200 text-black px-3 py-1 rounded"
                >
                  ➕ Add more
                </button>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinishEdit}
                  className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                >
                  ✅ Finish
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default EditConjunction;
