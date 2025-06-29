import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';
import { fetchPlayMinigames } from '../../../services/authService';
import EditCrossword from '../../Teacher/Template/EditCrossword';
import { baseImageUrl } from '../../../config/base';
import { toast } from 'react-toastify';
import CrosswordPreview from '../../Teacher/RawMinigameInfo/Crossword';
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
const normalizeUrl = (base: string, path: string): string =>
  `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
const CrosswordReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [solutionGrid, setSolutionGrid] = useState<string[][]>([]);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [wordPlacements, setWordPlacements] = useState<WordPlacement[]>([]);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [hints, setHints] = useState<{ text: string; start: Position; direction: 'horizontal' | 'vertical' }[]>([]);
  const [activityName, setActivityName] = useState("");
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [gameData, setGameData] = useState<{ Words: string[]; Clues: string[]; DimensionSize: number }[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>();

  useEffect(() => {
    const fetchData = async () => {
      if (!minigameId) return;

      const data = await fetchPlayMinigames(minigameId);
      setActivityName(data.minigameName);
      setDuration(data.duration || 60);
      setTimeLeft(data.duration || 60);

      const xml = new DOMParser().parseFromString(data.dataText, 'application/xml');

      const words = Array.from(xml.querySelectorAll('words')).map(n => n.textContent?.trim() || '').filter(Boolean);
      const clues = Array.from(xml.querySelectorAll('clues')).map(n => n.textContent?.trim() || '').filter(Boolean);
      setThumbnailUrl(data.thumbnailImage ? normalizeUrl(baseImageUrl, data.thumbnailImage) : null);
      setGameData([
        {
          Words: words,
          Clues: clues,
          DimensionSize: gridSize, // hoặc lấy từ XML nếu có
        },
      ]);

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
  };

  const handleCellClick = (row: number, col: number) => {
    if (!solutionGrid[row][col]) return setSelectedCell(null);
    setSelectedCell({ row, col });

    const matchedHints = wordPlacements.filter(({ start, direction, word }) => {
      const len = word.length;
      return (
        (direction === 'horizontal' && row === start.row && col >= start.col && col < start.col + len) ||
        (direction === 'vertical' && col === start.col && row >= start.row && row < start.row + len)
      );
    }).map(({ number, clue, word, start, direction }) => ({
      text: `${number}. ${direction === 'horizontal' ? 'Across' : 'Down'}: ${clue} (${word.length} letters)`,
      start,
      direction
    }));

    setHints(matchedHints);
  };

  const getCellNumber = (row: number, col: number): number | null => {
    const cell = wordPlacements.find(p => p.start.row === row && p.start.col === col);
    return cell ? cell.number : null;
  };

  const handleTryAgain = () => {
    setUserGrid(createEmptyGrid());
    setSelectedCell(null);
    setHints([]);
  };

  const handleSubmit = () => {
    let currentScore = 0;
    const total = solutionGrid.flat().filter((c) => c !== '').length;
    solutionGrid.forEach((row, i) => {
      row.forEach((char, j) => {
        if (char && char === userGrid[i][j]) currentScore++;
      });
    });
    setScore(currentScore);
    toast.success(currentScore === total ? '🎉 Correct!' : `✅ You scored ${currentScore}/${total}`);
  };

  return (
    <>
      <Header />
      {!isPlaying ? (
        <CrosswordPreview onStart={() => setIsPlaying(true)}/>
      ) : (
      <><div className="min-h-screen mb-20 flex flex-col justify-center items-center bg-white px-4 py-8 relative">
            <div className="mt-15 flex items-center gap-4 text-lg font-semibold">
              ⏱️ Time Left: {timeLeft}s
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="bg-blue-200 hover:bg-blue-300 px-3 py-1 rounded"
              >
                {isPaused ? '▶️ Play' : '⏸ Pause'}
              </button>
              <span>⭐ Score: {score}</span>
            </div>
            <div className='mt-5 mb-5'>
              <EditCrossword
                initialActivityName={activityName}
                initialDuration={duration}
                initialGameData={gameData}
                initialThumbnailUrl={thumbnailUrl}
                onSave={(updated) => {
                  setActivityName(updated.activityName);
                  setDuration(updated.duration);
                  setGameData(updated.gameData);
                  setThumbnailUrl(updated.thumbnailUrl);
                } } />
            </div>

            <div className="w-fit bg-pink-100 border rounded-lg p-6 mb-12 relative">
              <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${gridSize}, 30px)` }}>
                {userGrid.map((row, i) => row.map((char, j) => {
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
                          type="text"
                          value={char}
                          onChange={(e) => handleInputChange(i, j, e.target.value)}
                          className="w-full h-full text-center font-bold text-sm bg-transparent focus:outline-none"
                          maxLength={1} />
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
          </div><Footer /></>
        )}
    </>
  );
};

export default CrosswordReview;
