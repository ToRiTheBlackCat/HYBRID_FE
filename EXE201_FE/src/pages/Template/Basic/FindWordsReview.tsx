import React, { useState, useEffect } from 'react';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';
import { fetchPlayMinigames } from '../../../services/authService';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import EditFindWord from '../../Teacher/Template/EditFindWord';
import { baseImageUrl } from '../../../config/base';
import FindWordPreview from '../../Teacher/RawMinigameInfo/FindWord';

interface Position {
  row: number;
  col: number;
}

const FindWordReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();

  const [gridSize, setGridSize] = useState(10);
  const [grid, setGrid] = useState<string[][]>([]);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [correctPositions, setCorrectPositions] = useState<Position[]>([]);
  const [startPos, setStartPos] = useState<Position | null>(null);
  const [hint, setHint] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [initialDuration, setInitialDuration] = useState(60);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsRunning(false);
      toast.error("⏰ Time's up!");
    }
  }, [timeLeft]);

  // Load minigame data
  useEffect(() => {
    if (!minigameId) return;

    const loadData = async () => {
      try {
        const res = await fetchPlayMinigames(minigameId);
        if (!res?.dataText) return;

        const parser = new DOMParser();
        const xml = parser.parseFromString(res.dataText, "text/xml");
        const question = xml.querySelector("question");

        const dimension = parseInt(question?.querySelector("dimension")?.textContent || '10');
        const rawArray = question?.querySelector("array")?.textContent || "";
        const words = Array.from(question?.querySelectorAll("words") || []).map(w => w.textContent?.toUpperCase().trim() || "");
        const hint = question?.querySelector("hint")?.textContent || "";
        const duration = parseInt(question?.querySelector("duration")?.textContent || '60');

        setGridSize(dimension);
        setGrid(Array.from({ length: dimension }, (_, row) =>
          Array.from({ length: dimension }, (_, col) => rawArray[row * dimension + col] || '')
        ));
        setTargetWords(words);
        setHint(hint);
        setInitialDuration(duration);
        setTimeLeft(duration);
        setThumbnailUrl(res.thumbnailImage);
      } catch (err) {
        console.error("Failed to fetch minigame data", err);
      }
    };

    loadData();
  }, [minigameId]);

  const getPathBetween = (start: Position, end: Position): Position[] => {
    const path: Position[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
      const length = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
      const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
      const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

      for (let i = 0; i <= length; i++) {
        path.push({ row: start.row + i * rowStep, col: start.col + i * colStep });
      }
    }

    return path;
  };

  const handleCellClick = (row: number, col: number) => {
    const pos = { row, col };

    if (!startPos) {
      setStartPos(pos);
      setSelectedPositions([pos]);
      return;
    }

    const path = getPathBetween(startPos, pos);
    const word = path.map(p => grid[p.row][p.col]).join("");
    const reversed = word.split('').reverse().join('');

    if ((targetWords.includes(word) || targetWords.includes(reversed)) && !foundWords.includes(word) && !foundWords.includes(reversed)) {
      const found = targetWords.includes(word) ? word : reversed;
      toast.success(`✅ Found: ${found}`);
      setFoundWords(prev => [...prev, found]);
      setCorrectPositions(prev => [...prev, ...path]);
    } else {
      toast.error("❌ Not a valid word");
    }

    setTimeout(() => {
      setStartPos(null);
      setSelectedPositions([]);
    }, 400);
  };

  const handleTryAgain = () => {
    setFoundWords([]);
    setCorrectPositions([]);
    setSelectedPositions([]);
    setStartPos(null);
    setTimeLeft(initialDuration);
    setIsRunning(false);
    toast.info("🔄 Game reset!");
  };

  const handleSubmit = () => {
    const allFound = targetWords.every(w => foundWords.includes(w));
    toast[allFound ? 'success' : 'warn'](
      allFound ? "🎉 You found all words!" : "🧐 Not all words found. Try again!"
    );
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <>
      <Header />
      {!isPlaying ? (
        <FindWordPreview onStart={() => setIsPlaying(true)} />
      ) : (
        <>
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-8 mt-20">
            <div className="max-w-6xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/30 mb-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Find Hidden Words
                  </h1>
                </div>
                <p className="text-xl text-gray-700 font-medium">
                  🎯 Topic: <span className="text-purple-600 font-bold">{hint}</span>
                </p>
              </div>

              {/* Game Controls */}
              <div className="flex flex-col lg:flex-row justify-center items-center gap-6 mb-8">
                {/* Timer */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${timeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-lg font-mono font-bold text-gray-700">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsRunning(prev => !prev)}
                  className={`px-8 py-3 rounded-2xl font-bold text-white shadow-lg transform hover:scale-105 transition-all duration-200 ${
                    isRunning 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600' 
                      : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600'
                  }`}
                >
                  {isRunning ? '⏸️ Pause' : '▶️ Start'}
                </button>

                {/* Edit Button */}
                <EditFindWord
                  initialActivityName={"Find Word Activity"}
                  initialDuration={initialDuration}
                  initialHint={hint}
                  initialWords={targetWords}
                  initialDimension={gridSize}
                  initialThumbnailUrl={baseImageUrl + thumbnailUrl}
                  onSave={({ duration, hint, words, dimension }) => {
                    setInitialDuration(duration);
                    setTimeLeft(duration);
                    setHint(hint);
                    setTargetWords(words);
                    setGridSize(dimension);
                  }}
                />

                {/* Progress */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Progress:</span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                        style={{ width: `${((foundWords.length / targetWords.length) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {foundWords.length}/{targetWords.length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
                {/* Game Grid */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
                  <div
                    className="grid gap-2 mx-auto"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, 3.5rem)` }}
                  >
                    {grid.map((row, i) => row.map((letter, j) => {
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
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg' 
                              : isSelected 
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg scale-105' 
                                : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white hover:from-slate-500 hover:to-slate-600 shadow-md'
                            }
                          `}
                        >
                          {letter}
                        </div>
                      );
                    }))}
                  </div>
                </div>

                {/* Word List */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 lg:w-80">
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
                            : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500 shadow-md hover:scale-105'
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
                <button
                  onClick={handleSubmit}
                  className="px-8 py-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200 hover:from-green-500 hover:to-emerald-600"
                >
                  🎉 Submit Answer
                </button>
              </div>
            </div>
          </div>
          <Footer />
        </>
      )}
    </>
  );
};

export default FindWordReview;