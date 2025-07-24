// components/Teacher/Template/EditSpelling.tsx
import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Image, Trash } from "lucide-react";
import { toast } from "react-toastify";

import { RootState } from "../../../store/store";
import { updateSpelling } from "../../../services/authService";
import { UpdateSpellingData } from "../../../types";

/* ---------- Types ---------- */
export type SpellingEntry = {
  Word: string;
  Image?: File | null;
  ImageUrl: string;
};

interface EditSpellingProps {
  initialActivityName: string;
  initialDuration: number;
  initialQuestions: SpellingEntry[];
  initialThumbnailUrl: string;
  onSave: (data: {
    activityName: string;
    duration: number;
    questions: SpellingEntry[];
    thumbnailUrl: string | null;
  }) => void;
}

/* ---------- Component ---------- */
const EditSpelling: React.FC<EditSpellingProps> = ({
  initialActivityName,
  initialDuration,
  initialQuestions,
  initialThumbnailUrl,
  onSave,
}) => {
  /* --- local state --- */
  const [isOpen, setIsOpen]         = useState(false);
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration]     = useState(initialDuration);
  const [thumbnail, setThumbnail]   = useState<File | null>(null);
  const [questions, setQuestions]   = useState<SpellingEntry[]>(initialQuestions);
  const [loading, setLoading]       = useState(false);

  /* --- id & auth --- */
  const teacherId = useSelector((s: RootState) => s.user.userId);
  const { minigameId } = useParams<{ minigameId: string }>();

  /* ---------- handlers ---------- */
  const handleAddQuestion = () =>
    setQuestions((prev) => [...prev, { Word: "", Image: null, ImageUrl: "" }]);

  const handleRemoveQuestion = (idx: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const handleQChange = (idx: number, field: keyof SpellingEntry, value: unknown) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );

  const handleSubmit = async () => {
    if (!minigameId || !teacherId) return;
    setLoading(true);

    /* ---- build payload ---- */
    const payload: UpdateSpellingData = {
      MinigameId  : minigameId,
      MinigameName: activityName,
      Duration    : duration,
      TemplateId  : "TP5",      // template Spelling
      TeacherId   : teacherId,
      ImageFile   : thumbnail,
      ImageUrl    : initialThumbnailUrl,
      GameData    : questions.map((q) => ({
        Word     : q.Word,
        Image    : q.Image ?? undefined,
        ImageUrl : q.Image ? q.ImageUrl /* fallback */ : q.ImageUrl,
      })),
    };

    try {
      await updateSpelling(payload);
      toast.success("Update Spelling thành công");

      /* --- callback ra ngoài --- */
      onSave({
        activityName,
        duration,
        questions,
        thumbnailUrl: thumbnail ? null : initialThumbnailUrl,
      });

      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold"
      >
        Edit Spelling
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white max-w-4xl max-h-[90vh] w-full rounded p-6">
            <DialogTitle className="text-lg font-bold mb-4">Edit Spelling</DialogTitle>

            {/* general */}
            <div className="space-y-4">
              <div>
                <label className="font-bold">Activity name</label>
                <input
                  className="w-full mt-2 p-2 border rounded"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                />
              </div>

              <div>
                <label className="font-bold">Duration (seconds)</label>
                <input
                  type="number"
                  className="w-full mt-2 p-2 border rounded"
                  value={duration}
                  onChange={(e) => setDuration(+e.target.value)}
                />
              </div>

              {/* thumbnail */}
              <div>
                <label className="font-bold">Thumbnail</label>
                <div className="flex items-center gap-3 mt-2">
                  {thumbnail ? (
                    <img
                      src={URL.createObjectURL(thumbnail)}
                      alt="Thumb"
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : initialThumbnailUrl ? (
                    <img
                      src={initialThumbnailUrl}
                      alt="Thumb"
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : null}
                  <label
                    htmlFor="thumb-up"
                    className="p-2 border rounded bg-gray-100 hover:bg-gray-300 cursor-pointer"
                  >
                    <Image size={20} />
                  </label>
                  <input
                    id="thumb-up"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setThumbnail(f);
                    }}
                  />
                </div>
              </div>

              {/* header row */}
              <div className="grid grid-cols-5 font-semibold border-b pb-2 mt-6">
                <div className="col-span-2">Word</div>
                <div className="col-span-2">Image</div>
                <div className="text-center">Actions</div>
              </div>

              {/* question list */}
              {questions.map((q, idx) => (
                <div key={idx} className="grid grid-cols-5 items-center gap-2 mb-2 mt-3">
                  {/* word */}
                  <input
                    className="col-span-2 p-2 border rounded"
                    value={q.Word}
                    onChange={(e) => handleQChange(idx, "Word", e.target.value.toUpperCase())}
                    placeholder={`Word ${idx + 1}`}
                  />

                  {/* image */}
                  <div className="col-span-2 flex items-center gap-2">
                    {q.Image || q.ImageUrl ? (
                      <img
                        src={q.Image ? URL.createObjectURL(q.Image) : q.ImageUrl}
                        alt={`img-${idx}`}
                        className="w-24 h-16 object-cover rounded"
                      />
                    ) : (
                      <>
                        <label
                          htmlFor={`img-up-${idx}`}
                          className="p-2 border rounded bg-gray-100 hover:bg-gray-300 cursor-pointer"
                        >
                          <Image size={16} />
                        </label>
                        <input
                          id={`img-up-${idx}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleQChange(idx, "Image", file);
                          }}
                        />
                      </>
                    )}
                  </div>

                  {/* remove btn */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleRemoveQuestion(idx)}
                      className="hover:bg-red-500 text-red-600 p-1"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* actions */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={handleAddQuestion}
                  className="px-3 py-2 bg-yellow-100 rounded hover:bg-yellow-200 flex items-center"
                >
                  <span className="text-xl mr-1">+</span> Add Word
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default EditSpelling;
