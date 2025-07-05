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
          } else if (direction === 'diagonalDownRight') {
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
          } else if (direction === 'diagonalDownLeft') {
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
  }, []);

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
      const step = colDiff > 0 ? 1 : -1;
      for (let col = start.col; col !== end.col + step; col += step) {
        path.push({ row: start.row, col });
      }
    } else if (colDiff === 0) {
      const step = rowDiff > 0 ? 1 : -1;
      for (let row = start.row; row !== end.row + step; row += step) {
        path.push({ row, col: start.col });
      }
    } else if (Math.abs(rowDiff) === Math.abs(colDiff)) {
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
    setCorrectPositions([]);
    setTimeLeft(initialDuration);
    setIsRunning(false);
    setShowHintButton(false);
    setHintRevealed(false);
    
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
    const offset = now.getTimezoneOffset();
    const localTime = new Date(now.getTime() - offset * 60 * 1000);
    return localTime.toISOString().slice(0, -1);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (foundWords.length / targetWords.length) * 100;

  return (
    <>
      <Header />
      <GameTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-white/30 mb-4">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Word Hunt Challenge
              </h1>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-md border border-white/30 inline-block">
              <p className="text-xl text-gray-700 font-medium">
                🎯 <span className="text-purple-600 font-bold">{hint}</span>
              </p>
            </div>
          </div>

          {/* Game Stats & Controls */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            
            {/* Timer */}
            <div className={`bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/30 ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 30 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span className="text-lg font-mono font-bold text-gray-700">
                  ⏱️ {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/30">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">Progress:</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-700">
                  {foundWords.length}/{targetWords.length}
                </span>
              </div>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => {
                if (!isRunning) {
                  setLastFoundTime(Date.now());
                }
                setIsRunning(prev => !prev);
              }}
              className={`px-6 py-3 rounded-2xl font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ${
                isRunning 
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600' 
                  : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600'
              }`}
            >
              {isRunning ? '⏸️ Pause' : '▶️ Start'}
            </button>

            {/* Hint Button */}
            {showHintButton && !hintRevealed && (
              <button
                onClick={() => setHintRevealed(true)}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-yellow-500 hover:to-amber-600"
              >
                💡 Get Hint
              </button>
            )}
          </div>

          {/* Hint Revealed */}
          {hintRevealed && (
            <div className="text-center mb-6">
              <div className="inline-block bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-2xl px-6 py-3 shadow-lg">
                <p className="text-lg font-bold text-amber-800">
                  💡 Next word: <span className="text-purple-600">{targetWords.find(word => !foundWords.includes(word)) ?? "All words found!"}</span>
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
            
            {/* Game Grid */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
              <div
                className="grid gap-2 mx-auto"
                style={{ gridTemplateColumns: `repeat(${gridSize}, 3.5rem)` }}
              >
                {grid.map((row, i) =>
                  row.map((letter, j) => {
                    const isSelected = selectedPositions.some(pos => pos.row === i && pos.col === j);
                    const isCorrect = correctPositions.some(pos => pos.row === i && pos.col === j);

                    return (
                      <div
                        key={`${i}-${j}`}
                        onClick={() => handleCellClick(i, j)}
                        className={`
                          w-14 h-14 flex items-center justify-center text-lg font-bold rounded-xl cursor-pointer 
                          transition-all duration-200 transform hover:scale-105 select-none
                          ${isCorrect 
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg scale-105' 
                            : isSelected 
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg scale-105' 
                              : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white hover:from-slate-500 hover:to-slate-600 shadow-md'
                          }
                        `}
                      >
                        {letter}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Word List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 xl:w-80">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                🎯 Words to Find
              </h3>
              <div className="space-y-3">
                {targetWords.map((word) => (
                  <div
                    key={word}
                    className={`
                      px-4 py-3 rounded-2xl font-semibold transition-all duration-300 transform
                      ${foundWords.includes(word) 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg scale-105' 
                        : 'bg-gradient-to-r from-purple-400 to-blue-400 text-white hover:from-purple-500 hover:to-blue-500 shadow-md hover:scale-105'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{word}</span>
                      {foundWords.includes(word) && (
                        <span className="text-white text-xl animate-bounce">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Score Card */}
              <div className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-4 border border-purple-200">
                <h4 className="text-lg font-bold text-purple-800 mb-2">📊 Your Score</h4>
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(progressPercentage)}%
                </div>
                <p className="text-sm text-purple-600 mt-1">
                  {foundWords.length} out of {targetWords.length} found
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-12">
            <button
              onClick={handleTryAgain}
              className="px-8 py-4 bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-blue-500 hover:to-cyan-600"
            >
              🔄 Try Again
            </button>
            
            {isRunning && (
              <button
                onClick={handleSubmit}
                className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-green-500 hover:to-emerald-600"
              >
                🎉 Submit Game
              </button>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default PlayFindWord;