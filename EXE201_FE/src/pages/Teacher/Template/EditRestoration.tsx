import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { UpdateRestoration } from "../../../services/authService";

type RestorationEntry = { word: string };

interface EditRestorationProps {
  initialActivityName: string;
  initialDuration: number;
  initialWords: string[];
  initialThumbnailUrl: string | null;
  onSave: (d: {
    activityName: string;
    duration: number;
    words: string[];
    thumbnailUrl: string | null;
  }) => void;
}
const getRelative = (url: string | null) => {
  if (!url) return null;
  return url.startsWith("http") ? url.replace(/^.*\/images\//, "") : url;
};

const EditRestoration: React.FC<EditRestorationProps> = ({
  initialActivityName,
  initialDuration,
  initialWords,
  initialThumbnailUrl,
  onSave,
}) => {
  const teacherId = useSelector((s: RootState) => s.user.userId);
  const { minigameId } = useParams<{ minigameId: string }>();

  /*──── state ────*/
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration] = useState(initialDuration);
  const [entries, setEntries] = useState<RestorationEntry[]>(initialWords.map((w) => ({ word: w })));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialThumbnailUrl);

  /*──── helpers ────*/
  const resetForm = () => {
    setActivityName(initialActivityName);
    setDuration(initialDuration);
    setEntries(initialWords.map((w) => ({ word: w })));
    setImageFile(null);
    setPreviewUrl(initialThumbnailUrl);
  };

  const addWord = () => setEntries((p) => [...p, { word: "" }]);
  const changeWord = (i: number, v: string) => setEntries((p) => p.map((e, idx) => (idx === i ? { word: v } : e)));
  const removeWord = (i: number) => setEntries((p) => p.filter((_, idx) => idx !== i));

  const chooseFile = (f: File | null) => {
    setImageFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(initialThumbnailUrl);
  };

  useEffect(() => () => { if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  /*──── submit ────*/
  const submit = async () => {
    if (!minigameId || !teacherId) return toast.error("Thiếu MinigameId hoặc TeacherId");

    const payload = {
      MinigameId: minigameId,
      MinigameName: activityName.trim(),
      Duration: duration,
      TeacherId: teacherId,
      ImageFile: imageFile ?? null,
      ImageUrl: initialThumbnailUrl,
      GameData: entries.map((e) => ({ words: [e.word.trim()] })),
    } as const;

    console.log("Payload", payload);
    const ok = await UpdateRestoration(payload);
    if (ok) {
      onSave({
        activityName: activityName.trim(),
        duration,
        words: entries.map((e) => e.word.trim()),
        thumbnailUrl: imageFile ? null : getRelative(previewUrl),
      });
      toast.success("Cập nhật thành công");
      setIsOpen(false);
    } else {
      toast.error("Cập nhật thất bại. Vui lòng thử lại");
    }
  };

  /*──── render ────*/
  return (
    <>
      <button onClick={() => { resetForm(); setIsOpen(true); }} className="px-4 py-2 rounded bg-blue-400 hover:bg-blue-500 text-white font-semibold">✏️ Edit Restoration</button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 border shadow-lg space-y-4">
            <Dialog.Title className="text-xl font-bold text-center">Edit Restoration</Dialog.Title>

            <input value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="Activity name" className="w-full border px-3 py-2 rounded" />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-semibold mb-1">Thumbnail</label>
                <input type="file" accept="image/*" onChange={(e) => chooseFile(e.target.files?.[0] || null)} className="w-full border px-2 py-1 rounded" />
                {previewUrl && (
                  <img src={initialThumbnailUrl ?? undefined} alt="thumbnail preview" className="mt-2 h-24 object-cover rounded shadow" />
                )}
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">Duration (sec)</label>
                <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full border px-2 py-1 rounded" />
              </div>
            </div>

            <div>
              <label className="font-semibold">Sentences</label>
              {entries.map((e, idx) => (
                <div key={idx} className="flex items-center gap-2 my-2">
                  <input value={e.word} onChange={(ev) => changeWord(idx, ev.target.value)} className="flex-1 border px-2 py-1 rounded" placeholder="Sentence" />
                  <button onClick={() => removeWord(idx)} className="text-red-500 hover:text-red-700">🗑</button>
                </div>
              ))}
              <button onClick={addWord} className="mt-2 bg-blue-100 hover:bg-blue-200 text-black px-3 py-1 rounded">➕ Add sentence</button>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={submit} className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600">✅ Finish</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default EditRestoration;
