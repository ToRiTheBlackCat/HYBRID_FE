import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { ConjunctionEntry } from "../../../types/index";
import { editConjunction } from "../../../services/authService";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!activityName.trim()) {
      toast.error("Activity name is required.");
      return;
    }
    if (validEntries.length === 0) {
      toast.error("At least one valid entry is required.");
      return;
    }
    if (duration <= 0) {
      toast.error("Duration must be greater than 0.");
      return;
    }
    if (!teacherId || !minigameId) {
      toast.error("Missing required information.");
      return;
    }

    setIsSubmitting(true);

    try {
      const conjunctionData = {
        MinigameId: minigameId,
        MinigameName: activityName,
        ImageFile: thumbnail,
        ImageUrl: !thumbnail && initialThumbnailUrl ? initialThumbnailUrl : undefined,
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
        let finalThumbnailUrl: string | null = null;
        
        if (result.thumbnailImage) {
          finalThumbnailUrl = normalizeUrl(baseImageUrl, result.thumbnailImage);
        } else if (thumbnail) {
          finalThumbnailUrl = URL.createObjectURL(thumbnail);
        } else {
          finalThumbnailUrl = initialThumbnailUrl ?? null;
        }

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
    } catch (error) {
      console.error("Error updating minigame:", error);
      toast.error("An error occurred while updating minigame.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPreviewImageSrc = (): string | null => {
    if (thumbnail) {
      return URL.createObjectURL(thumbnail);
    }
    return initialThumbnailUrl ?? null;
  };

  return (
    <>
      <button
        onClick={openModal}
        className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit Minigame
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border-0">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <Dialog.Title className="text-2xl font-bold">Edit Minigame</Dialog.Title>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Activity Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Activity Name *
                </label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Enter activity name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                />
              </div>

              {/* Thumbnail and Duration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thumbnail Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Thumbnail Image
                  </label>
                  
                  {/* Current/Preview Image */}
                  {getPreviewImageSrc() && (
                    <div className="relative group">
                      <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                        <img
                          src={getPreviewImageSrc()!}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">
                        {thumbnail ? "New Image" : "Current Image"}
                      </div>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {thumbnail ? thumbnail.name : "Choose new image or keep current"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Duration Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Duration (seconds) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      placeholder="60"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      min="1"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      sec
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Recommended: 30-120 seconds for optimal gameplay
                  </p>
                </div>
              </div>

              {/* Entries Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Term & Definition Pairs *
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {entries.filter(e => e.Term && e.Definition).length} valid entries
                  </span>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {entries.map((entry, index) => (
                    <div
                      key={index}
                      className="group relative bg-gray-50 rounded-xl p-4 border-2 border-transparent hover:border-gray-200 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={entry.Term}
                              onChange={(e) => handleChangeEntry(index, "Term", e.target.value)}
                              placeholder="Enter term..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                            />
                            <label className="text-xs text-gray-500 mt-1 block">Term</label>
                          </div>
                          
                          <div>
                            <input
                              type="text"
                              value={entry.Definition}
                              onChange={(e) => handleChangeEntry(index, "Definition", e.target.value)}
                              placeholder="Enter definition..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 outline-none"
                            />
                            <label className="text-xs text-gray-500 mt-1 block">Definition</label>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveEntry(index)}
                          className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddEntry}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Entry
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  * Required fields
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinishEdit}
                    disabled={isSubmitting}
                    className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default EditConjunction;