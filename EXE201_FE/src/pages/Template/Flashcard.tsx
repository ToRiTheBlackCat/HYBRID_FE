import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flashcard } from '../../types';
import { createFlashCard } from '../../services/authService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toast } from 'react-toastify';

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Thiết kế Flashcard</h1>

        {/* Thông tin minigame */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Thông tin minigame</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hoạt động</label>
            <input
              type="text"
              value={minigameName}
              onChange={(e) => setMinigameName(e.target.value)}
              placeholder="Nhập tên minigame"
              className="w-full p-3 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (giây)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              placeholder="Nhập thời lượng"
              className="w-full p-3 rounded-lg border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện (tuỳ chọn)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Danh sách form Flashcards */}
        <div className="space-y-6">
          {flashcards.map((card) => (
            <div
              key={card.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mặt trước</label>
                <input
                  type="text"
                  value={card.front}
                  onChange={(e) => handleChangeCard(card.id, 'front', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Câu hỏi..."
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mặt sau</label>
                <textarea
                  value={card.back}
                  onChange={(e) => handleChangeCard(card.id, 'back', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Câu trả lời..."
                  rows={3}
                />
              </div>
              <button
                onClick={() => handleDeleteCard(card.id)}
                className="text-red-500 hover:underline"
              >
                Xóa câu hỏi này
              </button>
            </div>
          ))}
        </div>

        {/* Nút thêm flashcard */}
        <div className="mt-6">
          <button
            onClick={handleAddCard}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            ➕ Thêm câu hỏi
          </button>
        </div>

        {/* Nút tạo minigame */}
        {flashcards.length > 0 && (
          <div className="mt-6 text-right">
            <button
              onClick={handleCreateMinigame}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
            >
              ✅ Tạo Minigame
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardDesigner;
