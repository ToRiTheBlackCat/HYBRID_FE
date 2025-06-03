import React, { useState, useEffect } from 'react';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';

const PairingReview: React.FC = () => {
  const words = ['Toy', 'Summer', 'Winter', 'Park', 'Fall', 'Spring'];
  const initialCards = Array(12)
    .fill(null)
    .map((_, i) => ({
      id: i,
      word: words[Math.floor(Math.random() * words.length)],
      isFlipped: false,
      isMatched: false,
    }));

  const [cards, setCards] = useState(initialCards);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards[firstId];
      const secondCard = cards[secondId];

      if (firstCard.word === secondCard.word) {
        setMatchedPairs([...matchedPairs, firstId, secondId]);
      }

      setTimeout(() => {
        setCards((prev) =>
          prev.map((card) =>
            flippedCards.includes(card.id)
              ? { ...card, isFlipped: true }
              : card
          )
        );
        setFlippedCards([]);
      }, 1000);
    }
  }, [flippedCards]);

  const handleCardClick = (id: number) => {
    if (
      flippedCards.length < 2 &&
      !cards[id].isFlipped &&
      !matchedPairs.includes(id)
    ) {
      setFlippedCards([...flippedCards, id]);
      setCards((prev) =>
        prev.map((card) =>
          card.id === id ? { ...card, isFlipped: true } : card
        )
      );
    }
  };

  const handleTryAgain = () => {
    const reshuffled = initialCards.map(card => ({
      ...card,
      isFlipped: false,
      isMatched: false,
    }));
    setCards(reshuffled);
    setMatchedPairs([]);
    setFlippedCards([]);
  };

  const handleSubmit = () => {
    alert(`You matched ${matchedPairs.length / 2} pairs!`);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 py-8">
        {/* CARD GRID */}
        <div className="w-[900px] h-[400px] bg-pink-100 border rounded-lg p-6 mb-12 flex justify-center items-center">
          <div className="grid grid-cols-3 gap-12 mt-5 mb-5">
            {cards.map((card) => {
              const isRevealed =
                card.isFlipped || matchedPairs.includes(card.id);
              const bgColor = isRevealed
                ? getColorClass(card.word)
                : 'bg-yellow-200';
              const borderColor = matchedPairs.includes(card.id)
                ? 'border-green-500'
                : 'border-gray-400';

              return (
                <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className="w-28 h-12 perspective"
                >
                <div className={`card-inner ${isRevealed ? 'rotate-y-180' : ''}`}>
                    {/* Mặt trước */}
                    <div className="backface-hidden bg-yellow-200 border border-gray-400 rounded-full flex items-center justify-center w-full h-full">
                    {/* Đây là mặt trước - ẩn từ */}
                    </div>

                    {/* Mặt sau */}
                    <div className={`backface-hidden rotate-y-180 ${bgColor} border ${borderColor} rounded-full flex items-center justify-center text-white text-lg font-medium font-quicksand w-full h-full`}>
                    {card.word}
                    </div>
                </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="w-full max-w-[700px] flex justify-between items-center px-4">
          <button
            onClick={handleTryAgain}
            className="px-6 py-2 bg-blue-200 text-blue-800 font-semibold rounded-full hover:bg-blue-300 transition font-quicksand"
          >
            Try again
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-200 text-green-800 font-semibold rounded-full hover:bg-green-300 transition font-quicksand"
          >
            Submit
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

const getColorClass = (word: string) => {
  const colors: Record<string, string> = {
    Toy: 'bg-green-500',
    Summer: 'bg-blue-500',
    Winter: 'bg-red-500',
    Park: 'bg-yellow-600',
    Fall: 'bg-orange-500',
    Spring: 'bg-purple-500',
  };
  return colors[word] || 'bg-gray-500';
};

export default PairingReview;
