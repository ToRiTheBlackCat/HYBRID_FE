import React, { useState } from 'react';
import { FaCopy, FaTrash, FaPlus, FaGamepad, FaClock, FaImage, FaLightbulb, FaFont } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { createFindWord } from '../../../services/authService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { toast } from 'react-toastify';

const FindWordsScreen: React.FC = () => {
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [topicHint, setTopicHint] = useState('');
  const [words, setWords] = useState<string[]>(['']);
  const [dimensionSize, setDimensionSize] = useState<number>(20);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teacherId = useSelector((state: RootState) => state.user.userId);
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const handleAddMore = () => {
    setWords([...words, '']);
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleDelete = (index: number) => {
    setWords(words.filter((_, i) => i !== index));
  };

  const handleCopy = (index: number) => {
    navigator.clipboard.writeText(words[index]);
    toast.success("📋 Word copied to clipboard!");
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!activityName.trim() || !duration || !topicHint.trim() || words.length === 0 || !courseId || !teacherId) {
      toast.error("❌ Please complete all required fields.");
      return;
    }

    const cleanWords = words.filter(w => w.trim() !== '');
    if (cleanWords.length === 0) {
      toast.error("❌ Please enter at least one valid word.");
      return;
    }

    if (cleanWords.length < 3) {
      toast.error("❌ Please enter at least 3 words for better gameplay.");
      return;
    }

    setIsSubmitting(true);

    const findWordData = {
      MinigameName: activityName,
      TeacherId: teacherId,
      Duration: duration,
      CourseId: courseId,
      ImageFile: thumbnail,
      GameData: [{
        Hint: topicHint,
        DimensionSize: dimensionSize,
        Words: cleanWords,
      }],
    };

    const res = await createFindWord(findWordData);
    if (res) {
      toast.success("✅ Find Word created successfully!");
      navigate("/teacher/activities");
    } else {
      toast.error("❌ Failed to create Find Word.");
    }
    
    setIsSubmitting(false);
  };

  const validWords = words.filter(w => w.trim() !== '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <FaGamepad className="text-purple-600" />
            Create Find Words Game
          </h1>
          <p className="text-gray-600">Design an engaging word search puzzle for your students</p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Game Setup Progress</h3>
            <span className="text-sm text-gray-500">
              {validWords.length} words • {formatDuration(duration)} duration
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (validWords.length / 5) * 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Recommended: At least 5 words for optimal gameplay
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Settings */}
          <div className="space-y-6">
            {/* Activity Name */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaGamepad className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Activity Name</h3>
                  <p className="text-sm text-gray-500">Give your game a catchy title</p>
                </div>
              </div>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-purple-500 p-3 rounded-lg transition-colors duration-200"
                placeholder="e.g. Animal Kingdom Word Search"
              />
            </div>

            {/* Duration & Grid Size */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FaClock className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Game Settings</h3>
                  <p className="text-sm text-gray-500">Configure duration and grid size</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-lg transition-colors duration-200"
                    min={10}
                    max={600}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Time limit: {formatDuration(duration)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grid Size
                  </label>
                  <input
                    type="number"
                    value={dimensionSize}
                    onChange={(e) => setDimensionSize(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-lg transition-colors duration-200"
                    min={5}
                    max={30}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Grid: {dimensionSize} × {dimensionSize}
                  </p>
                </div>
              </div>
            </div>

            {/* Topic Hint */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <FaLightbulb className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Topic / Hint</h3>
                  <p className="text-sm text-gray-500">Help students understand the theme</p>
                </div>
              </div>
              <input
                type="text"
                value={topicHint}
                onChange={(e) => setTopicHint(e.target.value)}
                className="w-full border-2 border-gray-200 focus:border-yellow-500 p-3 rounded-lg transition-colors duration-200"
                placeholder="e.g. Animals, Colors, Fruits, Science Terms"
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <FaImage className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Thumbnail</h3>
                  <p className="text-sm text-gray-500">Upload a preview image (optional)</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="w-full border-2 border-gray-200 focus:border-green-500 p-3 rounded-lg transition-colors duration-200"
                />
                
                {thumbnailPreview && (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => {
                        setThumbnail(null);
                        setThumbnailPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Words Management */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <FaFont className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Words List</h3>
                    <p className="text-sm text-gray-500">
                      {validWords.length} words added
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleAddMore}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-md"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Word
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {words.map((word, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => handleWordChange(index, e.target.value)}
                      className="flex-1 border-2 border-gray-200 focus:border-indigo-500 p-2 rounded-lg transition-colors duration-200"
                      placeholder={`Word ${index + 1}`}
                    />
                    <button 
                      onClick={() => handleCopy(index)} 
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Copy word"
                    >
                      <FaCopy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(index)} 
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete word"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {validWords.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FaFont className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No words added yet</p>
                  <p className="text-sm">Click "Add Word" to get started</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{validWords.length}</div>
                  <div className="text-sm text-purple-700">Words</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dimensionSize}×{dimensionSize}</div>
                  <div className="text-sm text-blue-700">Grid Size</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatDuration(duration)}</div>
                  <div className="text-sm text-green-700">Duration</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round((validWords.length / (dimensionSize * dimensionSize)) * 100)}%
                  </div>
                  <div className="text-sm text-yellow-700">Density</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => navigate("/teacher/activities")}
            className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || validWords.length < 3}
            className={`px-8 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg flex items-center gap-2 ${
              isSubmitting || validWords.length < 3
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transform hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <FaGamepad className="w-5 h-5" />
                Create Game
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>💡 Tip: Use related words for better gameplay experience</p>
          <p>📝 Students will search for these words in the grid</p>
        </div>
      </div>
    </div>
  );
};

export default FindWordsScreen;