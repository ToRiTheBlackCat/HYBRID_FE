import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';

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
const center = Math.floor(gridSize / 2);
const cellSize = 30; // Size of each grid cell in pixels

const CrosswordReview: React.FC = () => {
  const location = useLocation();
  const [wordList, setWordList] = useState<string[]>([]);
  const [solutionGrid, setSolutionGrid] = useState<string[][]>([]);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [wordPlacements, setWordPlacements] = useState<WordPlacement[]>([]);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [hints, setHints] = useState<{ text: string; start: Position; direction: 'horizontal' | 'vertical' }[]>([]);

  useEffect(() => {
    const fallbackWords = [
      { word: 'HELLO', clue: 'A greeting' },
      { word: 'WORLD', clue: 'The planet we live on' },
      { word: 'TEST', clue: 'An examination' },
      { word: 'LOW', clue: 'Not high' },
      { word: 'SWORD', clue: 'A bladed weapon' },
    ];
    const locationWords = (location.state as { words?: { word: string; clue: string }[] })?.words;
    setWordList(
      locationWords && Array.isArray(locationWords)
        ? locationWords.map(w => w.word)
        : fallbackWords.map(w => w.word)
    );
    const clues = locationWords && Array.isArray(locationWords)
      ? locationWords
      : fallbackWords;
    setWordPlacements(prev => prev.map(p => ({ ...p, clue: clues.find(c => c.word === p.word)?.clue || '' })));
  }, [location.state]);

  const createEmptyGrid = (): string[][] =>
    Array.from({ length: gridSize }, () => Array(gridSize).fill(''));

  useEffect(() => {
    if (wordList.length === 0) return;

    const newSolutionGrid = createEmptyGrid();
    const newUserGrid = createEmptyGrid();
    const placements: WordPlacement[] = [];

    const firstWord = wordList[0];
    const startCol = center - Math.floor(firstWord.length / 2);
    for (let i = 0; i < firstWord.length; i++) {
      newSolutionGrid[center][startCol + i] = firstWord[i];
    }
    placements.push({
      word: firstWord,
      start: { row: center, col: startCol },
      direction: 'horizontal',
      number: 1,
      clue: (location.state as any)?.words?.[0]?.clue || 'A greeting',
    });

    let wordNumber = 2;

    for (let i = 1; i < wordList.length; i++) {
      const word = wordList[i];
      let placed = false;

      for (const placedWord of placements) {
        for (let j = 0; j < placedWord.word.length; j++) {
          for (let k = 0; k < word.length; k++) {
            if (placedWord.word[j] !== word[k]) continue;

            const crossRow = placedWord.start.row + (placedWord.direction === 'vertical' ? j : 0);
            const crossCol = placedWord.start.col + (placedWord.direction === 'horizontal' ? j : 0);

            const startRow = crossRow - (placedWord.direction === 'horizontal' ? k : 0);
            const startCol = crossCol - (placedWord.direction === 'vertical' ? k : 0);
            const direction = placedWord.direction === 'horizontal' ? 'vertical' : 'horizontal';

            if (canPlaceWord(newSolutionGrid, word, startRow, startCol, direction)) {
              placeWord(newSolutionGrid, word, startRow, startCol, direction);
              placements.push({
                word,
                start: { row: startRow, col: startCol },
                direction,
                number: wordNumber++,
                clue: (location.state as any)?.words?.[i]?.clue || `Clue for ${word}`,
              });
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }
    }

    setSolutionGrid(newSolutionGrid);
    setUserGrid(newUserGrid);
    setWordPlacements(placements);
  }, [wordList]);

  const canPlaceWord = (
    grid: string[][],
    word: string,
    row: number,
    col: number,
    direction: 'horizontal' | 'vertical'
  ): boolean => {
    if (direction === 'horizontal' && (col < 0 || col + word.length > gridSize)) return false;
    if (direction === 'vertical' && (row < 0 || row + word.length > gridSize)) return false;

    for (let i = 0; i < word.length; i++) {
      const r = direction === 'vertical' ? row + i : row;
      const c = direction === 'horizontal' ? col + i : col;

      const cell = grid[r][c];
      if (cell !== '' && cell !== word[i]) return false;
    }

    return true;
  };

  const placeWord = (
    grid: string[][],
    word: string,
    row: number,
    col: number,
    direction: 'horizontal' | 'vertical'
  ) => {
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'vertical' ? row + i : row;
      const c = direction === 'horizontal' ? col + i : col;
      grid[r][c] = word[i];
    }
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    const newUserGrid = [...userGrid.map(row => [...row])];
    newUserGrid[row][col] = value.toUpperCase().slice(0, 1);
    setUserGrid(newUserGrid);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!solutionGrid[row][col]) {
      setSelectedCell(null);
      setHints([]);
      return;
    }

    setSelectedCell({ row, col });

    const relatedHints: { text: string; start: Position; direction: 'horizontal' | 'vertical' }[] = [];
    wordPlacements.forEach(({ start, direction, word, number, clue }) => {
      const length = word.length;
      if (
        direction === 'horizontal' &&
        row === start.row &&
        col >= start.col &&
        col < start.col + length
      ) {
        relatedHints.push({
          text: `${number}. Across: ${clue} (${length} letters)`,
          start,
          direction,
        });
      }
      if (
        direction === 'vertical' &&
        col === start.col &&
        row >= start.row &&
        row < start.row + length
      ) {
        relatedHints.push({
          text: `${number}. Down: ${clue} (${length} letters)`,
          start,
          direction,
        });
      }
    });

    setHints(relatedHints);
  };

  const getCellNumber = (row: number, col: number): number | null => {
    const placement = wordPlacements.find(p => p.start.row === row && p.start.col === col);
    return placement ? placement.number : null;
  };

  const handleTryAgain = () => {
    setUserGrid(createEmptyGrid());
    setSelectedCell(null);
    setHints([]);
  };

  const handleSubmit = () => {
    let correct = true;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (solutionGrid[i][j] !== '' && solutionGrid[i][j] !== userGrid[i][j]) {
          correct = false;
          break;
        }
      }
      if (!correct) break;
    }
    alert(correct ? 'Congratulations! Crossword completed correctly!' : 'Some answers are incorrect. Try again!');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen mb-20 flex flex-col justify-center items-center bg-white px-4 py-8 relative">
        <div className="w-fit mt-25 bg-pink-100 border rounded-lg p-6 mb-12 relative">
          <div
            className="grid gap-[2px]"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 30px)` }}
          >
            {userGrid.map((row, i) =>
              row.map((char, j) => {
                const cellNumber = getCellNumber(i, j);
                const isActive = solutionGrid[i][j] !== '';
                return (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => handleCellClick(i, j)}
                    className={`w-[30px] h-[30px] border border-gray-300 flex items-center justify-center relative
                      ${isActive ? 'bg-white cursor-pointer' : 'bg-gray-300'}
                      ${selectedCell?.row === i && selectedCell?.col === j ? 'bg-yellow-200' : ''}`}
                  >
                    {cellNumber && (
                      <span className="absolute top-0 left-0 text-[10px] text-gray-600 pl-0.5 pt-0.5 font-bold">
                        {cellNumber}
                      </span>
                    )}
                    {isActive && (
                      <input
                        type="text"
                        value={char}
                        onChange={(e) => handleInputChange(i, j, e.target.value)}
                        className="w-full h-full text-center font-bold text-sm bg-transparent focus:outline-none"
                        maxLength={1}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
          {hints.map((hint, index) => {
            const x = hint.start.col * cellSize;
            const y = hint.start.row * cellSize - 40; // Position above the word
            const alignment = hint.direction === 'horizontal' ? 'left-0' : 'left-0 transform -translate-y-2';
            return (
              <div
                key={index}
                className={`absolute ${alignment} p-3 bg-blue-100 text-blue-800 rounded-lg shadow-md max-w-[200px] z-10`}
                style={{ top: `${y}px`, left: `${x}px` }}
              >
                <p className="text-sm font-medium">{hint.text}</p>
              </div>
            );
          })}
        </div>

        <div className="w-full max-w-[700px] flex justify-between items-center px-4">
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
    </>
  );
};

export default CrosswordReview;