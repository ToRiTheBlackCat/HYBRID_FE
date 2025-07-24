import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useParams } from "react-router-dom";
import { UpdateCompletion } from "../../../services/authService";   // ⚠️ đảm bảo tồn tại hàm này
import { toast } from "react-toastify";

/* ────────── types ────────── */
type CompletionEntry = {
  sentence: string;       
  options: string[];      
  answerIndex: number;    
};

type EditCompletionProps = {
  initialActivityName: string;
  initialDuration: number;
  initialEntries: CompletionEntry[];
  initialThumbnailUrl?: string | null;
  onSave: (data: {
    activityName: string;
    duration: number;
    entries: CompletionEntry[];
    thumbnail: File | null;
  }) => void;
};

/* ────────── component ────────── */
const EditCompletion: React.FC<EditCompletionProps> = ({
  initialActivityName,
  initialDuration,
  initialEntries,
  initialThumbnailUrl,
  onSave,
}) => {
  /* modal */
  const [isOpen, setIsOpen] = useState(false);

  /* form state */
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration] = useState(initialDuration);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [entries, setEntries] = useState<CompletionEntry[]>(
    initialEntries.length
      ? initialEntries
      : [{ sentence: "", options: ["", "", ""], answerIndex: 0 }]
  );

  /* ids */
  const teacherId = useSelector((s: RootState) => s.user.userId);
  const { minigameId } = useParams<{ minigameId: string }>();

  /* ────────── helpers ────────── */
  const openModal = () => {
    setActivityName(initialActivityName);
    setDuration(initialDuration);
    setThumbnail(null);
    setEntries(
      initialEntries.length
        ? initialEntries
        : [{ sentence: "", options: ["", "", ""], answerIndex: 0 }]
    );
    setIsOpen(true);
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      { sentence: "", options: ["", "", ""], answerIndex: 0 },
    ]);
  };

  const removeEntry = (idx: number) => {
    const next = [...entries];
    next.splice(idx, 1);
    setEntries(next.length ? next : [{ sentence: "", options: ["", "", ""], answerIndex: 0 }]);
  };

  const changeSentence = (idx: number, value: string) => {
    const next = [...entries];
    next[idx].sentence = value;
    setEntries(next);
  };

  const changeOption = (idx: number, optIdx: number, value: string) => {
    const next = [...entries];
    next[idx].options[optIdx] = value;
    setEntries(next);
  };

  const changeAnswer = (idx: number, ans: number) => {
    const next = [...entries];
    next[idx].answerIndex = ans;
    setEntries(next);
  };

  /* ────────── submit ────────── */
  const handleFinishEdit = async () => {
    if (!minigameId || !teacherId) return;

    /** Chuẩn hoá options: loại bỏ chuỗi rỗng */
    const cleaned = entries.map((e) => ({
      ...e,
      options: e.options.filter((o) => o.trim() !== ""),
    }));

    const updateData = {
      MinigameId: minigameId,
      MinigameName: activityName,
      ImageFile: thumbnail,
      ImageUrl: initialThumbnailUrl,
      Duration: duration,
      TemplateId: "TP7",              // ⚠️ TemplateId dành cho Completion
      TeacherId: teacherId,
      GameData: cleaned.map((e) => ({
        Sentence: e.sentence.trim(),
        Options: e.options,
        AnswerIndexes: [e.answerIndex],     // backend nhận mảng index đáp án
      })),
    };

    try {
      const ok = await UpdateCompletion(updateData);
      if (ok) {
        onSave({
          activityName,
          duration,
          entries: cleaned,
          thumbnail,
        });
        setIsOpen(false);
        toast.success("Cập nhật thành công");
      } else {
        toast.error("Cập nhật thất bại, thử lại!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi, vui lòng thử lại.");
    }
  };

  /* ────────── render ────────── */
  return (
    <>
      <button
        onClick={openModal}
        className="px-4 py-2 rounded bg-blue-400 hover:bg-blue-500 text-white font-semibold"
      >
        ✏️ Edit Completion
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
          <DialogPanel className="w-full max-w-3xl max-h-[90vh] overflow-auto rounded-lg bg-white p-6 border shadow-lg space-y-4 mt-20">
            <DialogTitle className="text-xl font-bold text-center">Edit Completion</DialogTitle>

            {/* general info */}
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Activity name"
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block font-semibold mb-1">Thumbnail</label>
                <input
                  type="file"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">Duration (s)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                  min={10}
                />
              </div>
            </div>

            {/* entries list */}
            <div>
              <label className="font-semibold">Questions</label>
              {entries.map((entry, idx) => (
                <div
                  key={idx}
                  className="border rounded p-3 my-3 space-y-2 relative bg-gray-50"
                >
                  {/* remove */}
                  <button
                    onClick={() => removeEntry(idx)}
                    className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                  >
                    🗑
                  </button>

                  {/* sentence */}
                  <input
                    type="text"
                    value={entry.sentence}
                    onChange={(e) => changeSentence(idx, e.target.value)}
                    placeholder="Sentence (use ___ for blank)"
                    className="w-full border px-2 py-1 rounded"
                  />

                  {/* options */}
                  {entry.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={entry.answerIndex === oIdx}
                        onChange={() => changeAnswer(idx, oIdx)}
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => changeOption(idx, oIdx, e.target.value)}
                        placeholder={`Option ${oIdx + 1}`}
                        className="flex-1 border px-2 py-1 rounded"
                      />
                    </div>
                  ))}

                  {/* add more option (max 5) */}
                  {entry.options.length < 5 && (
                    <button
                      onClick={() =>
                        changeOption(idx, entry.options.length, "")
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Add option
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addEntry}
                className="mt-2 bg-blue-100 hover:bg-blue-200 text-black px-3 py-1 rounded"
              >
                ➕ Add question
              </button>
            </div>

            {/* footer */}
            <div className="flex justify-end gap-2 pt-2">
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
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default EditCompletion;
