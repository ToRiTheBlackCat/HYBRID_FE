import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flashcard } from '../../types';
import { createFlashCard } from '../../services/authService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toast } from 'react-toastify';
import { BookOpen, Check, Clock, Plus, Trash2, Upload } from 'lucide-react';

interface FlashcardDesignerProps {
  courseId?: string;
}

const FlashcardDesigner: React.FC<FlashcardDesignerProps> = ({ courseId }) => {
  console.log(courseId);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [minigameName, setMinigameName] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const teacherId = useSelector((state: RootState) => state.user.userId);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleChangeCard = (id: number, field: 'front' | 'back', value: string) => {
    setFlashcards(prev =>
      prev.map(card =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const handleAddCard = () => {
    const newId = flashcards.length > 0 ? Math.max(...flashcards.map(f => f.id)) + 1 : 1;
    setFlashcards([...flashcards, { id: newId, front: '', back: '' }]);
  };

  const handleDeleteCard = (id: number) => {
    setFlashcards(flashcards.filter(card => card.id !== id));
  };

  const handleCreateMinigame = async () => {
    if (!minigameName || !duration || flashcards.length === 0) return;

    const payload = {
      MinigameName: minigameName,
      TeacherId: teacherId,
      Duration: duration,
      TemplateId: "TP6",
      CourseId: courseId ?? '',
      ImageFile: imageFile,
      GameData: flashcards.map(({ front, back }) => ({ Front: front, Back: back })),
    };

    const result = await createFlashCard(payload);
    if(result){
      toast.success("Tạo thành công")
      navigate('/teacher/activities');
    }else{
      toast.error("Tạo không thành công");
    }
  };
  const isFormValid = minigameName.trim() && flashcards.some(card => card.front.trim() && card.back.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Thiết kế Flashcard
          </h1>
          <p className="text-gray-600">Tạo minigame học tập thú vị với flashcard tương tác</p>
        </div>

        {/* Game Info Card */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl mb-8 border border-white/20">
          <div className="flex items-center mb-6">
            <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-gray-800">Thông tin minigame</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                Tên hoạt động
              </label>
              <input
                type="text"
                value={minigameName}
                onChange={(e) => setMinigameName(e.target.value)}
                placeholder="Ví dụ: Ôn tập từ vựng tiếng Anh"
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Thời lượng (giây)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                placeholder="60"
                min="10"
                max="600"
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white/50"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Ảnh đại diện (tuỳ chọn)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors bg-white/50 cursor-pointer"
              />
              {imageFile && (
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <Check className="w-4 h-4 mr-1" />
                  Đã chọn: {imageFile.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flashcards Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-3 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-gray-800">
                Danh sách câu hỏi ({flashcards.length})
              </h2>
            </div>
            <button
              onClick={handleAddCard}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-2" />
              Thêm câu hỏi
            </button>
          </div>

          <div className="grid gap-6">
            {flashcards.map((card, index) => (
              <div
                key={card.id}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-gray-800">Câu hỏi {index + 1}</h3>
                  </div>
                  {flashcards.length > 1 && (
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Mặt trước (Câu hỏi)</label>
                    <input
                      type="text"
                      value={card.front}
                      onChange={(e) => handleChangeCard(card.id, 'front', e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white/70"
                      placeholder="Nhập câu hỏi..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Mặt sau (Câu trả lời)</label>
                    <textarea
                      value={card.back}
                      onChange={(e) => handleChangeCard(card.id, 'back', e.target.value)}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white/70 resize-none"
                      placeholder="Nhập câu trả lời..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <div className="text-center">
          <button
            onClick={handleCreateMinigame}
            disabled={!isFormValid}
            className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg transform hover:scale-105 ${
              isFormValid
                ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Check className="w-6 h-6 inline mr-2" />
            Tạo Minigame
          </button>
          {!isFormValid && (
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng nhập tên minigame và ít nhất một câu hỏi hoàn chỉnh
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 flex justify-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>{flashcards.length} câu hỏi</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{duration} giây</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 mr-1" />
                <span>{flashcards.filter(card => card.front.trim() && card.back.trim()).length} hoàn thành</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDesigner;
