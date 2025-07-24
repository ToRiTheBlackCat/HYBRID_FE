import React, { useState } from "react";
import { SpellingItem } from "../../types/common";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { createSpelling } from "../../services/authService";
import { toast } from "react-toastify";
import { 
  FaPlus, 
  FaTrash, 
  FaImage, 
  FaFileImage, 
  FaClock, 
  FaMicrophone, 
  FaKeyboard,
  FaSpellCheck,
  FaSave,
  FaArrowLeft
} from "react-icons/fa";

interface SpellingProps {
  courseId?: string;
}

const Spelling: React.FC<SpellingProps> = ({ courseId }) => {
  const [activityName, setActivityName] = useState<string>("");
  const [mode, setMode] = useState<"none" | "voice" | "qa">("none");
  const [inputWord, setInputWord] = useState([""]);
  const [items, setItems] = useState<SpellingItem[]>([
    { Word: "", Image: null },
  ]);
  const [duration, setDuration] = useState(0);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const teacherId = useSelector((state: RootState) => state.user.userId);

  const navigate = useNavigate();

  const handleThumbnail = (f: File | null) => setThumbnail(f);

  const handleChangeWord = (index: number, value: string) => {
    const updated = [...items];
    updated[index].Word = value;
    setItems(updated);
  };

  const handleFileChange = (index: number, file: File | null) => {
    const updated = [...items];
    updated[index].Image = file;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { Word: "", Image: null }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleInputWord = (i: number, val: string) => {
    const words = [...inputWord];
    words[i] = val;
    setInputWord(words);
  };

  const handleFinish = async () => {
    if (!activityName.trim()) {
      toast.error("Please enter an activity name");
      return;
    }

    if (mode === "none") {
      toast.error("Please select a mode");
      return;
    }

    if (mode === "voice" && inputWord.every(word => !word.trim())) {
      toast.error("Please add at least one word");
      return;
    }

    if (mode === "qa" && items.every(item => !item.Word.trim())) {
      toast.error("Please add at least one word");
      return;
    }

    try {
      setLoading(true);
      const spellingData = {
        MinigameName: activityName,
        TeacherId: teacherId,
        Duration: duration.toString(),
        TemplateId: "TP5",
        CourseId: courseId ?? "",
        ImageFile: thumbnail,
        GameData: mode === "voice" ? inputWord.map((word) => ({
          Word: word,
          ImagePath: null,
          Image: null,
        })) : items,
      };
      await createSpelling(spellingData);
      toast.success("Spelling activity created successfully!");
      navigate("/teacher/activities");
    } catch (error) {
      toast.error("Failed to create spelling activity");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getWordCount = () => {
    if (mode === "voice") {
      return inputWord.filter(word => word.trim()).length;
    }
    if (mode === "qa") {
      return items.filter(item => item.Word.trim()).length;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate("/teacher/activities")}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to Activities
            </button>
          </div>
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <FaSpellCheck className="text-blue-600 text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Spelling Activity</h1>
              <p className="text-gray-600">Design an interactive spelling game for your students</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Activity Settings */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Settings</h2>
            
            <div className="space-y-4">
              {/* Activity Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Name *
                </label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Enter a descriptive name for your spelling activity"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaClock className="inline mr-2" />
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    placeholder="e.g. 60"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaFileImage className="inline mr-2" />
                    Activity Thumbnail
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnail(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    {thumbnail && (
                      <img
                        src={URL.createObjectURL(thumbnail)}
                        alt="Thumbnail preview"
                        className="h-16 w-16 object-cover rounded-lg border border-gray-300 shadow-sm"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  key: "voice", 
                  label: "Voice Mode", 
                  description: "Students spell words they hear",
                  icon: FaMicrophone,
                  color: "blue"
                },
                { 
                  key: "qa", 
                  label: "Visual Mode", 
                  description: "Students spell words with image clues",
                  icon: FaKeyboard,
                  color: "green"
                }
              ].map((modeOption) => (
                <label
                  key={modeOption.key}
                  className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    mode === modeOption.key
                      ? `border-${modeOption.color}-500 bg-${modeOption.color}-50`
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={modeOption.key}
                    checked={mode === modeOption.key}
                    onChange={() => setMode(modeOption.key as "voice" | "qa")}
                    className="sr-only"
                  />
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                    mode === modeOption.key
                      ? `bg-${modeOption.color}-500 text-white`
                      : "bg-gray-200 text-gray-400"
                  }`}>
                    <modeOption.icon className="text-sm" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{modeOption.label}</div>
                    <div className="text-sm text-gray-500">{modeOption.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {mode === "none" && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Activity Mode</h3>
                <p className="text-gray-500">Choose how students will interact with your spelling activity</p>
              </div>
            )}

            {/* Voice Mode */}
            {mode === "voice" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Voice Mode Words</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {getWordCount()} word{getWordCount() !== 1 ? 's' : ''} added
                    </span>
                    <button
                      onClick={() => setInputWord([...inputWord, ""])}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus className="mr-2" />
                      Add Word
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {inputWord.map((val, idx) => (
                    <div
                      key={idx}
                      className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-4 font-medium">
                        {idx + 1}
                      </div>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleInputWord(idx, e.target.value)}
                        placeholder={`Enter word ${idx + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {inputWord.length > 1 && (
                        <button
                          onClick={() => setInputWord(inputWord.filter((_, i) => i !== idx))}
                          className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Mode */}
            {mode === "qa" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Visual Mode Items</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {getWordCount()} item{getWordCount() !== 1 ? 's' : ''} added
                    </span>
                    <button
                      onClick={handleAddItem}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaPlus className="mr-2" />
                      Add Item
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative bg-gray-50 rounded-lg border border-gray-200 p-6"
                    >
                      <div className="flex items-center mb-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full mr-3 font-medium">
                          {idx + 1}
                        </div>
                        <h4 className="text-lg font-medium text-gray-900">Item {idx + 1}</h4>
                        {items.length > 1 && (
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="ml-auto p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {/* Word Input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Word to Spell
                          </label>
                          <input
                            type="text"
                            placeholder="Enter the word students will spell"
                            value={item.Word}
                            onChange={(e) => handleChangeWord(idx, e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>

                        {/* Image Upload */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaImage className="inline mr-2" />
                            Visual Clue (Optional)
                          </label>
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(idx, e.target.files?.[0] ?? null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                              />
                            </div>
                            {item.Image && (
                              <img
                                src={URL.createObjectURL(item.Image)}
                                alt="Visual clue preview"
                                className="h-16 w-16 object-cover rounded-lg border border-gray-300 shadow-sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {mode !== "none" && (
                  <span>
                    {getWordCount()} word{getWordCount() !== 1 ? 's' : ''} • 
                    {duration > 0 ? ` ${duration} seconds` : ' No time limit'}
                  </span>
                )}
              </div>
              <button
                onClick={handleFinish}
                disabled={loading || mode === "none" || !activityName.trim()}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
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

export default Spelling;