import React, { useState } from 'react';
import { FaCopy, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';

const FindWordsScreen: React.FC = () => {
  const [activityName, setActivityName] = useState('');
  const [words, setWords] = useState<string[]>(['', '', '', '']);
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
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords);
  };

  const handleCopy = (index: number) => {
    navigator.clipboard.writeText(words[index]);
  };

  return (
    <>
      <Header />
      <div className="p-4 w-[900px] mt-25 mb-30 mx-auto bg-white border rounded shadow">
        <label className="block text-lg font-semibold mb-2">Activity name</label>
        <input
          type="text"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
          placeholder="Enter activity name"
        />

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
          onClick={() => navigate('/find-word-review')}>
          Finish
        </button>
      </div>
    </div>
    <Footer />
    </>
  );
}
export default FindWordsScreen;