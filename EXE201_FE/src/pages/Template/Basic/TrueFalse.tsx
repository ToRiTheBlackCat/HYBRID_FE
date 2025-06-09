import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface QuestionAnswer {
  question: string;
  answer: string;
}

const TrueFalse: React.FC = () => {
  const [activityName, setActivityName] = useState('');
  const [questionsAnswers, setQuestionsAnswers] = useState<QuestionAnswer[]>([
    { question: '', answer: 'True' },
    { question: '', answer: 'True' },
    { question: '', answer: 'True' },
  ]);
  const navigate = useNavigate();

  const handleAddMore = () => {
    setQuestionsAnswers([...questionsAnswers, { question: '', answer: 'True' }]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestionsAnswers = [...questionsAnswers];
    newQuestionsAnswers[index].question = value;
    setQuestionsAnswers(newQuestionsAnswers);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newQuestionsAnswers = [...questionsAnswers];
    newQuestionsAnswers[index].answer = value;
    setQuestionsAnswers(newQuestionsAnswers);
  };

  const handleDelete = (index: number) => {
    const newQuestionsAnswers = questionsAnswers.filter((_, i) => i !== index);
    setQuestionsAnswers(newQuestionsAnswers);
  };

  return (
    <>
      <div className="p-4 w-[900px] mt-25 mb-30 mx-auto bg-white border rounded shadow">
        <label className="block text-lg font-semibold mb-2">Activity name</label>
        <input
          type="text"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
          placeholder="Enter activity name"
        />

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Questions</span>
            <span className="font-semibold">Answer</span>
          </div>
          {questionsAnswers.map((qa, index) => (
            <div key={index} className="flex items-center mb-2">
              <span className="w-8 text-sm font-medium">{index + 1}.</span>
              <input
                type="text"
                value={qa.question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                className="flex-1 border p-2 rounded mr-2"
                placeholder={`Question ${index + 1}`}
              />
              <select
                value={qa.answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="border p-2 rounded w-32"
              >
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
              
              <button
                onClick={() => handleDelete(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <FaTrash className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={handleAddMore}
            className="bg-yellow-300 text-black px-4 py-2 rounded hover:bg-yellow-400"
          >
            + Add more
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => navigate('/true-false-review', { state: { activityName, questionsAnswers } })}
          >
            Finish
          </button>
        </div>
      </div>
    </>
  );
};

export default TrueFalse;