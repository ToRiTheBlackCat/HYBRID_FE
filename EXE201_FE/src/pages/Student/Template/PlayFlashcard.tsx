import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPlayMinigames } from '../../../services/authService';
import { Flashcard } from '../../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../../components/HomePage/Header';

const PlayFlashcard: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [flipped, setFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);


  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        if (!minigameId) return;

        const data = await fetchPlayMinigames(minigameId);
        const raw = data.dataText as string;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(raw, 'application/xml');
        const questionNodes = Array.from(xmlDoc.getElementsByTagName('question'));

        const parsedFlashcards: Flashcard[] = questionNodes.map((node, index) => {
          const front = node.getElementsByTagName('front')[0]?.textContent || '';
          const back = node.getElementsByTagName('back')[0]?.textContent || '';
          return { id: index + 1, front, back };
        });

        setFlashcards(parsedFlashcards);
      } catch (err) {
        console.error('Error fetching flashcards', err);
      }
    };

    loadFlashcards();
  }, [minigameId]);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };


  return (
    <>
      <Header />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Xem lại Flashcard</h1>

          {flashcards.length > 0 ? (
            <div className="flex items-center space-x-6">
              <button onClick={handlePrev} className="text-gray-700 hover:text-black">
                <ChevronLeft size={40} />
              </button>

              <div className="card-container" onClick={handleFlip}>
                <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                  <div className="card-front">
                    {flashcards[currentIndex].front}
                  </div>
                  <div className="card-back">
                    {flashcards[currentIndex].back}
                  </div>
                </div>
              </div>

              <button onClick={handleNext} className="text-gray-700 hover:text-black">
                <ChevronRight size={40} />
              </button>
            </div>
          ) : (
            <p className="text-gray-500 mt-8">Chưa có flashcard nào để xem.</p>
          )}

        </div>
    </>
  );
};

export default PlayFlashcard;
