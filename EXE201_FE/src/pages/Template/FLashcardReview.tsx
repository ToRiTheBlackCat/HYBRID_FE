import React, { useState } from 'react';

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

const FlashcardReview: React.FC = () => {
  const [flipped, setFlipped] = useState<number | null>(null);
  const [flashcards] = useState<Flashcard[]>([
    { id: 1, front: 'What is 1 + 1?', back: '2' },
    { id: 2, front: 'Capital of Vietnam?', back: 'Hanoi' },
    { id: 3, front: 'What is H2O?', back: 'Water' },
  ]);

  const handleFlip = (id: number) => {
    setFlipped(flipped === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Xem lại Flashcard</h1>
        
        <div className="mb-6">
          <a
            href="/flashcard"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Quay lại Thiết kế Flashcard
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flashcards.length > 0 ? (
            flashcards.map(card => (
              <div
                key={card.id}
                className="relative bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div
                  className="relative h-48 cursor-pointer transition-transform duration-500 transform-style-preserve-3d"
                  onClick={() => handleFlip(card.id)}
                >
                  {/* Front side */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center p-4 bg-blue-100 backface-hidden ${
                      flipped === card.id ? 'rotate-y-180' : ''
                    }`}
                  >
                    <p className="text-lg font-medium text-gray-800">{card.front}</p>
                  </div>
                  {/* Back side */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center p-4 bg-green-100 backface-hidden ${
                      flipped === card.id ? '' : 'rotate-y-180'
                    }`}
                  >
                    <p className="text-lg font-medium text-gray-800">{card.back}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">Chưa có flashcard nào để xem.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardReview;