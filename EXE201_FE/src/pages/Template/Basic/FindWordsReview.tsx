import React, { useState, useEffect } from 'react';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';

interface Position {
  row: number;
  col: number;
}

const FindWordReview: React.FC = () => {
  const targetWords = ['PAY', 'HEALTH', 'PARK'];
  const gridSize = 5;
  const [grid, setGrid] = useState<string[][]>(Array(gridSize).fill(Array(gridSize).fill('')));
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [startPos, setStartPos] = useState<Position | null>(null);

  useEffect(() => {
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    const directions = ['horizontal', 'vertical'];

    targetWords.forEach(word => {
      let placed = false;
      while (!placed) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        if (direction === 'horizontal') {
          const row = Math.floor(Math.random() * gridSize);
          const col = Math.floor(Math.random() * (gridSize - word.length + 1));
          const canPlace = word.split('').every((letter, i) => !newGrid[row][col + i] || newGrid[row][col + i] === letter);
          if (canPlace) {
            word.split('').forEach((letter, i) => {
              newGrid[row][col + i] = letter;
            });
            placed = true;
          }
        } else if (direction === 'vertical') {
          const col = Math.floor(Math.random() * gridSize);
          const row = Math.floor(Math.random() * (gridSize - word.length + 1));
          const canPlace = word.split('').every((letter, i) => !newGrid[row + i][col] || newGrid[row + i][col] === letter);
          if (canPlace) {
            word.split('').forEach((letter, i) => {
              newGrid[row + i][col] = letter;
            });
            placed = true;
          }
        }
      }
    });

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!newGrid[i][j]) {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
    setGrid(newGrid);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (!startPos) {
      // Start selection
      setStartPos({ row, col });
      setSelectedPositions([{ row, col }]);
    } else {
      // End selection
      const endPos = { row, col };
      const path = getPathBetween(startPos, endPos);
      setSelectedPositions(path);

      // Check if selected path forms a target word
      const selectedWord = path.map(pos => grid[pos.row][pos.col]).join('');
      const reverseWord = path.map(pos => grid[pos.row][pos.col]).reverse().join('');

      if (targetWords.includes(selectedWord) && !foundWords.includes(selectedWord)) {
        setFoundWords(prev => [...prev, selectedWord]);
      } else if (targetWords.includes(reverseWord) && !foundWords.includes(reverseWord)) {
        setFoundWords(prev => [...prev, reverseWord]);
      }

      // Reset selection
      setTimeout(() => {
        setStartPos(null);
        setSelectedPositions([]);
      }, 500);
    }
  };

  const getPathBetween = (start: Position, end: Position): Position[] => {
    const path: Position[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    // Check if horizontal, vertical, or diagonal
    if (rowDiff === 0) {
      // Horizontal
      const step = colDiff > 0 ? 1 : -1;
      for (let col = start.col; col !== end.col + step; col += step) {
        path.push({ row: start.row, col });
      }
    } else if (colDiff === 0) {
      // Vertical
      const step = rowDiff > 0 ? 1 : -1;
      for (let row = start.row; row !== end.row + step; row += step) {
        path.push({ row, col: start.col });
      }
    } else if (Math.abs(rowDiff) === Math.abs(colDiff)) {
      // Diagonal
      const steps = Math.abs(rowDiff);
      const rowStep = rowDiff > 0 ? 1 : -1;
      const colStep = colDiff > 0 ? 1 : -1;
      for (let i = 0; i <= steps; i++) {
        path.push({ row: start.row + i * rowStep, col: start.col + i * colStep });
      }
    }

    return path;
  };

  const handleTryAgain = () => {
    setFoundWords([]);
    setSelectedPositions([]);
    setStartPos(null);
    window.location.reload(); // Simple reset by reloading
  };

  const handleSubmit = () => {
    const allFound = targetWords.every(word => foundWords.includes(word));
    alert(allFound ? 'Correct! All words found!' : 'Not all words found. Try again!');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 py-8">
        {/* Word Grid */}
        <div className="w-[500px] h-[500px] bg-pink-100 border rounded-lg p-6 mb-12 flex justify-center items-center">
          <div className="grid grid-cols-5 gap-1">
            {grid.map((row, i) =>
              row.map((letter, j) => (
                <div
                  key={`${i}-${j}`}
                  onClick={() => handleCellClick(i, j)}
                  className={`w-16 h-16 bg-gray-700 text-white flex items-center justify-center text-xl font-bold rounded cursor-pointer
                    ${selectedPositions.some(pos => pos.row === i && pos.col === j) ? 'bg-green-500' : ''}`}
                >
                  {letter}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Target Words */}
        <div className="w-[500px] flex flex-col space-y-2 mb-12">
          {targetWords.map(word => (
            <button
              key={word}
              className={`px-4 py-2 rounded-full text-white font-semibold ${
                foundWords.includes(word) ? 'bg-green-500' : 'bg-green-400 hover:bg-green-500'
              }`}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Buttons */}
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

export default FindWordReview;