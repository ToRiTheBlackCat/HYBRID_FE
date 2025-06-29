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
const cellSize = 30;

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
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);


  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const getLocalISOTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset(); // in minutes
    const localTime = new Date(now.getTime() - offset * 60 * 1000);
    return localTime.toISOString().slice(0, -1); // remove the 'Z'
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
    if (!isPaused && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      alert("⏰ Time's up!");
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isPaused]);

  const handleInputChange = (row: number, col: number, value: string) => {
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
        setActiveIndex(nextIndex); // cập nhật chỉ số ô đang nhập
      }
    }
  };


  const handleCellClick = (row: number, col: number) => {
    if (!solutionGrid[row][col]) return setSelectedCell(null);
    setSelectedCell({ row, col });

    // tìm từ chứa ô vừa click
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

    // xử lý hiển thị hint như cũ
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

  const handleTryAgain = () => {
    setUserGrid(createEmptyGrid());
    setSelectedCell(null);
    setHints([]);
    setShownHints([]);
  };

  const handleSubmit = async () => {
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


  return (
    <>
      <Header />
      <div className="min-h-screen mb-20 flex flex-col justify-center items-center bg-white px-4 py-8 relative">
        <div className="mt-15 mb-5 flex items-center gap-4 text-lg font-semibold">
          ⏱️ Time Left: {timeLeft}s
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="bg-blue-200 hover:bg-blue-300 px-3 py-1 rounded"
          >
            {isPaused ? '▶️ Play' : '⏸ Pause'}
          </button>
          <span>⭐ Score: {score}</span>
        </div>

        <div className="w-fit bg-pink-100 border rounded-lg p-6 mb-12 relative">
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${gridSize}, 30px)` }}>
            {userGrid.map((row, i) =>
              row.map((char, j) => {
                const number = getCellNumber(i, j);
                const active = solutionGrid[i][j] !== '';
                return (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => handleCellClick(i, j)}
                    className={`w-[30px] h-[30px] border border-gray-300 flex items-center justify-center relative
                    ${active ? 'bg-white cursor-pointer' : 'bg-gray-300'}
                    ${selectedCell?.row === i && selectedCell?.col === j ? 'bg-yellow-200' : ''}`}
                  >
                    {number && (
                      <span className="absolute top-0 left-0 text-[10px] text-gray-600 pl-0.5 pt-0.5 font-bold">
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
                        className="w-full h-full text-center font-bold text-sm bg-transparent focus:outline-none"
                        maxLength={1}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
          {hints.map((hint, i) => (
            <div
              key={i}
              className="absolute left-0 p-3 bg-blue-100 text-blue-800 rounded-lg shadow-md max-w-[200px] z-10"
              style={{ top: `${hint.start.row * cellSize - 40}px`, left: `${hint.start.col * cellSize}px` }}
            >
              <p className="text-sm font-medium">{hint.text}</p>
            </div>
          ))}
        </div>

        <div className="w-full max-w-[700px] flex justify-between items-center px-4">
          <button onClick={handleTryAgain} className="px-6 py-2 bg-blue-200 text-blue-800 font-semibold rounded-full hover:bg-blue-300 transition">
            Try again
          </button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-green-200 text-green-800 font-semibold rounded-full hover:bg-green-300 transition">
            Submit
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PlayCrossword;
