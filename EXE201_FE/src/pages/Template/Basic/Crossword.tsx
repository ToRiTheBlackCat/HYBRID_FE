import React, { useState } from 'react';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCrossword } from '../../../services/authService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { toast } from 'react-toastify';

interface Entry {
  answer: string;
  clue: string;
}

const CrosswordEditor: React.FC = () => {
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState<number>(60); // Thời lượng chơi (phút)
  const [dimensionSize, setDimensionSize] = useState<number>(10); // Kích thước bảng
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<Entry[]>([{ answer: '', clue: '' }]);
  const navigate = useNavigate();
  const teacherId = useSelector((state: RootState) => state.user.userId);
  const { courseId } = useParams<{ courseId: string }>()
  const safeCourseId = courseId ?? '';

  const handleChange = (index: number, field: keyof Entry, value: string) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const handleAdd = () => {
    setEntries([...entries, { answer: '', clue: '' }]);
  };

  const handleDelete = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= entries.length) return;
    const updated = [...entries];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setEntries(updated);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleFinish = async () => {
    const crosswordData = {
      MinigameName: activityName,
      TeacherId: teacherId,
      Duration: duration,
      CourseId: safeCourseId,
      ImageFile: imageFile ?? null,
      GameData: [
        {
          DimensionSize: dimensionSize,
          Words: entries.map((e) => e.answer.trim().toUpperCase()),
          Clues: entries.map((e) => e.clue.trim()),
        },
      ],
    };

    const res = await createCrossword(crosswordData);
    console.log("data",crosswordData)

    if (res) {
      navigate('/teacher/activities');
    } else {
      toast.error('Tạo crossword thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Tạo Crossword</h1>

        {/* Form inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Activity Name</label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (phút)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              min={1}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dimension Size</label>
            <input
              type="number"
              value={dimensionSize}
              onChange={(e) => setDimensionSize(Number(e.target.value))}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
              min={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Upload Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md"
            />
          </div>
        </div>

        {/* Word entries */}
        <div className="overflow-x-auto max-h-[300px] border rounded-lg p-3 bg-gray-50 mb-6">
          <div className="grid grid-cols-12 font-semibold mb-2 px-2">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Answer</div>
            <div className="col-span-5">Clue</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          {entries.map((entry, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2 px-2">
              <div className="col-span-1">{index + 1}.</div>
              <input
                className="col-span-5 border border-gray-300 px-2 py-1 rounded"
                value={entry.answer}
                onChange={(e) => handleChange(index, 'answer', e.target.value)}
              />
              <input
                className="col-span-5 border border-gray-300 px-2 py-1 rounded"
                value={entry.clue}
                onChange={(e) => handleChange(index, 'clue', e.target.value)}
              />
              <div className="col-span-1 flex gap-1 justify-center items-center">
                <button onClick={() => handleMove(index, index - 1)}>
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => handleMove(index, index + 1)}>
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleAdd}
            className="bg-yellow-200 hover:bg-yellow-300 px-4 py-2 rounded-md font-medium"
          >
            + Add more
          </button>
          <button
            onClick={handleFinish}
            className="bg-lime-300 hover:bg-lime-400 px-6 py-2 rounded-md font-medium"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrosswordEditor;
