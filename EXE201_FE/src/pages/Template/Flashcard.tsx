import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Flashcard {
  id: number;
  front: string;
  back: string;
}
interface FlashcardDesignerProps {
  courseId?: string;
}

const FlashcardDesigner: React.FC<FlashcardDesignerProps> = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [front, setFront] = useState<string>('');
  const [back, setBack] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;

    if (editingId !== null) {
      // Update existing flashcard
      setFlashcards(flashcards.map(card =>
        card.id === editingId ? { ...card, front, back } : card
      ));
      setEditingId(null);
    } else {
      // Add new flashcard
      setFlashcards([...flashcards, {
        id: flashcards.length + 1,
        front,
        back,
      }]);
    }
    setFront('');
    setBack('');
  };

  const handleEdit = (card: Flashcard) => {
    setFront(card.front);
    setBack(card.back);
    setEditingId(card.id);
  };

  const handleDelete = (id: number) => {
    setFlashcards(flashcards.filter(card => card.id !== id));
  };

  const handleFlip = (id: number) => {
    setFlipped(flipped === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Thiết kế Flashcard</h1>

        {/* Form to create/edit flashcard */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editingId !== null ? 'Chỉnh sửa Flashcard' : 'Tạo Flashcard Mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mặt trước (Câu hỏi)</label>
              <input
                type="text"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mặt sau (Trả lời)</label>
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Nhập câu trả lời..."
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
              onClick={() => navigate('/flashcard-review')}
            >
              {editingId !== null ? 'Cập nhật' : 'Tạo Flashcard'}
            </button>
          </form>
        </div>

        {/* Flashcard List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flashcards.length > 0 ? (
            flashcards.map(card => (
              <div
                key={card.id}
                className="relative bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Flip Card */}
                <div
                  className={`relative h-48 cursor-pointer transition-transform duration-500 transform-style-preserve-3d ${
                    flipped === card.id ? 'rotate-y-180' : ''
                  }`}
                  onClick={() => handleFlip(card.id)}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-4 bg-blue-100 backface-hidden">
                    <p className="text-lg font-medium text-gray-800">{card.front}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center p-4 bg-green-100 backface-hidden rotate-y-180">
                    <p className="text-lg font-medium text-gray-800">{card.back}</p>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="p-4 flex justify-between">
                  <button
                    onClick={() => handleEdit(card)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">Chưa có flashcard nào. Hãy tạo flashcard mới!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardDesigner;