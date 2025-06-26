import React, { useState } from 'react';
import { FaCopy, FaTrash } from 'react-icons/fa';
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
        min={10}
      />

      <label className="block text-lg font-semibold mb-2">Topic / Hint</label>
      <input
        type="text"
        value={topicHint}
        onChange={(e) => setTopicHint(e.target.value)}
        className="w-full border p-2 mb-4 rounded"
        placeholder="e.g. Animals, Colors, Fruits"
      />

      <label className="block text-lg font-semibold mb-2">Upload Thumbnail</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setThumbnail(e.target.files[0]);
          }
        }}
        className="w-full border p-2 mb-4 rounded"
      />
      <label className="block text-lg font-semibold mb-2">Dimension Size (Grid size)</label>
      <input
        type="number"
        value={dimensionSize}
        onChange={(e) => setDimensionSize(Number(e.target.value))}
        className="w-full border p-2 mb-4 rounded"
        min={5}
        max={30}
        placeholder="e.g. 10 for 10x10"
      />

      <h3 className="text-md font-semibold mb-2">Words</h3>
      {words.map((word, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <span className="w-6">{index + 1}.</span>
          <input
            type="text"
            value={word}
            onChange={(e) => handleWordChange(index, e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder={`Word ${index + 1}`}
          />
          <button onClick={() => handleCopy(index)} className="text-blue-500 hover:text-blue-700">
            <FaCopy className="h-5 w-5" />
          </button>
          <button onClick={() => handleDelete(index)} className="text-red-500 hover:text-red-700">
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

export default FindWordsScreen;
