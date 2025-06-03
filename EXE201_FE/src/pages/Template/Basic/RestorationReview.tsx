import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';

interface Word {
  id: number;
  text: string;
}

const ItemTypes = {
  WORD: 'word',
};

const WordCard: React.FC<{ word: Word; index: number; moveWord: (from: number, to: number) => void; isInDropArea: boolean }> = ({ word, index, moveWord, isInDropArea }) => {
  const [, drag] = useDrag({
    type: ItemTypes.WORD,
    item: { id: word.id, index },
  });

  return (
    <div
      ref={drag}
      className={`px-4 py-2 bg-yellow-200 text-black rounded-full cursor-move ${isInDropArea ? 'opacity-50' : ''} text-center`}
    >
      {word.text}
    </div>
  );
};

const DropArea: React.FC<{ words: Word[]; moveWord: (word: Word, from: number) => void; setDroppedWords: React.Dispatch<React.SetStateAction<Word[]>>; originalWords: Word[] }> = ({ words, moveWord, setDroppedWords, originalWords }) => {
  const [, drop] = useDrop({
    accept: ItemTypes.WORD,
    drop: (item: { id: number; index: number }) => {
      const droppedWord = originalWords[item.index];
      if (droppedWord) {
        setDroppedWords((prev) => [...prev, droppedWord]);
        moveWord(droppedWord, item.index);
      }
    },
  });

  return (
    <div
      ref={drop}
      className="w-full h-12 border border-gray-400 rounded flex items-center justify-center space-x-2 p-2"
    >
      {words.length === 0 ? (
        <span className="text-gray-500">Drop words here</span>
      ) : (
        words.map((word, index) => (
          <WordCard key={word.id} word={word} index={index} moveWord={() => {}} isInDropArea={true} />
        ))
      )}
    </div>
  );
};

const RestorationReview: React.FC = () => {
  const sampleSentence = "I am a student";
  const wordsArray = sampleSentence.split(' ').filter(word => word.length > 0);
  const shuffledWords = wordsArray
    .map((word, index) => ({ id: index, text: word }))
    .sort(() => Math.random() - 0.5);

  const [words, setWords] = useState<Word[]>(shuffledWords);
  const [droppedWords, setDroppedWords] = useState<Word[]>([]);

  const moveWord = (word: Word, fromIndex: number) => {
    const newWords = words.filter((_, index) => index !== fromIndex);
    setWords(newWords);
  };

  const handleTryAgain = () => {
    setWords(shuffledWords);
    setDroppedWords([]);
  };

  const handleSubmit = () => {
    const reconstructedSentence = droppedWords.map(word => word.text).join(' ');
    if (reconstructedSentence === sampleSentence) {
      alert('Correct! You reconstructed the sentence successfully.');
    } else {
      alert('Incorrect. Try again!');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Header />
      <div className="min-h-screen mt-25 mb-20 flex flex-col justify-center items-center bg-white px-4 py-8">
        {/* Word Grid */}
        <div className="w-[900px] h-[400px] bg-pink-100 border rounded-lg p-6 mb-12 flex justify-center items-center">
          <div className="grid grid-cols-3 gap-12 mt-5 mb-5">
            {words.map((word, index) => (
              <WordCard
                key={word.id}
                word={word}
                index={index}
                moveWord={moveWord}
                isInDropArea={false}
              />
            ))}
          </div>
        </div>

        {/* Drop Area */}
        <div className='w-225 h-20'>
            <DropArea words={droppedWords} moveWord={moveWord} setDroppedWords={setDroppedWords} originalWords={words} />
        </div>
        

        {/* Buttons */}
        <div className="w-full max-w-[700px] flex justify-between items-center px-4 mt-4">
          <button
            onClick={handleTryAgain}
            className="px-6 py-2 bg-blue-200 text-blue-800 font-semibold rounded-full hover:bg-blue-300 transition"
          >
            Try again
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-200 text-green-800 font-semibold rounded-full hover:bg-green-300 transition"
          >
            Submit
          </button>
        </div>
      </div>
      <Footer />
    </DndProvider>
  );
};

export default RestorationReview;