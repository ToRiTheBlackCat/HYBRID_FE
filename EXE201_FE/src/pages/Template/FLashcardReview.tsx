import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPlayMinigames } from '../../services/authService';
import { Flashcard } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../components/HomePage/Header';
import EditFlashcard from '../Teacher/Template/EditFlashcard';
import { baseImageUrl } from '../../config/base';
import FlashcardRaw from '../Teacher/RawMinigameInfo/Flashcard';

const FlashcardReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [flipped, setFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activityName, setActivityName] = useState("");
  const [duration, setDuration] = useState(60);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        if (!minigameId) return;

        const data = await fetchPlayMinigames(minigameId);
        setActivityName(data.minigameName);
        setDuration(data.duration);
        setThumbnailUrl(data.thumbnailImage ? `${baseImageUrl}${data.thumbnailImage}` : null);
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
  const handleSave = (updated: {
    activityName: string;
    duration: number;
    pairs: { front: string; back: string }[];
    thumbnail: File | null;
  }) => {
    setActivityName(updated.activityName);
    setDuration(updated.duration);
    setFlashcards(
      updated.pairs.map((p, i) => ({ id: i + 1, front: p.front, back: p.back }))
    );
    // Nếu muốn cập nhật thumbnail preview, bạn có thể setThumbnailUrl(URL.createObjectURL(updated.thumbnail!))
  };


  return (
    <>
      <Header />
      {!isPlaying ? (
        <FlashcardRaw onStart={() => setIsPlaying(true)} />
      ) :
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Xem lại Flashcard
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            {/* Edit Section */}
            <div className="mb-8 flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <EditFlashcard
                  initialActivityName={activityName}
                  initialDuration={duration}
                  initialThumbnailUrl={thumbnailUrl}
                  initialPairs={flashcards.map(({ front, back }) => ({ front, back }))}
                  onSave={handleSave}
                />
              </div>
            </div>

            {flashcards.length > 0 ? (
              <div className="flex flex-col items-center space-y-8">
                {/* Progress Bar */}
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Tiến độ</span>
                    <span>{currentIndex + 1} / {flashcards.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Flashcard Section */}
                <div className="flex items-center justify-center space-x-8">
                  <button 
                    onClick={handlePrev} 
                    className="group bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-full p-4 shadow-lg hover:shadow-xl border border-white/20 hover:scale-105"
                  >
                    <ChevronLeft size={32} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                  </button>

                  <div className="card-container relative" onClick={handleFlip}>
                    <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                      <div className="card-front">
                        <div className="absolute top-4 left-4 px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-medium">
                          Câu hỏi
                        </div>
                        <div className="pt-12 text-center">
                          {flashcards[currentIndex].front}
                        </div>
                        <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
                          Nhấn để xem đáp án
                        </div>
                      </div>
                      <div className="card-back">
                        <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-sm rounded-full font-medium">
                          Đáp án
                        </div>
                        <div className="pt-12 text-center">
                          {flashcards[currentIndex].back}
                        </div>
                        <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
                          Nhấn để xem câu hỏi
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleNext} 
                    className="group bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-full p-4 shadow-lg hover:shadow-xl border border-white/20 hover:scale-105"
                  >
                    <ChevronRight size={32} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                  </button>
                </div>

                {/* Navigation Dots */}
                <div className="flex space-x-2">
                  {flashcards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index);
                        setFlipped(false);
                      }}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-600 text-lg">Chưa có flashcard nào để xem.</p>
                  <p className="text-gray-500 text-sm mt-2">Hãy thêm flashcard để bắt đầu học!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      }
    </>
  );
}

export default FlashcardReview;
