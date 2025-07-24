import React, { useState } from "react";
import { FaCopy, FaTrash, FaPlus, FaImage, FaClock, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { createRestoration } from "../../../services/authService";
import { toast } from "react-toastify";
import { RestorationData } from "../../../types";

const RestorationScreen: React.FC = () => {
  const [activityName, setActivityName] = useState("");
  const [sentences, setSentences] = useState<string[]>([""]);
  const [duration, setDuration] = useState<number>(120);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const teacherId = useSelector((s: RootState) => s.user.userId);

  /*────── handlers ──────*/
  const addSentence = () => setSentences((prev) => [...prev, ""]);
  const changeSentence = (idx: number, val: string) => setSentences((p) => p.map((s, i) => (i === idx ? val : s)));
  const deleteSentence = (idx: number) => setSentences((p) => p.filter((_, i) => i !== idx));
  const copySentence = (idx: number) => {
    navigator.clipboard.writeText(sentences[idx]);
    toast.success("Copied to clipboard!");
  };

  const handleSubmit = async () => {
    if (!activityName.trim()) return toast.warn("Please enter activity name");
    if (sentences.some((s) => !s.trim())) return toast.warn("Sentences cannot be empty");
    if (!teacherId) return toast.error("Missing teacher id");
    if (!courseId) return toast.error("Missing course id");

    setIsSubmitting(true);

    const payload: RestorationData = {
      MinigameName: activityName.trim(),
      TeacherId: teacherId,
      Duration: duration,
      TemplateId: "TP9",
      CourseId: courseId,
      ImageFile: imageFile,
      GameData: sentences.map((s) => ({ words: [s.trim()] })),
    };

    try {
      const res = await createRestoration(payload);
      if (res) {
        toast.success("Created successfully");
        navigate(`/teacher/activities`);
      } else {
        toast.error("Create failed, please try again");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      toast.error("An error occurred while creating the activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  /*────── render ──────*/
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Restoration Activity</h1>
          <p className="text-gray-600">Build engaging sentence restoration exercises for your students</p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          {/* Activity Name */}
          <div className="mb-8">
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
              <FaEdit className="text-blue-500" />
              Activity Name
            </label>
            <input
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
              placeholder="Enter a creative activity name..."
            />
          </div>

          {/* Duration and Image */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                <FaClock className="text-green-500" />
                Duration
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-lg"
                  min="30"
                  max="600"
                />
                <div className="absolute right-4 top-4 text-gray-500 text-sm">
                  {formatTime(duration)}
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                <FaImage className="text-purple-500" />
                Thumbnail (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-purple-500 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {imageFile && (
                  <div className="absolute right-4 top-4 text-green-500">
                    <FaCheck />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sentences Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Sentences</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                <span>{sentences.length} sentence{sentences.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="space-y-4">
              {sentences.map((sentence, idx) => (
                <div key={idx} className="group relative">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-gray-200 transition-all">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    
                    <input
                      value={sentence}
                      onChange={(e) => changeSentence(idx, e.target.value)}
                      className="flex-1 bg-transparent border-none p-2 focus:outline-none text-lg placeholder-gray-400"
                      placeholder={`Enter sentence ${idx + 1}...`}
                    />

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copySentence(idx)}
                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copy sentence"
                      >
                        <FaCopy />
                      </button>
                      
                      {sentences.length > 1 && (
                        <button
                          onClick={() => deleteSentence(idx)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete sentence"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Sentence Button */}
            <button
              onClick={addSentence}
              className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <FaPlus />
              Add Another Sentence
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
            >
              <FaTimes />
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all flex-1 ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <FaCheck />
                  Create Activity
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{sentences.length}</div>
              <div className="text-sm text-gray-600">Sentences</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{formatTime(duration)}</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{imageFile ? 'Yes' : 'No'}</div>
              <div className="text-sm text-gray-600">Thumbnail</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestorationScreen;