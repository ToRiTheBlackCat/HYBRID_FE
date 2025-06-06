import React, {useState } from "react";
import { Dialog } from "@headlessui/react";
import { ConjunctionEntry } from "../../../types/index";

type EditConjunctionProps = {
  initialActivityName: string;
  initialDuration: number;
  initialEntries: ConjunctionEntry[];
  onSave: (data: {
    activityName: string;
    duration: number;
    entries: ConjunctionEntry[];
    thumbnail: File | null;
  }) => void;
};

const EditConjunction: React.FC<EditConjunctionProps> = ({
  initialActivityName,
  initialDuration,
  initialEntries,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration] = useState(initialDuration);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [entries, setEntries] = useState<ConjunctionEntry[]>(initialEntries);

  // Reset modal state each time it opens
  const openModal = () => {
    setActivityName(initialActivityName);
    setDuration(initialDuration);
    setThumbnail(null);
    setEntries(initialEntries);
    setIsOpen(true);
  };

  const handleAddEntry = () => {
    setEntries([...entries, { keyword: "", meaning: "" }]);
  };

  const handleChangeEntry = (index: number, field: "keyword" | "meaning", value: string) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const handleRemoveEntry = (index: number) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const handleFinishEdit = () => {
    onSave({ activityName, duration, thumbnail, entries });
    setIsOpen(false);
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
                      value={entry.keyword}
                      onChange={(e) => handleChangeEntry(index, "keyword", e.target.value)}
                      placeholder="Keyword"
                      className="flex-1 border px-2 py-1 rounded"
                    />
                    <input
                      type="text"
                      value={entry.meaning}
                      onChange={(e) => handleChangeEntry(index, "meaning", e.target.value)}
                      placeholder="Meaning"
                      className="flex-1 border px-2 py-1 rounded"
                    />
                    <button onClick={() => handleRemoveEntry(index)} className="text-red-500 hover:text-red-700">
                      🗑
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
