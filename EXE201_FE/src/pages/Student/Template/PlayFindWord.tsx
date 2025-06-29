import React, { useState, useEffect } from 'react';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';
import { fetchPlayMinigames, submitAccomplishment } from '../../../services/authService';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import GameTutorialModal from '../GameTutorial/GameTutorialModal';
import { Accomplishment } from '../../../types';

interface Position {
  row: number;
  col: number;
}

const PlayFindWord: React.FC = () => {
  const [gridSize, setGridSize] = useState<number>(10);
  const [grid, setGrid] = useState<string[][]>(() => Array(10).fill(null).map(() => Array(10).fill('')));
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [startPos, setStartPos] = useState<Position | null>(null);
  const { minigameId } = useParams<{ minigameId: string }>();
  const [showTutorial, setShowTutorial] = useState<boolean>(true);

  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [initialDuration, setInitialDuration] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [hint, setHint] = useState<string>("");
  const [correctPositions, setCorrectPositions] = useState<Position[]>([]);
  const [lastFoundTime, setLastFoundTime] = useState<number | null>(null);
  const [showHintButton, setShowHintButton] = useState<boolean>(false);
  const [hintRevealed, setHintRevealed] = useState<boolean>(false);



  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft === 0) {
      setIsRunning(false);
      alert("⏰ Time's up!");
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        const now = Date.now();
        const last = lastFoundTime ?? now;
        const elapsed = now - last;

        if (!showHintButton && elapsed >= 10000) {
          setShowHintButton(true);
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, initialDuration, lastFoundTime, showHintButton]);


  useEffect(() => {
    const generateGrid = () => {
      const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
      const directions = ['horizontal', 'vertical', 'diagonalDownRight', 'diagonalDownLeft'];

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
              const existing = newGrid[row][col + i];
              return existing === '' || existing === letter;
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
              const existing = newGrid[row + i][col];
              return existing === '' || existing === letter;
            });

            if (canPlace) {
              word.split('').forEach((letter, i) => {
                newGrid[row + i][col] = letter;
              });
              placed = true;
            }
          }
          else if (direction === 'diagonalDownRight') {
            const row = Math.floor(Math.random() * (gridSize - word.length + 1));
            const col = Math.floor(Math.random() * (gridSize - word.length + 1));

            const canPlace = word.split('').every((letter, i) => {
              const existing = newGrid[row + i][col + i];
              return existing === '' || existing === letter;
            });

            if (canPlace) {
              word.split('').forEach((letter, i) => {
                newGrid[row + i][col + i] = letter;
              });
              placed = true;
            }
          }

          else if (direction === 'diagonalDownLeft') {
            const row = Math.floor(Math.random() * (gridSize - word.length + 1));
            const col = Math.floor(Math.random() * (gridSize - word.length + 1)) + word.length - 1;

            const canPlace = word.split('').every((letter, i) => {
              const existing = newGrid[row + i][col - i];
              return existing === '' || existing === letter;
            });

            if (canPlace) {
              word.split('').forEach((letter, i) => {
                newGrid[row + i][col - i] = letter;
              });
              placed = true;
            }
          }

        }

        if (!placed) {
          console.warn(`Could not place word: ${word}, regenerating...`);
          return generateGrid(); // reset grid and try again
        }
      }

      // Fill remaining cells with random letters
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
  useEffect(() => {
    const loadData = async () => {
      if (!minigameId) return;
      try {
        const res = await fetchPlayMinigames(minigameId);
        if (!res?.dataText) return;

        const parser = new DOMParser();
        const xml = parser.parseFromString(res.dataText, "text/xml");
        const question = xml.querySelector("question");

        const dimension = parseInt(question?.querySelector("dimension")?.textContent ?? "10");
        const rawArray = question?.querySelector("array")?.textContent ?? "";
        const wordsNodeList = question?.querySelectorAll("words");
        const words = wordsNodeList ? Array.from(wordsNodeList).map(w => w.textContent?.toUpperCase().trim() || "") : [];
        const hint = question?.querySelector("hint")?.textContent ?? "";

        // Convert 1D array string to 2D grid
        const newGrid = Array.from({ length: dimension }, (_, row) =>
          Array.from({ length: dimension }, (_, col) => {
            const index = row * dimension + col;
            return rawArray[index] ?? "";
          })
        );

        setInitialDuration(parseInt(question?.querySelector("duration")?.textContent ?? "60"));
        setTimeLeft(parseInt(question?.querySelector("duration")?.textContent ?? "60"));
        setGrid(newGrid);
        setTargetWords(words);
        setGridSize(dimension);
        setHint(hint);
      } catch (err) {
        console.error("Failed to fetch minigame data", err);
      }
    };

    loadData();
  }, [minigameId]);


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
        setCorrectPositions(prev => [...prev, ...path]);
        setShowHintButton(false);
        setHintRevealed(false);
        setLastFoundTime(Date.now());
      } else if (targetWords.includes(reverseWord) && !foundWords.includes(reverseWord)) {
        setFoundWords(prev => [...prev, reverseWord]);
        setCorrectPositions(prev => [...prev, ...path]);
        setShowHintButton(false);
        setHintRevealed(false);
        setLastFoundTime(Date.now());
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
    setTimeLeft(initialDuration);
    setIsRunning(false);
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
  const getLocalISOTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset(); // in minutes
    const localTime = new Date(now.getTime() - offset * 60 * 1000);
    return localTime.toISOString().slice(0, -1); // remove the 'Z'
  };

  const handleSubmit = async () => {
    setIsRunning(false);
    const allFound = targetWords.every(word => foundWords.includes(word));
    toast(allFound ? '🎉 Correct! All words found!' : '❌ Not all words found. Try again!');

    if (minigameId) {
      const percent = Math.round((foundWords.length / targetWords.length) * 100);
      const payload = {
        MinigameId: minigameId,
        Percent: percent,
        DurationInSecond: initialDuration - timeLeft,
        TakenDate: getLocalISOTime()
      };

      const result = await submitAccomplishment(payload as unknown as Accomplishment);
      if (result) {
        console.log("✅ Accomplishment submitted!");
      } else {
        console.error("❌ Failed to submit accomplishment.");
      }
    }
  };

  return (
    <>
      <Header />
      <GameTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
      <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 py-8 mt-20">

        <h2 className="text-xl font-bold mb-4">Topic: {hint}</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="text-lg font-semibold">
            ⏳ Time Left: {timeLeft}s
          </div>
          {showHintButton && !hintRevealed && (
            <button
              onClick={() => setHintRevealed(true)}
              className="bg-yellow-300 hover:bg-yellow-400 px-3 py-1 rounded text-black"
            >
              💡 Hint
            </button>
          )}
          {hintRevealed && (
            <div className="text-md text-purple-700 font-semibold">
              📌 Hint: {targetWords.find(word => !foundWords.includes(word)) ?? "All words found!"}
            </div>
          )}

          <button
            onClick={() => {
              if (!isRunning) {
                setLastFoundTime(Date.now()); // 👈 Khởi tạo khi bắt đầu
              }
              setIsRunning(prev => !prev);
            }}
            className={`px-4 py-1 rounded text-white font-semibold transition ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isRunning ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
        <div className="bg-pink-100 border rounded-lg p-6 mb-12 overflow-auto">
          <div
            className="grid gap-1 mx-auto"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 3rem)` }} // mỗi cột ~48px
          >
            {grid.map((row, i) =>
              row.map((letter, j) => {
                const isSelected = selectedPositions.some(pos => pos.row === i && pos.col === j);
                const isCorrect = correctPositions.some(pos => pos.row === i && pos.col === j);

                return (
                  <div
                    key={`${i}-${j}`}
                    onClick={() => handleCellClick(i, j)}
                    className={`w-12 h-12 text-white flex items-center justify-center text-lg font-bold rounded cursor-pointer transition-colors
                    ${isCorrect ? 'bg-green-500' : isSelected ? 'bg-yellow-400' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    {letter}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="w-full max-w-[700px] flex justify-between items-center px-4">
          <button
            onClick={handleTryAgain}
            className="px-6 py-2 bg-blue-200 text-blue-800 font-semibold rounded-full hover:bg-blue-300 transition"
          >
            Try again
          </button>
          {isRunning && 
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-200 text-green-800 font-semibold rounded-full hover:bg-green-300 transition"
          >
            Submit
          </button>
          }
        </div>

      </div>
      <Footer />
    </>
  );
};

export default PlayFindWord;