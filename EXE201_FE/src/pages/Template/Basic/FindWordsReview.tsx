import React, { useState, useEffect } from 'react';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';

interface Position {
  row: number;
  col: number;
}

const FindWordReview: React.FC = () => {
  const targetWords = ['PAY', 'HEALTH', 'PARK'];
  const gridSize = 8; // Tăng kích thước grid để dễ đặt từ hơn
  const [grid, setGrid] = useState<string[][]>(Array(gridSize).fill(null).map(() => Array(gridSize).fill('')));
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [startPos, setStartPos] = useState<Position | null>(null);

  useEffect(() => {
    const generateGrid = () => {
      const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
      const directions = ['horizontal', 'vertical'];
      const maxAttempts = 100; // Giới hạn số lần thử

      // Thử đặt từng từ
      for (const word of targetWords) {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < maxAttempts) {
          attempts++;
          const direction = directions[Math.floor(Math.random() * directions.length)];
          
          if (direction === 'horizontal') {
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * (gridSize - word.length + 1));
            
            // Kiểm tra có thể đặt được không
            const canPlace = word.split('').every((letter, i) => {
              const newCol = col + i;
              return newCol < gridSize && (!newGrid[row][newCol] || newGrid[row][newCol] === letter);
            });
            
            if (canPlace) {
              word.split('').forEach((letter, i) => {
                newGrid[row][col + i] = letter;
              });
              placed = true;
            }
          } else if (direction === 'vertical') {
            const col = Math.floor(Math.random() * gridSize);
            const row = Math.floor(Math.random() * (gridSize - word.length + 1));
            
            const canPlace = word.split('').every((letter, i) => {
              const newRow = row + i;
              return newRow < gridSize && (!newGrid[newRow][col] || newGrid[newRow][col] === letter);
            });
            
            if (canPlace) {
              word.split('').forEach((letter, i) => {
                newGrid[row + i][col] = letter;
              });
              placed = true;
            }
          }
        }

        // Nếu không đặt được sau maxAttempts lần thử, bắt đầu lại
        if (!placed) {
          console.log(`Could not place word: ${word}, regenerating grid...`);
          return generateGrid(); // Tạo lại grid
        }
      }

      // Điền các ô trống bằng chữ cái ngẫu nhiên
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (!newGrid[i][j]) {
            newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
          }
        }
      }
      
      return newGrid;
    };

    setGrid(generateGrid());
  }, []); // Loại bỏ targetWords khỏi dependency array

  const handleCellClick = (row: number, col: number) => {
    if (!startPos) {
      setStartPos({ row, col });
      setSelectedPositions([{ row, col }]);
    } else {
      const endPos = { row, col };
      const path = getPathBetween(startPos, endPos);
      setSelectedPositions(path);

      const selectedWord = path.map(pos => grid[pos.row][pos.col]).join('');
      const reverseWord = path.map(pos => grid[pos.row][pos.col]).reverse().join('');

      if (targetWords.includes(selectedWord) && !foundWords.includes(selectedWord)) {
        setFoundWords(prev => [...prev, selectedWord]);
      } else if (targetWords.includes(reverseWord) && !foundWords.includes(reverseWord)) {
        setFoundWords(prev => [...prev, reverseWord]);
      }

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

    if (rowDiff === 0) {
      // Horizontal line
      const step = colDiff > 0 ? 1 : -1;
      for (let col = start.col; col !== end.col + step; col += step) {
        path.push({ row: start.row, col });
      }
    } else if (colDiff === 0) {
      // Vertical line
      const step = rowDiff > 0 ? 1 : -1;
      for (let row = start.row; row !== end.row + step; row += step) {
        path.push({ row, col: start.col });
      }
    } else if (Math.abs(rowDiff) === Math.abs(colDiff)) {
      // Diagonal line
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
    // Tạo grid mới thay vì reload page
    const generateGrid = () => {
      const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
      const directions = ['horizontal', 'vertical'];
      const maxAttempts = 100;

      for (const word of targetWords) {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < maxAttempts) {
          attempts++;
          const direction = directions[Math.floor(Math.random() * directions.length)];
          
          if (direction === 'horizontal') {
            const row = Math.floor(Math.random() * gridSize);
            const col = Math.floor(Math.random() * (gridSize - word.length + 1));
            
            const canPlace = word.split('').every((letter, i) => {
              const newCol = col + i;
              return newCol < gridSize && (!newGrid[row][newCol] || newGrid[row][newCol] === letter);
            });
            
            if (canPlace) {
              word.split('').forEach((letter, i) => {
                newGrid[row][col + i] = letter;
              });
              placed = true;
            }
          } else if (direction === 'vertical') {
            const col = Math.floor(Math.random() * gridSize);
            const row = Math.floor(Math.random() * (gridSize - word.length + 1));
            
            const canPlace = word.split('').every((letter, i) => {
              const newRow = row + i;
              return newRow < gridSize && (!newGrid[newRow][col] || newGrid[newRow][col] === letter);
            });
            
            if (canPlace) {
              word.split('').forEach((letter, i) => {
                newGrid[row + i][col] = letter;
              });
              placed = true;
            }
          }
        }

        if (!placed) {
          return generateGrid();
        }
      }

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (!newGrid[i][j]) {
            newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
          }
        }
      }
      
      return newGrid;
    };

    setGrid(generateGrid());
  };

  const handleSubmit = () => {
    const allFound = targetWords.every(word => foundWords.includes(word));
    alert(allFound ? 'Correct! All words found!' : 'Not all words found. Try again!');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 py-8">
        <div className="w-[600px] h-[600px] bg-pink-100 border rounded-lg p-6 mb-12 flex justify-center items-center">
          <div className={`grid gap-1`} style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
            {Array.isArray(grid) && grid.length > 0 ? (
              grid.map((row, i) =>
                row.map((letter, j) => (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => handleCellClick(i, j)}
                    className={`w-12 h-12 bg-gray-700 text-white flex items-center justify-center text-lg font-bold rounded cursor-pointer transition-colors
                      ${selectedPositions.some(pos => pos.row === i && pos.col === j) ? 'bg-green-500' : 'hover:bg-gray-600'}`}
                  >
                    {letter}
                  </div>
                ))
              )
            ) : (
              <div className="col-span-full text-center">Loading...</div>
            )}
          </div>
        </div>

        <div className="w-[500px] flex flex-col space-y-2 mb-12">
          {targetWords.map(word => (
            <button
              key={word}
              className={`px-4 py-2 rounded-full text-white font-semibold transition-colors ${
                foundWords.includes(word) ? 'bg-green-500' : 'bg-green-400 hover:bg-green-500'
              }`}
            >
              {word} {foundWords.includes(word) ? '✓' : ''}
            </button>
          ))}
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

export default FindWordReview;