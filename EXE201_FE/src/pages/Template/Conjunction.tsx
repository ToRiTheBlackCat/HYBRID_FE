import React, { useState } from "react";
import { Plus, Trash2, Copy, Image as ImageIcon, ArrowLeft, Clock, FileText, BookOpen, Sparkles, Upload } from "lucide-react";
import VoiceInput from "../../components/Conjunction/VoiceInput";
import { ConjunctionEntry } from "../../types/index";
import { useNavigate } from "react-router-dom";
import { createConjunction } from "../../services/authService";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

interface ConjunctionTemplateProps {
  courseId: string;
}

const ConjunctionTemplate: React.FC<ConjunctionTemplateProps> = ({ courseId }) => {
  const [MinigameName, setMinigameName] = useState("");
  const [Entries, setEntries] = useState<ConjunctionEntry[]>([{ Term: "", Definition: "" }]);
  const [ImageFile, setImageFile] = useState<File | null>(null);
  const [Duration, setDuration] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const teacherId = useSelector((state: RootState) => state.user.userId);
  const navigate = useNavigate();

  const handleChange = (index: number, field: keyof ConjunctionEntry, value: string) => {
    const updated = [...Entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...Entries, { Term: "", Definition: "" }]);
  };

  const removeEntry = (index: number) => {
    const updated = Entries.filter((_, i) => i !== index);
    setEntries(updated.length > 0 ? updated : [{ Term: "", Definition: "" }]);
  };

  const duplicateEntry = (index: number) => {
    const newEntry = { ...Entries[index] };
    setEntries([...Entries.slice(0, index + 1), newEntry, ...Entries.slice(index + 1)]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      setImageFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFinish = async () => {
    const validEntries = Entries.filter((e) => e.Term && e.Definition);

    if (!MinigameName || validEntries.length === 0 || !ImageFile || Duration <= 0) {
      toast.error("Please fill in all fields with valid data.");
      return;
    }

    setIsSubmitting(true);

    const conjunctionData = {
      MinigameName,
      ImageFile,
      TeacherId: teacherId,
      Duration,
      TemplateId: "TP1",
      CourseId: courseId,
      GameData: validEntries.map((entry) => ({
        Term: entry.Term,
        Definition: entry.Definition,
      })),
    };

    try {
      const response = await createConjunction(conjunctionData);
      if (response) {
        toast.success("Minigame created successfully!");
        navigate("/teacher/activities");
      } else {
        toast.error("Failed to create minigame.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Activities
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Create Conjunction Activity</h1>
              <p className="text-gray-600">Build an engaging vocabulary matching game</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Name */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Activity Details</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter a catchy activity name..."
                    value={MinigameName}
                    onChange={(e) => setMinigameName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Duration (seconds)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., 300"
                      value={Duration || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) setDuration(value === "" ? 0 : parseInt(value));
                      }}
                    />
                  </div>

                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Upload className="w-4 h-4 inline mr-1" />
                      Thumbnail Image
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-4 transition-all cursor-pointer ${
                        dragOver 
                          ? 'border-blue-500 bg-blue-50' 
                          : ImageFile 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <div className="text-center">
                        {ImageFile ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-medium">{ImageFile.name}</span>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <Upload className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">Drop image or click to upload</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Entries Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Term & Definition Pairs</h2>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {Entries.length} {Entries.length === 1 ? 'pair' : 'pairs'}
                </span>
              </div>

              <div className="space-y-4">
                {Entries.map((entry, index) => (
                  <div key={index} className="group relative">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>

                      {/* Term Input */}
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter term..."
                          value={entry.Term}
                          onChange={(e) => handleChange(index, "Term", e.target.value)}
                        />
                        <div className="flex gap-1 mt-2">
                          <VoiceInput onResult={(value) => handleChange(index, "Term", value)} />
                          <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                            <ImageIcon size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Definition Input */}
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter definition..."
                          value={entry.Definition}
                          onChange={(e) => handleChange(index, "Definition", e.target.value)}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => duplicateEntry(index)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Duplicate entry"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => removeEntry(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Remove entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addEntry}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
              >
                <Plus size={18} />
                Add New Pair
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Preview Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Preview</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{MinigameName || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{Duration ? `${Duration}s` : "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pairs:</span>
                    <span className="font-medium">{Entries.filter(e => e.Term && e.Definition).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thumbnail:</span>
                    <span className="font-medium">{ImageFile ? "✓ Uploaded" : "Not uploaded"}</span>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Tips</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Use clear, concise terms</li>
                  <li>• Keep definitions simple</li>
                  <li>• Add at least 5 pairs for better gameplay</li>
                  <li>• Choose an engaging thumbnail</li>
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={handleFinish}
                disabled={isSubmitting || !MinigameName || !ImageFile || Duration <= 0 || Entries.filter(e => e.Term && e.Definition).length === 0}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
                  isSubmitting || !MinigameName || !ImageFile || Duration <= 0 || Entries.filter(e => e.Term && e.Definition).length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transform hover:scale-105 shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Create Activity
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConjunctionTemplate;