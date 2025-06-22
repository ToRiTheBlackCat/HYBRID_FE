import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPlayMinigames, submitAccomplishment } from '../../../services/authService';
import { Flashcard, Accomplishment } from '../../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../../components/HomePage/Header';

const PlayFlashcard: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [flipped, setFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

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
        setStartTime(new Date());
      } catch (err) {
        console.error('Error fetching flashcards', err);
      }
    };

    loadFlashcards();
  }, [minigameId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!submitted) handleSubmit();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [submitted]);

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

  const handleReset = () => {
    setFlipped(false);
    setCurrentIndex(0);
  };

  const handleSubmit = async () => {
    if (submitted || !minigameId || !startTime) return;
    setSubmitted(true);

    const durationUsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const viewed = currentIndex + 1;
    const percent = Math.round((viewed / flashcards.length) * 100);

    const payload: Accomplishment = {
      MinigameId: minigameId,
      Percent: percent,
      DurationInSecond: durationUsed,
      TakenDate: new Date(),
    };

    try {
      await submitAccomplishment(payload);
    } catch (err) {
      console.error('submitAccomplishment error:', err);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Xem lại Flashcard</h1>

        {flashcards.length > 0 ? (
          <>
            <div className="flex items-center space-x-6">
              <button onClick={handlePrev} className="text-gray-700 hover:text-black">
                <ChevronLeft size={40} />
              </button>

              <div className="card-container" onClick={handleFlip}>
                <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                  <div className="card-front">{flashcards[currentIndex].front}</div>
                  <div className="card-back">{flashcards[currentIndex].back}</div>
                </div>
              </div>

              <button onClick={handleNext} className="text-gray-700 hover:text-black">
                <ChevronRight size={40} />
              </button>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                disabled={submitted}
              >
                Done
              </button>
              <button
                onClick={handleReset}
                className="bg-yellow-400 text-white px-6 py-2 rounded hover:bg-yellow-500"
              >
                Reset
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 mt-8">Chưa có flashcard nào để xem.</p>
        )}
      </div>
    </>
  );
};

export default PlayFlashcard;
