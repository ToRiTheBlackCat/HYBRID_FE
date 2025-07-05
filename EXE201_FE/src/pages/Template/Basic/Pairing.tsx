import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPairing } from '../../../services/authService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { toast } from 'react-toastify';
import { Clock, Copy, Trash2, Type, Upload, Image as ImageIcon } from 'lucide-react';

const PairingScreen: React.FC = () => {
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState(120);         
  const [words, setWords] = useState<string[]>(['']);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const teacherId = useSelector((state: RootState) => state.user.userId);

  const templateId = "TP8";   
  const { courseId } = useParams<{ courseId: string }>();                         

  const handleAddMore = () => {
    setWords([...words, '']);
  };

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleDelete = (index: number) => {
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords);
  };

  const handleCopy = (index: number) => {
    navigator.clipboard.writeText(words[index]);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);

    if (file) {
      const preview = URL.createObjectURL(file);
      setThumbnailPreview(preview);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!activityName || words.some(w => w.trim() === '') || duration <= 0) {
      toast.error("Please enter all fields and valid duration.");
      return;
    }

    const pairingData = {
      MinigameName: activityName,
      TeacherId: teacherId,
      Duration: duration,
      TemplateId: templateId,
      CourseId: courseId || '', 
      ImageFile: thumbnailFile,
      GameData: [
        {
          words: words,
        },
      ],
    };

    const result = await createPairing(pairingData);
    if (result) {
      toast.success("Pairing game created successfully!");
      navigate('/teacher/activities');
    } else {
      toast.error("Failed to create pairing game.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Create Pairing Game
          </h1>
          <p className="text-gray-600 text-lg">Design an engaging word pairing activity for your students</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8 mb-8">
          {/* Activity Name Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Type className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Activity Details</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">Activity Name</label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full border-2 border-gray-200 bg-white/80 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-800 placeholder-gray-500"
                  placeholder="Enter a creative activity name"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">Duration</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 bg-white/80 p-4 pl-12 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-800"
                    placeholder="Enter duration in seconds"
                    min={10}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Thumbnail Image</h2>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 transition-colors duration-300">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="cursor-pointer flex flex-col items-center justify-center text-center"
              >
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-48 h-32 object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <Upload className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-lg font-medium">Click to upload thumbnail</p>
                    <p className="text-sm">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Words Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Type className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Words List</h2>
              <div className="ml-auto">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {words.length} words
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {words.map((word, index) => (
                <div key={index} className="group">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => handleWordChange(index, e.target.value)}
                      className="flex-1 border-2 border-gray-200 bg-white/80 p-3 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-800"
                      placeholder={`Enter word ${index + 1}`}
                    />
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleCopy(index)}
                        className="p-3 text-blue-500 hover:bg-blue-100 rounded-lg transition-all duration-300 hover:scale-105"
                        title="Copy word"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-3 text-red-500 hover:bg-red-100 rounded-lg transition-all duration-300 hover:scale-105"
                        title="Delete word"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={handleAddMore}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span className="text-xl">+</span>
              Add More Words
            </button>
            
            <button 
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              onClick={handleSubmit}
            >
              <span>✨</span>
              Create Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PairingScreen;
