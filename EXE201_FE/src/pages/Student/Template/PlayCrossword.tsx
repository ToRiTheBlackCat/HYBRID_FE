import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';
import { fetchPlayMinigames, submitAccomplishment } from '../../../services/authService';
import { toast } from 'react-toastify';
import { Accomplishment } from '../../../types';

interface Position {
  row: number;
  col: number;
}

interface WordPlacement {
  word: string;
  start: Position;
  direction: 'horizontal' | 'vertical';
  number: number;
  clue: string;
}

const gridSize = 15;
const cellSize = 35;

const createEmptyGrid = () => Array.from({ length: gridSize }, () => Array(gridSize).fill(''));

const canPlace = (
  word: string,
  grid: string[][],
  row: number,
  col: number,
  direction: 'horizontal' | 'vertical'
): boolean => {
  for (let i = 0; i < word.length; i++) {
    const r = direction === 'vertical' ? row + i : row;
    const c = direction === 'horizontal' ? col + i : col;

    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
    const current = grid[r][c];
    if (current !== '' && current !== word[i]) return false;
  }
  return true;
};

const placeWord = (
  word: string,
  grid: string[][],
  placed: WordPlacement[],
  index: number,
  clue: string
): WordPlacement | null => {
  for (let i = 0; i < word.length; i++) {
    const char = word[i];

    for (const existing of placed) {
      const { word: existingWord, start, direction } = existing;

      for (let j = 0; j < existingWord.length; j++) {
        if (existingWord[j] !== char) continue;

        const r = direction === 'horizontal' ? start.row : start.row + j;
        const c = direction === 'horizontal' ? start.col + j : start.col;

        const newDirection = direction === 'horizontal' ? 'vertical' : 'horizontal';
        const startRow = newDirection === 'horizontal' ? r : r - i;
        const startCol = newDirection === 'horizontal' ? c - i : c;

        if (canPlace(word, grid, startRow, startCol, newDirection)) {
          return {
            word,
            clue,
            number: index + 1,
            direction: newDirection,
            start: { row: startRow, col: startCol }
          };
        }
      }
    }
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (canPlace(word, grid, r, c, 'horizontal')) {
        return { word, clue, number: index + 1, direction: 'horizontal', start: { row: r, col: c } };
      }
      if (canPlace(word, grid, r, c, 'vertical')) {
        return { word, clue, number: index + 1, direction: 'vertical', start: { row: r, col: c } };
      }
    }
  }
  return null;
};

