import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useParams } from "react-router-dom";
import { UpdatePairing } from "../../../services/authService";
import { toast } from "react-toastify";
import { baseImageUrl } from "../../../config/base";

type PairingEntry = { word: string };

interface EditPairingProps {
  initialActivityName: string;
  initialDuration: number;
  initialWords: string[];
  initialThumbnailUrl: string | null;
  onSave: (data: {
    activityName: string;
    duration: number;
    words: string[];
    thumbnailUrl: string | null; // đường dẫn tương đối hoặc null nếu đổi ảnh
  }) => void;
}

const getRelative = (url: string | null) => (url ? url.replace(baseImageUrl, "") : "");

const EditPairing: React.FC<EditPairingProps> = ({
  initialActivityName,
  initialDuration,
  initialWords,
  initialThumbnailUrl,
  onSave,
}) => {
  /*────── context ──────*/
  const teacherId = useSelector((s: RootState) => s.user.userId);
  const { minigameId } = useParams<{ minigameId: string }>();

  /*────── local state ──────*/
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration] = useState(initialDuration);
  const [words, setWords] = useState<PairingEntry[]>(initialWords.map((w) => ({ word: w })));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialThumbnailUrl);

  /*────── helpers ──────*/
  const resetForm = () => {
    setActivityName(initialActivityName);
    setDuration(initialDuration);
    setWords(initialWords.map((w) => ({ word: w })));
    setImageFile(null);
    setPreviewUrl(initialThumbnailUrl);
  };

  const handleAddWord = () => setWords((p) => [...p, { word: "" }]);
  const handleChangeWord = (i: number, v: string) =>
    setWords((p) => p.map((e, idx) => (idx === i ? { word: v } : e)));
  const handleRemoveWord = (i: number) => setWords((p) => p.filter((_, idx) => idx !== i));

  const handleChooseFile = (file: File | null) => {
    setImageFile(file);
    if (file) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(initialThumbnailUrl);
  };

  /* revoke blob url on unmount */
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /*────── submit ──────*/
  const handleSubmit = async () => {
    if (!minigameId || !teacherId) return toast.error("Thiếu MinigameId hoặc TeacherId");

    const payload = {
      MinigameId: minigameId,
      MinigameName: activityName.trim(),
      Duration: duration,
      TemplateId: "TP8",
      TeacherId: teacherId,
      ImageFile: imageFile ?? null,
      ImageUrl: initialThumbnailUrl,
      GameData: words.map((e) => ({ words: [e.word.trim()] })),
    } as const;

    const ok = await UpdatePairing(payload);
    if (ok) {
      onSave({
        activityName: activityName.trim(),
        duration,
        words: words.map((e) => e.word.trim()),
        thumbnailUrl: imageFile ? null : getRelative(initialThumbnailUrl),
      });
      toast.success("Cập nhật thành công");
      setIsOpen(false);
    } else {
      toast.error("Cập nhật thất bại. Vui lòng thử lại");
    }
  };

  /*────── render ──────*/
  return (
    <>
      <button
        onClick={() => {
          resetForm();
          setIsOpen(true);
        }}
        className="px-4 py-2 rounded bg-blue-400 hover:bg-blue-500 text-white font-semibold"
      >
        ✏️ Edit Pairing
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-lg bg-white p-6 border shadow-lg space-y-4">
            <DialogTitle className="text-xl font-bold text-center">Edit Pairing</DialogTitle>

            {/* activity name */}
            <input
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Activity name"
              className="w-full border px-3 py-2 rounded"
            />

            {/* thumbnail + duration */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block font-semibold mb-1">Thumbnail</label>
                <input type="file" onChange={(e) => handleChooseFile(e.target.files?.[0] || null)} className="w-full border px-2 py-1 rounded" />
                {previewUrl && (
                  <img src={previewUrl.startsWith("http") ? previewUrl : baseImageUrl + previewUrl} alt="thumbnail preview" className="mt-2 h-24 object-cover rounded shadow" />
                )}
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">Duration (sec)</label>
                <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full border px-2 py-1 rounded" />
              </div>
            </div>

            {/* words */}
            <div>
              <label className="font-semibold">Words</label>
              {words.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 my-2">
                  <input value={entry.word} onChange={(e) => handleChangeWord(idx, e.target.value)} className="flex-1 border px-2 py-1 rounded" placeholder="Pairing word" />
                  <button onClick={() => handleRemoveWord(idx)} className="text-red-500 hover:text-red-700">🗑</button>
                </div>
              ))}
              <button onClick={handleAddWord} className="mt-2 bg-blue-100 hover:bg-blue-200 text-black px-3 py-1 rounded">➕ Add word</button>
            </div>

            {/* actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600">✅ Finish</button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default EditPairing;
