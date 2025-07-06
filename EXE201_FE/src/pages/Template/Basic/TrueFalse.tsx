import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTrueFalse } from "../../../services/authService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { toast } from "react-toastify";
import { FileText, AlertCircle, ImageIcon, Upload, Clock, CheckCircle, XCircle, Trash2, Plus, Save } from "lucide-react";

interface QuestionAnswer {
  question: string;
  answer: "True" | "False";
}

const TrueFalse: React.FC = () => {
  /* ───── local state ───── */
  const [activityName, setActivityName] = useState("");
  const [duration, setDuration] = useState<number>(60);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [questionsAnswers, setQuestionsAnswers] = useState<QuestionAnswer[]>([
    { question: "", answer: "True" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  /* ───── global / route ───── */
  const teacherId = useSelector((s: RootState) => s.user.userId);
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  /* ───── handlers ───── */
  const handleAddMore = () => setQuestionsAnswers((p) => [...p, { question: "", answer: "True" }]);

  const handleQuestionChange = (idx: number, val: string) =>
    setQuestionsAnswers((p) => p.map((q, i) => (i === idx ? { ...q, question: val } : q)));

  const handleAnswerChange = (idx: number, val: "True" | "False") =>
    setQuestionsAnswers((p) => p.map((q, i) => (i === idx ? { ...q, answer: val } : q)));

  const handleDelete = (idx: number) => setQuestionsAnswers((p) => p.filter((_, i) => i !== idx));

  const handleChooseFile = (f: File | null) => {
    setImageFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  };

  /* ───── submit ───── */
  const handleSubmit = async () => {
    if (!teacherId || !courseId) return alert("Thiếu TeacherId hoặc CourseId");
    if (!activityName.trim()) return alert("Nhập tên activity");

    const payload = {
      MinigameName: activityName.trim(),
      TeacherId: teacherId,
      Duration: duration,
      CourseId: courseId,
      ImageFile: imageFile ?? null,
      GameData: questionsAnswers.map((qa) => ({
        Statement: [qa.question.trim()],
        Answer: qa.answer === "True",
      })),
    } as const;

    const ok = await createTrueFalse(payload);
    if (ok) {
      setIsSubmitting(true);
      toast.success("Tạo minigame thành công!");
      navigate("/teacher/activities");
    } else {
      setIsSubmitting(false);
      toast.error("Tạo minigame thất bại!");
    }
  };
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  /* ───── render ───── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create True/False Game
          </h1>
          <p className="text-gray-600 text-lg">Design an engaging true or false quiz for your students</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Content */}
          <div className="p-8">
            {/* Activity Name */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-3">
                <FileText size={20} className="text-blue-500" />
                Activity Name
              </label>
              <input
                value={activityName}
                onChange={(e) => {
                  setActivityName(e.target.value);
                  if (errors.activityName) setErrors(prev => ({ ...prev, activityName: "" }));
                }}
                className={`w-full border-2 p-4 rounded-xl text-lg transition-all duration-200 ${
                  errors.activityName 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                } focus:outline-none focus:ring-4 focus:ring-blue-100`}
                placeholder="Enter a catchy name for your true/false game"
              />
              {errors.activityName && (
                <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                  <AlertCircle size={16} />
                  {errors.activityName}
                </div>
              )}
            </div>

            {/* Thumbnail & Duration */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Thumbnail */}
              <div>
                <label className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-3">
                  <ImageIcon size={20} className="text-purple-500" />
                  Thumbnail Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleChooseFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {previewUrl ? (
                      <div className="space-y-3">
                        <img src={previewUrl} alt="preview" className="w-full h-32 object-cover rounded-lg shadow-md" />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload size={32} className="text-gray-400 mx-auto" />
                        <p className="text-gray-600">Click to upload thumbnail</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-3">
                  <Clock size={20} className="text-green-500" />
                  Duration
                </label>
                <div className="space-y-4">
                  <input 
                    type="number" 
                    min={10} 
                    value={duration} 
                    onChange={(e) => {
                      setDuration(Number(e.target.value));
                      if (errors.duration) setErrors(prev => ({ ...prev, duration: "" }));
                    }}
                    className={`w-full border-2 p-4 rounded-xl text-lg transition-all duration-200 ${
                      errors.duration 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                    } focus:outline-none focus:ring-4 focus:ring-blue-100`}
                  />
                  {errors.duration && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle size={16} />
                      {errors.duration}
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600">
                      Game duration: <span className="font-semibold text-blue-600">{formatDuration(duration)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Questions & Answers</h2>
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {questionsAnswers.length} question{questionsAnswers.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-4">
                {questionsAnswers.map((qa, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Question Number */}
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {idx + 1}
                      </div>
                      
                      {/* Question Input */}
                      <div className="flex-1">
                        <textarea
                          value={qa.question}
                          onChange={(e) => handleQuestionChange(idx, e.target.value)}
                          className={`w-full border-2 p-4 rounded-xl resize-none transition-all duration-200 ${
                            errors[`question_${idx}`] 
                              ? 'border-red-300 focus:border-red-500' 
                              : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
                          } focus:outline-none focus:ring-4 focus:ring-blue-100`}
                          placeholder={`Enter your true/false statement #${idx + 1}`}
                          rows={3}
                        />
                        {errors[`question_${idx}`] && (
                          <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                            <AlertCircle size={16} />
                            {errors[`question_${idx}`]}
                          </div>
                        )}
                      </div>
                      
                      {/* Answer Selection */}
                      <div className="flex-shrink-0 space-y-2">
                        <p className="text-sm font-medium text-gray-700 text-center">Answer</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAnswerChange(idx, "True")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                              qa.answer === "True" 
                                ? 'bg-green-500 text-white shadow-lg' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <CheckCircle size={16} />
                            True
                          </button>
                          <button
                            onClick={() => handleAnswerChange(idx, "False")}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                              qa.answer === "False" 
                                ? 'bg-red-500 text-white shadow-lg' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <XCircle size={16} />
                            False
                          </button>
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDelete(idx)}
                        disabled={questionsAnswers.length === 1}
                        className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6 border-t border-gray-200">
              <button 
                onClick={handleAddMore}
                className="w-full sm:w-auto px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-semibold hover:bg-yellow-200 transition-all duration-200 flex items-center gap-2 justify-center transform hover:scale-105"
              >
                <Plus size={20} />
                Add Another Question
              </button>
              
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 justify-center transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Save size={20} />
                )}
                {isSubmitting ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrueFalse;