const PlayCrossword: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [solutionGrid, setSolutionGrid] = useState<string[][]>([]);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [wordPlacements, setWordPlacements] = useState<WordPlacement[]>([]);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [hints, setHints] = useState<{ text: string; start: Position; direction: 'horizontal' | 'vertical' }[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [shownHints, setShownHints] = useState<string[]>([]);
  const [activeDirection, setActiveDirection] = useState<'horizontal' | 'vertical' | null>(null);
  const [activeWord, setActiveWord] = useState<WordPlacement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const getLocalISOTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localTime = new Date(now.getTime() - offset * 60 * 1000);
    return localTime.toISOString().slice(0, -1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!minigameId) return;

      const data = await fetchPlayMinigames(minigameId);
      setTimeLeft(data.duration || 60);

      const xml = new DOMParser().parseFromString(data.dataText, 'application/xml');

      const words = Array.from(xml.querySelectorAll('words')).map(n => n.textContent?.trim() || '').filter(Boolean);
      const clues = Array.from(xml.querySelectorAll('clues')).map(n => n.textContent?.trim() || '').filter(Boolean);

      const grid = createEmptyGrid();
      const placements: WordPlacement[] = [];

      words.forEach((word, i) => {
        const placement = placeWord(word, grid, placements, i, clues[i]);
        if (placement) {
          placements.push(placement);
          for (let j = 0; j < word.length; j++) {
            const r = placement.direction === 'vertical' ? placement.start.row + j : placement.start.row;
            const c = placement.direction === 'horizontal' ? placement.start.col + j : placement.start.col;
            grid[r][c] = word[j];
          }
        }
      });

      const minRow = Math.min(...placements.map(p => p.start.row));
      const maxRow = Math.max(...placements.map(p =>
        p.direction === 'vertical' ? p.start.row + p.word.length - 1 : p.start.row
      ));
      const minCol = Math.min(...placements.map(p => p.start.col));
      const maxCol = Math.max(...placements.map(p =>
        p.direction === 'horizontal' ? p.start.col + p.word.length - 1 : p.start.col
      ));

      const offsetRow = Math.floor((gridSize - (maxRow - minRow + 1)) / 2) - minRow;
      const offsetCol = Math.floor((gridSize - (maxCol - minCol + 1)) / 2) - minCol;

      const centeredPlacements = placements.map(p => ({
        ...p,
        start: {
          row: p.start.row + offsetRow,
          col: p.start.col + offsetCol
        }
      }));

      const centeredGrid = createEmptyGrid();
      centeredPlacements.forEach(({ word, start, direction }) => {
        for (let i = 0; i < word.length; i++) {
          const r = direction === 'vertical' ? start.row + i : start.row;
          const c = direction === 'horizontal' ? start.col + i : start.col;
          centeredGrid[r][c] = word[i];
        }
      });

      setSolutionGrid(centeredGrid);
      setUserGrid(createEmptyGrid());
      setWordPlacements(centeredPlacements);
    };

    fetchData();
  }, [minigameId]);

  useEffect(() => {
    if (!isPaused && timeLeft > 0 && isGameStarted) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      toast.error("⏰ Time's up!");
      setIsPaused(true);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isPaused, isGameStarted]);

  const handleInputChange = (row: number, col: number, value: string) => {
    if (!isGameStarted || isPaused) return;
    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = value.toUpperCase().slice(0, 1);
    setUserGrid(newGrid);

    if (activeDirection && activeWord && value) {
      const nextIndex = activeIndex + 1;
      const nextRow = activeDirection === 'vertical' ? activeWord.start.row + nextIndex : activeWord.start.row;
      const nextCol = activeDirection === 'horizontal' ? activeWord.start.col + nextIndex : activeWord.start.col;

      if (
        nextRow < gridSize &&
        nextCol < gridSize &&
        solutionGrid[nextRow]?.[nextCol]
      ) {
        inputRefs.current[nextRow][nextCol]?.focus();
        setActiveIndex(nextIndex);
      }
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isGameStarted || isPaused) return;
    if (!solutionGrid[row][col]) return setSelectedCell(null);
    setSelectedCell({ row, col });

    const matched = wordPlacements.find(({ start, direction, word }) => {
      const len = word.length;
      return (
        (direction === 'horizontal' && row === start.row && col >= start.col && col < start.col + len) ||
        (direction === 'vertical' && col === start.col && row >= start.row && row < start.row + len)
      );
    });

    if (matched) {
      setActiveDirection(matched.direction);
      setActiveWord(matched);
      setActiveIndex(
        matched.direction === 'horizontal' ? col - matched.start.col : row - matched.start.row
      );
    }

    const matchedHints = wordPlacements.filter(({ start, direction, word }) => {
      const len = word.length;
      return (
        (direction === 'horizontal' && row === start.row && col >= start.col && col < start.col + len) ||
        (direction === 'vertical' && col === start.col && row >= start.row && row < start.row + len)
      );
    }).map(({ number, clue, word, start, direction }) => ({
      id: `${number}-${direction}`,
      text: `${number}. ${direction === 'horizontal' ? 'Across' : 'Down'}: ${clue} (${word.length} letters)`,
      start,
      direction
    }));

    const firstUnshown = matchedHints.find(h => !shownHints.includes(h.id));

    if (firstUnshown) {
      setHints([firstUnshown]);
      setShownHints(prev => [...prev, firstUnshown.id]);
    } else {
      if (matchedHints.length > 0) setHints([matchedHints[0]]);
      else setHints([]);
    }
  };

  const getCellNumber = (row: number, col: number): number | null => {
    const cell = wordPlacements.find(p => p.start.row === row && p.start.col === col);
    return cell ? cell.number : null;
  };

  const handleStartGame = () => {
    setIsGameStarted(true);
    setIsPaused(false);
  };

  const handleTryAgain = () => {
    setUserGrid(createEmptyGrid());
    setSelectedCell(null);
    setHints([]);
    setShownHints([]);
    setScore(0);
    setActiveDirection(null);
    setActiveWord(null);
    setActiveIndex(0);
  };

  const handleSubmit = async () => {
    if(!isGameStarted) { return toast.error("❌ Please start the game first!"); }
    let correctWords = 0;

    wordPlacements.forEach(({ word, start, direction }) => {
      let isCorrect = true;

      for (let i = 0; i < word.length; i++) {
        const r = direction === 'vertical' ? start.row + i : start.row;
        const c = direction === 'horizontal' ? start.col + i : start.col;
        if (userGrid[r][c] !== solutionGrid[r][c]) {
          isCorrect = false;
          break;
        }
      }

      if (isCorrect) correctWords++;
    });

    const totalWords = wordPlacements.length;
    const percent = Math.round((correctWords / totalWords) * 100);
    setScore(correctWords);

    const accomplishmentData = {
      MinigameId: minigameId || "",
      Percent: percent,
      DurationInSecond: timeLeft,
      TakenDate: getLocalISOTime()
    };

    const result = await submitAccomplishment(accomplishmentData as unknown as Accomplishment);
    if (result) {
      toast.success(
        correctWords === totalWords
          ? '🎉 Perfect! All words correct!'
          : `✅ You got ${correctWords}/${totalWords} words correct (${percent}%)`
      );
    } else {
      toast.error("❌ Submit failed");
    }
  };

  const isActiveCell = (row: number, col: number): boolean => {
    if (!isGameStarted || !activeWord || !activeDirection) return false;
    
    const { start, word, direction } = activeWord;
    if (direction === 'horizontal') {
      return row === start.row && col >= start.col && col < start.col + word.length;
    } else {
      return col === start.col && row >= start.row && row < start.row + word.length;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          {/* Game Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🧩 Crossword Puzzle</h1>
            <p className="text-gray-600">Challenge your mind with this exciting word puzzle!</p>
          </div>

          {/* Game Stats */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time Left</p>
                  <p className="text-2xl font-bold text-gray-800">{formatTime(timeLeft)}</p>
                </div>
              </div>

              <div className="h-12 w-px bg-gray-200"></div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Score</p>
                  <p className="text-2xl font-bold text-gray-800">{score}/{wordPlacements.length}</p>
                </div>
              </div>

              <div className="h-12 w-px bg-gray-200"></div>

              <div className="flex gap-3">
                {!isGameStarted ? (
                  <button
                    onClick={handleStartGame}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    🚀 Start Game
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`px-6 py-3 font-semibold rounded-xl transform hover:scale-105 transition-all duration-200 shadow-lg ${
                      isPaused 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700' 
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                    }`}
                  >
                    {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="flex flex-col lg:flex-row justify-center items-start gap-8">
            {/* Crossword Grid */}
            <div className="flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-xl p-8 relative">
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 35px)` }}>
                  {userGrid.map((row, i) =>
                    row.map((char, j) => {
                      const number = getCellNumber(i, j);
                      const active = solutionGrid[i][j] !== '';
                      const isSelected = selectedCell?.row === i && selectedCell?.col === j;
                      const isPartOfActiveWord = isActiveCell(i, j);
                      
                      return (
                        <div
                          key={`${i}-${j}`}
                          onClick={() => handleCellClick(i, j)}
                          className={`w-[35px] h-[35px] border-2 flex items-center justify-center relative transition-all duration-200 
                            ${active 
                              ? `bg-white cursor-pointer hover:bg-blue-50 ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-100 shadow-md' 
                                    : isPartOfActiveWord 
                                      ? 'border-blue-300 bg-blue-50' 
                                      : 'border-gray-300 hover:border-gray-400'
                                }` 
                              : 'bg-gray-800 border-gray-700'
                            }`}
                        >
                          {number && (
                            <span className="absolute top-0.5 left-0.5 text-[10px] text-blue-600 font-bold z-10">
                              {number}
                            </span>
                          )}
                          {active && (
                            <input
                              ref={(el) => {
                                if (!inputRefs.current[i]) inputRefs.current[i] = [];
                                inputRefs.current[i][j] = el;
                              }}
                              type="text"
                              value={char}
                              onChange={(e) => handleInputChange(i, j, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Backspace') {
                                  const prevRow = activeDirection === 'vertical' ? i - 1 : i;
                                  const prevCol = activeDirection === 'horizontal' ? j - 1 : j;

                                  if (userGrid[i][j] === '') {
                                    if (
                                      prevRow >= 0 &&
                                      prevCol >= 0 &&
                                      prevRow < gridSize &&
                                      prevCol < gridSize &&
                                      solutionGrid[prevRow]?.[prevCol]
                                    ) {
                                      inputRefs.current[prevRow][prevCol]?.focus();
                                      const newGrid = userGrid.map((r) => [...r]);
                                      newGrid[prevRow][prevCol] = '';
                                      setUserGrid(newGrid);
                                    }
                                  }
                                }
                              }}
                              className="w-full h-full text-center font-bold text-lg bg-transparent focus:outline-none text-gray-800"
                              maxLength={1}
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                
                {/* Hints */}
                {hints.map((hint, i) => (
                  <div
                    key={i}
                    className="absolute z-20 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-xl max-w-[250px] border-2 border-purple-400"
                    style={{ 
                      top: `${hint.start.row * cellSize + 60}px`, 
                      left: `${hint.start.col * cellSize + 60}px`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm font-medium leading-relaxed">{hint.text}</p>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-500"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clues Panel */}
            <div className="w-full lg:w-80">
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Clues
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Across
                    </h4>
                    <div className="space-y-2">
                      {wordPlacements
                        .filter(p => p.direction === 'horizontal')
                        .sort((a, b) => a.number - b.number)
                        .map(({ number, clue, word }) => (
                          <div key={`${number}-horizontal`} className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                            <span className="font-medium text-blue-600">{number}.</span> {clue} <span className="text-gray-400">({word.length})</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Down
                    </h4>
                    <div className="space-y-2">
                      {wordPlacements
                        .filter(p => p.direction === 'vertical')
                        .sort((a, b) => a.number - b.number)
                        .map(({ number, clue, word }) => (
                          <div key={`${number}-vertical`} className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                            <span className="font-medium text-green-600">{number}.</span> {clue} <span className="text-gray-400">({word.length})</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={handleTryAgain} 
              className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            
            <button 
              onClick={handleSubmit} 
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submit Answer
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PlayCrossword;