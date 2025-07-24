
import React, { useState, useRef, useEffect } from "react";

// Enhanced KeywordDragDrop Component
interface KeywordDragDropProps {
  keywords: string[];
  targets: string[];
  correctAnswers: { [index: number]: string }; // Thêm correct answers
  onComplete?: (isCorrect: boolean) => void;
  onDropUpdate?: (dropped: { [index: number]: string | null }) => void;
  showResults?: boolean;
}

const KeywordDragDrop: React.FC<KeywordDragDropProps> = ({
  keywords,
  targets,
  correctAnswers,
  onComplete,
  onDropUpdate,
  showResults = false
}) => {

  const [droppedKeywords, setDroppedKeywords] = useState<{ [index: number]: string | null }>({});
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);
  const [draggedKeyword, setDraggedKeyword] = useState<string | null>(null);
  const [dragOverZone, setDragOverZone] = useState<number | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  useEffect(() => {
    setAvailableKeywords(keywords);
  }, [keywords]);

  // Reset game khi keywords thay đổi
  useEffect(() => {
    if (keywords.length > 0) {
      resetGame();
    }
  }, [keywords]);
  const dragCounter = useRef(0);
  // Xử lý drag start
  const handleDragStart = (e: React.DragEvent, keyword: string) => {
    setDraggedKeyword(keyword);
    e.dataTransfer.setData('text/plain', keyword);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Xử lý drag over drop zone
  const handleDragOver = (e: React.DragEvent, zoneIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverZone(zoneIndex);
  };

  // Xử lý drag enter
  const handleDragEnter = (e: React.DragEvent, zoneIndex: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverZone(zoneIndex);
  };

  // Xử lý drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverZone(null);
    }
  };

  // Xử lý drop
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverZone(null);

    const keyword = e.dataTransfer.getData('text/plain');
    if (!keyword) return;

    // Tìm vị trí cũ của keyword (nếu có)
    const oldIndex = Object.keys(droppedKeywords).find(
      key => droppedKeywords[parseInt(key)] === keyword
    );

    // Cập nhật state
    setDroppedKeywords(prev => {
      const newDropped = { ...prev };

      // Remove từ vị trí cũ
      if (oldIndex !== undefined) {
        newDropped[parseInt(oldIndex)] = null;
      }

      // Thêm vào vị trí mới
      newDropped[targetIndex] = keyword;
      onDropUpdate?.(newDropped);
      return newDropped;
    });

    // Cập nhật available keywords
    setAvailableKeywords(prev => {
      let newAvailable = [...prev];

      // Nếu keyword đang ở trong available pool
      if (prev.includes(keyword)) {
        newAvailable = prev.filter(k => k !== keyword);
      }

      // Nếu có keyword bị thay thế trong drop zone
      const replacedKeyword = droppedKeywords[targetIndex];
      if (replacedKeyword) {
        newAvailable = [...newAvailable, replacedKeyword];
      }

      return newAvailable;
    });

    setDraggedKeyword(null);
  };

  // Remove keyword khỏi drop zone
  const removeKeyword = (targetIndex: number) => {
    const keyword = droppedKeywords[targetIndex];
    if (!keyword) return;

    setDroppedKeywords(prev => {
      const updated = { ...prev, [targetIndex]: null };

      // ✅ Gọi callback khi xóa keyword
      onDropUpdate?.(updated);

      return updated;
    });

    setAvailableKeywords(prev => [...prev, keyword]);
  };

  // Kiểm tra kết quả
  const checkAnswers = () => {
    setShowValidation(true);
    const isCorrect = Object.keys(correctAnswers).every(
      index => droppedKeywords[parseInt(index)] === correctAnswers[parseInt(index)]
    );
    onComplete?.(isCorrect);
  };

  // Reset game
  const resetGame = () => {
    setDroppedKeywords({});
    setAvailableKeywords(keywords);
    setShowValidation(false);
    setDraggedKeyword(null);
    setDragOverZone(null);
  };

  // Keyboard support cho drop zones
  const handleKeyDown = (e: React.KeyboardEvent, targetIndex: number) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      removeKeyword(targetIndex);
    }
  };

  const getZoneStatus = (index: number) => {
    if (!showValidation) return 'neutral';
    const droppedKeyword = droppedKeywords[index];
    const correctKeyword = correctAnswers[index];

    if (!droppedKeyword) return 'empty';
    return droppedKeyword === correctKeyword ? 'correct' : 'incorrect';
  };

  const completedCount = Object.values(droppedKeywords).filter(Boolean).length;
  const isComplete = completedCount === targets.length;
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      const buffer = 100; // px từ mép dưới
      const y = e.clientY;
      const height = window.innerHeight;

      if (y > height - buffer) {
        window.scrollBy(0, 5); // scroll xuống
      } else if (y < buffer) {
        window.scrollBy(0, -5); // scroll lên
      }
    };

    window.addEventListener('dragover', handleDragOver);
    return () => window.removeEventListener('dragover', handleDragOver);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Keyword Matching Game</h2>
        <p className="text-gray-600">Drag keywords to their correct definitions</p>
      </div>

      {/* Keywords Pool */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          <h4 className="text-lg font-semibold text-gray-700">Available Keywords</h4>
          <span className="text-sm text-gray-500">({availableKeywords.length} remaining)</span>
        </div>

        <div className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-gray-200 shadow-inner">
          {availableKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center">
              {availableKeywords.map((keyword) => (
                <div
                  key={keyword}
                  draggable
                  onDragStart={(e) => handleDragStart(e, keyword)}
                  className={`
                    inline-block px-4 py-2 rounded-lg font-medium text-sm
                    bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md
                    cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-105
                    transition-all duration-200 select-none
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                    ${draggedKeyword === keyword ? 'opacity-50 scale-95' : ''}
                  `}
                  tabIndex={0}
                  role="button"
                  aria-label={`Drag keyword: ${keyword}`}
                >
                  {keyword}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">🎯 All keywords are in use!</p>
              <p className="text-sm mt-1">Remove keywords from drop zones to reuse them</p>
            </div>
          )}
        </div>
      </div>

      {/* Drop Targets */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <h4 className="text-lg font-semibold text-gray-700">Match Definitions</h4>
        </div>

        {targets.map((target, index) => {
          const status = getZoneStatus(index);
          const isOver = dragOverZone === index;

          return (
            <div key={index} className="group">
              <div className={`
                p-4 rounded-xl border-2 transition-all duration-200
                ${status === 'correct' ? 'bg-green-50 border-green-300' :
                  status === 'incorrect' ? 'bg-red-50 border-red-300' :
                    'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}
              `}>
                <div className="flex items-center gap-4">
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${status === 'correct' ? 'bg-green-500' :
                      status === 'incorrect' ? 'bg-red-500' :
                        'bg-gradient-to-r from-purple-500 to-pink-500'}
                  `}>
                    {status === 'correct' ? '✓' : status === 'incorrect' ? '✗' : index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800 mb-3 leading-relaxed">
                      {target}
                    </div>

                    <div
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      tabIndex={droppedKeywords[index] ? 0 : -1}
                      role="button"
                      aria-label={`Drop zone ${index + 1}: ${droppedKeywords[index] || 'empty'}`}
                      className={`
                        border-2 border-dashed rounded-xl p-4 min-h-16 flex items-center justify-center
                        transition-all duration-300 text-center font-medium
                        focus:outline-none focus:ring-2 focus:ring-purple-300
                        ${isOver ? 'border-blue-400 bg-blue-50 scale-105 shadow-lg' :
                          status === 'correct' ? 'border-green-400 bg-green-100' :
                            status === 'incorrect' ? 'border-red-400 bg-red-100' :
                              droppedKeywords[index] ? 'border-purple-400 bg-purple-50' :
                                'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'}
                      `}
                    >
                      {droppedKeywords[index] ? (
                        <div className="flex items-center gap-2">
                          <span className={`
                            px-3 py-1 rounded-lg shadow-sm border font-medium
                            ${status === 'correct' ? 'bg-green-100 border-green-300 text-green-800' :
                              status === 'incorrect' ? 'bg-red-100 border-red-300 text-red-800' :
                                'bg-white border-purple-200 text-purple-700'}
                          `}>
                            {droppedKeywords[index]}
                          </span>
                          <button
                            onClick={() => removeKeyword(index)}
                            className="w-5 h-5 bg-gray-400 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center transition-colors"
                            aria-label="Remove keyword"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm italic text-gray-500">
                          Drop keyword here
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress and Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span className="font-medium">Progress</span>
          <span className="font-bold">{completedCount} / {targets.length}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(completedCount / targets.length) * 100}%` }}
          ></div>
        </div>

        <div className="text-center text-sm text-gray-600 mb-4">
          {isComplete ? "🎉 All matches complete!" : `${targets.length - completedCount} more to go`}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={checkAnswers}
            disabled={!isComplete}
            className={`
              px-6 py-2 rounded-lg font-medium transition-all duration-200
              ${isComplete
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
            `}
          >
            Check Answers
          </button>

          <button
            onClick={resetGame}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Reset
          </button>
        </div>

        {showValidation && showResults && (
          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-2">Results:</h5>
            <div className="space-y-1 text-sm">
              {Object.keys(correctAnswers).map(index => {
                const idx = parseInt(index);
                const userAnswer = droppedKeywords[idx];
                const correctAnswer = correctAnswers[idx];
                const isCorrect = userAnswer === correctAnswer;

                return (
                  <div key={index} className={`
                    flex items-center gap-2 p-2 rounded
                    ${isCorrect ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}
                  `}>
                    <span>{isCorrect ? '✓' : '✗'}</span>
                    <span>Definition {idx + 1}: </span>
                    <span className="font-medium">
                      {userAnswer || 'No answer'}
                      {!isCorrect && ` (Correct: ${correctAnswer})`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordDragDrop;