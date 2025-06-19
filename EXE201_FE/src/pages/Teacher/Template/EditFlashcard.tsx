import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useParams } from "react-router-dom";
import { updateFlashCard } from "../../../services/authService";
import { toast } from "react-toastify";

type FlashcardEntry = {
  front: string;
  back: string;
};

type EditFlashcardProps = {
  initialActivityName: string;
  initialDuration: number;
  initialPairs: FlashcardEntry[];
  initialThumbnailUrl?: string | null;
  onSave: (data: {
    activityName: string;
    duration: number;
    pairs: FlashcardEntry[];
    thumbnail: File | null;
  }) => void;
};

const EditFlashcard: React.FC<EditFlashcardProps> = ({
  initialActivityName,
  initialDuration,
  initialPairs,
  initialThumbnailUrl,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration] = useState(initialDuration);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [pairs, setPairs] = useState<FlashcardEntry[]>(initialPairs);

  const teacherId = useSelector((state: RootState) => state.user.userId);
  const { minigameId } = useParams<{ minigameId: string }>();

  const openModal = () => {
    setActivityName(initialActivityName);
    setDuration(initialDuration);
    setThumbnail(null);
    setPairs(initialPairs);
    setIsOpen(true);
  };

  const handleAddPair = () => {
    setPairs([...pairs, { front: "", back: "" }]);
  };

  const handleChangePair = (index: number, field: "front" | "back", value: string) => {
    const updated = [...pairs];
    updated[index][field] = value;
    setPairs(updated);
  };

  const handleRemovePair = (index: number) => {
    const updated = [...pairs];
    updated.splice(index, 1);
    setPairs(updated);
  };

  const handleFinishEdit = async () => {
    if (!minigameId || !teacherId) {
      console.error("Missing minigameId or teacherId");
      return;
    }

    const updateData = {
      MinigameId: minigameId,
      MinigameName: activityName,
      ImageFile: thumbnail,
      ImageUrl: initialThumbnailUrl,
      Duration: duration,
      TemplateId: "TP6", // Template ID của Flashcard
      TeacherId: teacherId,
      GameData: pairs.map((entry) => ({
        Front: entry.front.trim(),
        Back: entry.back.trim(),
      })),
    };

    console.log("Flashcard data to be sent:", updateData);
    const result = await updateFlashCard(updateData);

    if (result) {
      onSave({
        activityName,
        duration,
        pairs,
        thumbnail,
      });
      setIsOpen(false);
      toast.success("Cập nhật flashcard thành công!");
    } else {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 rounded bg-purple-500 hover:bg-purple-600 text-white font-semibold"
      >
        ✏️ Edit Flashcard
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl rounded-lg bg-white p-6 border shadow-lg space-y-4">
            <Dialog.Title className="text-xl font-bold text-center">Edit Flashcard</Dialog.Title>

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
                  <input
                    type="file"
                    onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-semibold mb-1">Duration</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    placeholder="Enter duration (seconds)"
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold">Flashcards</label>
                {pairs.map((entry, index) => (
                  <div key={index} className="flex gap-2 items-center my-2">
                    <input
                      type="text"
                      value={entry.front}
                      onChange={(e) => handleChangePair(index, "front", e.target.value)}
                      placeholder="Front"
                      className="flex-1 border px-2 py-1 rounded"
                    />
                    <input
                      type="text"
                      value={entry.back}
                      onChange={(e) => handleChangePair(index, "back", e.target.value)}
                      placeholder="Back"
                      className="flex-1 border px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => handleRemovePair(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddPair}
                  className="mt-2 bg-purple-100 hover:bg-purple-200 text-black px-3 py-1 rounded"
                >
                  ➕ Add Flashcard
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

export default EditFlashcard;
