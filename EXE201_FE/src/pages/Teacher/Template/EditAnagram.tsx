import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useParams } from "react-router-dom";
import { editAnagram } from "../../../services/authService";
import { toast } from "react-toastify";

type AnagramEntry = {
  word: string;
};

type EditAnagramProps = {
  initialActivityName: string;
  initialDuration: number;
  initialWords: string[];
  initialThumbnailUrl?: string | null;
  onSave: (data: {
    activityName: string;
    duration: number;
    words: string[];
    thumbnail: File | null;
  }) => void;
};

const EditAnagram: React.FC<EditAnagramProps> = ({
  initialActivityName,
  initialDuration,
  initialWords,
  initialThumbnailUrl,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration] = useState(initialDuration);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [entries, setEntries] = useState<AnagramEntry[]>(
    initialWords.map((word) => ({ word }))
  );

  const teacherId = useSelector((state: RootState) => state.user.userId);
  const { minigameId } = useParams<{ minigameId: string }>();



  const openModal = () => {
    setActivityName(initialActivityName);
    setDuration(initialDuration);
    setThumbnail(null);
    setEntries(initialWords.map((word) => ({ word })));
    setIsOpen(true);
  };

  const handleAddWord = () => {
    setEntries([...entries, { word: "" }]);
  };

  const handleChangeWord = (index: number, value: string) => {
    const updated = [...entries];
    updated[index].word = value;
    setEntries(updated);
  };

  const handleRemoveWord = (index: number) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const handleFinishEdit = async () => {
    if (!minigameId || !teacherId) {
      console.error("Missing minigameId or teacherId");
      return;
    }


    const updateData = {
      MinigameId: minigameId,
      MinigameName: activityName,
      ImageFile: thumbnail ?? undefined,
      ImageUrl: initialThumbnailUrl,
      Duration: duration,
      TemplateId: "TP3", // ⚠️ Cập nhật đúng TemplateId của Anagram
      TeacherId: teacherId,
      GameData: entries.map((entry) => ({ words: [entry.word.trim()] })),
    };
    console.log("Anagram data to be sent:", updateData);

    const result = await editAnagram(updateData);

    if (result) {
      onSave({
        activityName,
        duration,
        words: entries.map((e) => e.word),
        thumbnail,
      });
      setIsOpen(false);
      toast.success("Cập nhật thành công")
    } else {
      alert("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 rounded bg-blue-400 hover:bg-blue-500 text-white font-semibold"
      >
        ✏️ Edit Anagram
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-lg bg-white p-6 border shadow-lg space-y-4 mt-20">
            <DialogTitle className="text-xl font-bold text-center">Edit Anagram</DialogTitle>

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
                <label className="font-semibold">Words</label>
                {entries.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 my-2">
                    <input
                      type="text"
                      value={entry.word}
                      onChange={(e) => handleChangeWord(index, e.target.value)}
                      placeholder="Anagram word"
                      className="flex-1 border px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => handleRemoveWord(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑
                    </button>
                  </div>
                ))}

                <button
                  onClick={handleAddWord}
                  className="mt-2 bg-blue-100 hover:bg-blue-200 text-black px-3 py-1 rounded"
                >
                  ➕ Add word
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
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default EditAnagram;
