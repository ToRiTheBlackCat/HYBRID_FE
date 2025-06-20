import React, { useState } from 'react';
import { FaCopy, FaTrash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { createPairing } from '../../../services/authService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { toast } from 'react-toastify';

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
    <div className="p-4 w-[900px] mt-25 mb-30 mx-auto bg-white border rounded shadow">
      <label className="block text-lg font-semibold mb-2">Activity name</label>
      <input
        type="text"
        value={activityName}
        onChange={(e) => setActivityName(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        placeholder="Enter activity name"
      />

      <label className="block text-lg font-semibold mb-2">Duration (seconds)</label>
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="w-full border p-2 mb-4 rounded"
        placeholder="Enter duration"
        min={10}
      />
      <label className="block text-lg font-semibold mb-2">Thumbnail Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleThumbnailChange}
        className="mb-4"
      />
      {thumbnailPreview && (
        <img
          src={thumbnailPreview}
          alt="Thumbnail preview"
          className="w-48 h-32 object-cover rounded mb-4"
        />
      )}

      <label className="block text-lg font-semibold mb-2">Words</label>
      {words.map((word, index) => (
        <div key={index} className="flex items-center mb-2">
          <span className="w-8 text-sm font-medium">{index + 1}.</span>
          <input
            type="text"
            value={word}
            onChange={(e) => handleWordChange(index, e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder={`Word ${index + 1}`}
          />
          <button
            onClick={() => handleCopy(index)}
            className="ml-2 text-blue-500 hover:text-blue-700"
          >
            <FaCopy className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDelete(index)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <FaTrash className="h-5 w-5" />
          </button>
        </div>
      ))}

      <div className="flex justify-between mt-4">
        <button
          onClick={handleAddMore}
          className="bg-yellow-300 text-black px-4 py-2 rounded hover:bg-yellow-400"
        >
          + Add more
        </button>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleSubmit}
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default PairingScreen;
