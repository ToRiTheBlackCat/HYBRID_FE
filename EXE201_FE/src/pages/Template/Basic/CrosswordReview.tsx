import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../../components/HomePage/Header';
import Footer from '../../../components/HomePage/Footer';
import { fetchPlayMinigames } from '../../../services/authService';
import EditCrossword from '../../Teacher/Template/EditCrossword';
import { baseImageUrl } from '../../../config/base';
import { toast } from 'react-toastify';
import CrosswordPreview from '../../Teacher/RawMinigameInfo/Crossword';

// Types
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

interface GameData {
  Words: string[];
  Clues: string[];
  DimensionSize: number;
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  timeLeft: number;
  score: number;
  isGameOver: boolean;
  isCompleted: boolean;
}

interface Hint {
  text: string;
  start: Position;
  direction: 'horizontal' | 'vertical';
}

// Constants
const GRID_SIZE = 15;
const INITIAL_DURATION = 60;

// Utility functions
const createEmptyGrid = (): string[][] => 
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));

const normalizeUrl = (base: string, path: string): string =>
  `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Grid utility functions
const canPlace = (
  word: string,
  grid: string[][],
  row: number,
  col: number,
  direction: 'horizontal' | 'vertical'
): boolean => {
  if (word.length === 0) return false;
  
  for (let i = 0; i < word.length; i++) {
    const r = direction === 'vertical' ? row + i : row;
    const c = direction === 'horizontal' ? col + i : col;

    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
    
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
  if (!word || word.length === 0) return null;

  // Try to intersect with existing words first
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

  // If no intersection found, place in any available position
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      for (const direction of ['horizontal', 'vertical'] as const) {
        if (canPlace(word, grid, r, c, direction)) {
          return { 
            word, 
            clue, 
            number: index + 1, 
            direction, 
            start: { row: r, col: c } 
          };
        }
      }
    }
  }
  
  return null;
};

const generateCrosswordGrid = (words: string[], clues: string[]) => {
  const grid = createEmptyGrid();
  const placements: WordPlacement[] = [];

  words.forEach((word, i) => {
    const placement = placeWord(word, grid, placements, i, clues[i] || '');
    if (placement) {
      placements.push(placement);
      for (let j = 0; j < word.length; j++) {
        const r = placement.direction === 'vertical' ? placement.start.row + j : placement.start.row;
        const c = placement.direction === 'horizontal' ? placement.start.col + j : placement.start.col;
        grid[r][c] = word[j];
      }
    }
  });

  // Center the grid
  if (placements.length > 0) {
    const minRow = Math.min(...placements.map(p => p.start.row));
    const maxRow = Math.max(...placements.map(p =>
      p.direction === 'vertical' ? p.start.row + p.word.length - 1 : p.start.row
    ));
    const minCol = Math.min(...placements.map(p => p.start.col));
    const maxCol = Math.max(...placements.map(p =>
      p.direction === 'horizontal' ? p.start.col + p.word.length - 1 : p.start.col
    ));

    const offsetRow = Math.floor((GRID_SIZE - (maxRow - minRow + 1)) / 2) - minRow;
    const offsetCol = Math.floor((GRID_SIZE - (maxCol - minCol + 1)) / 2) - minCol;

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

    return { grid: centeredGrid, placements: centeredPlacements };
  }

  return { grid, placements };
};

const CrosswordReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isPaused: true,
    timeLeft: INITIAL_DURATION,
    score: 0,
    isGameOver: false,
    isCompleted: false
  });

  // Grid state
  const [solutionGrid, setSolutionGrid] = useState<string[][]>([]);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [wordPlacements, setWordPlacements] = useState<WordPlacement[]>([]);
  
  // UI state
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [hints, setHints] = useState<Hint[]>([]);
  
  // Game data
  const [activityName, setActivityName] = useState("");
  const [duration, setDuration] = useState(INITIAL_DURATION);
  const [gameData, setGameData] = useState<GameData[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  // Refs
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  );

  // Initialize game data
  useEffect(() => {
    const fetchData = async () => {
      if (!minigameId) return;

      try {
        const data = await fetchPlayMinigames(minigameId);
        setActivityName(data.minigameName);
        setDuration(data.duration || INITIAL_DURATION);
        setGameState(prev => ({ ...prev, timeLeft: data.duration || INITIAL_DURATION }));

        const xml = new DOMParser().parseFromString(data.dataText, 'application/xml');
        const words = Array.from(xml.querySelectorAll('words'))
          .map(n => n.textContent?.trim() || '')
          .filter(Boolean);
        const clues = Array.from(xml.querySelectorAll('clues'))
          .map(n => n.textContent?.trim() || '')
          .filter(Boolean);

        setThumbnailUrl(data.thumbnailImage ? normalizeUrl(baseImageUrl, data.thumbnailImage) : null);
        setGameData([{ Words: words, Clues: clues, DimensionSize: GRID_SIZE }]);

        const { grid, placements } = generateCrosswordGrid(words, clues);
        setSolutionGrid(grid);
        setUserGrid(createEmptyGrid());
        setWordPlacements(placements);
      } catch (error) {
        console.error('Error fetching game data:', error);
        toast.error('Failed to load crossword data');
      }
    };

    fetchData();
  }, [minigameId]);

  // Timer effect
  useEffect(() => {
    if (!gameState.isPaused && gameState.timeLeft > 0 && gameState.isPlaying && !gameState.isGameOver) {
      timerRef.current = setTimeout(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft === 0) {
            toast.warn("⏰ Time's up!");
            return { ...prev, timeLeft: 0, isGameOver: true, isPaused: true };
          }
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState.timeLeft, gameState.isPaused, gameState.isPlaying, gameState.isGameOver]);

  // Calculate score
  const calculateScore = useCallback(() => {
    let correctCells = 0;
    const totalCells = solutionGrid.flat().filter(cell => cell !== '').length;
    
    solutionGrid.forEach((row, i) => {
      row.forEach((char, j) => {
        if (char && char === userGrid[i][j]) {
          correctCells++;
        }
      });
    });

    return { correctCells, totalCells };
  }, [solutionGrid, userGrid]);

  // Handle input change with keyboard navigation
  const handleInputChange = useCallback((row: number, col: number, value: string) => {
    const newValue = value.toUpperCase().slice(0, 1);
    
    setUserGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = newValue;
      return newGrid;
    });

    // Auto-navigate to next cell
    if (newValue && selectedCell) {
      const currentWord = wordPlacements.find(placement => {
        const { start, direction, word } = placement;
        if (direction === 'horizontal') {
          return row === start.row && col >= start.col && col < start.col + word.length;
        } else {
          return col === start.col && row >= start.row && row < start.row + word.length;
        }
      });

      if (currentWord) {
        const { start, direction, word } = currentWord;
        let nextRow = row;
        let nextCol = col;

        if (direction === 'horizontal' && col < start.col + word.length - 1) {
          nextCol = col + 1;
        } else if (direction === 'vertical' && row < start.row + word.length - 1) {
          nextRow = row + 1;
        }

        if (nextRow !== row || nextCol !== col) {
          setSelectedCell({ row: nextRow, col: nextCol });
          setTimeout(() => {
            const nextInput = inputRefs.current[nextRow]?.[nextCol];
            if (nextInput) nextInput.focus();
          }, 0);
        }
      }
    }
  }, [selectedCell, wordPlacements]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (!solutionGrid[row][col]) {
      setSelectedCell(null);
      setHints([]);
      return;
    }

    setSelectedCell({ row, col });

    const matchedHints = wordPlacements.filter(({ start, direction, word }) => {
      return (
        (direction === 'horizontal' && row === start.row && col >= start.col && col < start.col + word.length) ||
        (direction === 'vertical' && col === start.col && row >= start.row && row < start.row + word.length)
      );
    }).map(({ number, clue, word, start, direction }) => ({
      text: `${number}. ${direction === 'horizontal' ? 'Across' : 'Down'}: ${clue} (${word.length} letters)`,
      start,
      direction
    }));

    setHints(matchedHints);

    // Focus the input
    setTimeout(() => {
      const input = inputRefs.current[row]?.[col];
      if (input) input.focus();
    }, 0);
  }, [solutionGrid, wordPlacements]);

  // Get cell number
  const getCellNumber = useCallback((row: number, col: number): number | null => {
    const cell = wordPlacements.find(p => p.start.row === row && p.start.col === col);
    return cell ? cell.number : null;
  }, [wordPlacements]);

  // Handle game actions
  const handleStartGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
  }, []);

  const handlePauseToggle = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const handleTryAgain = useCallback(() => {
    setUserGrid(createEmptyGrid());
    setSelectedCell(null);
    setHints([]);
    setGameState(prev => ({ 
      ...prev, 
      score: 0, 
      timeLeft: duration, 
      isGameOver: false, 
      isCompleted: false,
      isPaused: true 
    }));
  }, [duration]);

  const handleSubmit = useCallback(() => {
    const { correctCells, totalCells } = calculateScore();
    const newScore = Math.round((correctCells / totalCells) * 100);
    const isCompleted = correctCells === totalCells;
    
    setGameState(prev => ({ 
      ...prev, 
      score: newScore, 
      isCompleted,
      isGameOver: true,
      isPaused: true 
    }));
    
    if (isCompleted) {
      toast.success('🎉 Congratulations! Crossword completed!');
    } else {
      toast.success(`✅ You scored ${correctCells}/${totalCells} correct answers (${newScore}%)`);
    }
  }, [calculateScore]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || !gameState.isPlaying) return;

      const { row, col } = selectedCell;
      let newRow = row;
      let newCol = col;

      switch (e.key) {
        case 'ArrowUp':
          newRow = Math.max(0, row - 1);
          break;
        case 'ArrowDown':
          newRow = Math.min(GRID_SIZE - 1, row + 1);
          break;
        case 'ArrowLeft':
          newCol = Math.max(0, col - 1);
          break;
        case 'ArrowRight':
          newCol = Math.min(GRID_SIZE - 1, col + 1);
          break;
        case 'Backspace':
          handleInputChange(row, col, '');
          return;
        default:
          return;
      }

      if (solutionGrid[newRow][newCol]) {
        handleCellClick(newRow, newCol);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, gameState.isPlaying, solutionGrid, handleCellClick, handleInputChange]);

  // Memoized grid rendering
  const gridCells = useMemo(() => {
    return userGrid.map((row, i) => 
      row.map((char, j) => {
        const number = getCellNumber(i, j);
        const isActive = solutionGrid[i][j] !== '';
        const isSelected = selectedCell?.row === i && selectedCell?.col === j;
        const isCorrect = isActive && solutionGrid[i][j] === char;
        const isIncorrect = isActive && char !== '' && solutionGrid[i][j] !== char;

        return (
          <div
            key={`${i}-${j}`}
            onClick={() => handleCellClick(i, j)}
            className={`
              w-[36px] h-[36px] border-2 flex items-center justify-center relative transition-all duration-300 transform
              ${isActive 
                ? 'cursor-pointer hover:scale-105 hover:shadow-md' 
                : 'border-gray-400/30'
              }
              ${isActive && !isSelected && !gameState.isGameOver
                ? 'bg-white/90 border-gray-300 hover:border-blue-400' 
                : ''
              }
              ${isActive && !isSelected && gameState.isGameOver
                ? 'bg-gray-100 border-gray-300' 
                : ''
              }
              ${!isActive 
                ? 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500' 
                : ''
              }
              ${isSelected && !gameState.isGameOver
                ? 'ring-4 ring-blue-400/50 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-500 shadow-lg scale-105' 
                : ''
              }
              ${gameState.isGameOver && isCorrect 
                ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 shadow-md' 
                : ''
              }
              ${gameState.isGameOver && isIncorrect 
                ? 'bg-gradient-to-br from-red-100 to-pink-100 border-red-400 shadow-md' 
                : ''
              }
              rounded-lg
            `}
          >
            {number && (
              <span className={`
                absolute top-0 left-0 text-[11px] pl-1 pt-0.5 font-bold rounded-tl-lg
                ${isActive 
                  ? 'text-gray-600 bg-white/80' 
                  : 'text-gray-400'
                }
              `}>
                {number}
              </span>
            )}
            {isActive && (
              <input
                ref={el => {
                  if (inputRefs.current[i]) {
                    inputRefs.current[i][j] = el;
                  }
                }}
                type="text"
                value={char}
                onChange={(e) => handleInputChange(i, j, e.target.value)}
                className={`
                  w-full h-full text-center font-bold text-lg bg-transparent focus:outline-none
                  ${isSelected ? 'text-blue-600' : 'text-gray-800'}
                  ${gameState.isGameOver && isCorrect ? 'text-green-600' : ''}
                  ${gameState.isGameOver && isIncorrect ? 'text-red-600' : ''}
                `}
                maxLength={1}
                disabled={gameState.isGameOver}
              />
            )}
            {gameState.isGameOver && isCorrect && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            {gameState.isGameOver && isIncorrect && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✗</span>
              </div>
            )}
          </div>
        );
      })
    );
  }, [userGrid, solutionGrid, selectedCell, gameState.isGameOver, getCellNumber, handleCellClick, handleInputChange]);

  return (
    <>
      <Header />
      {!gameState.isPlaying ? (
        <CrosswordPreview onStart={handleStartGame} />
      ) : (
        <>
          <div className="min-h-screen flex flex-col mt-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-pink-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 px-4 py-8">
              {/* Game Header */}
              <div className="max-w-6xl mx-auto mb-8">
                <div className="text-center mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {activityName}
                  </h1>
                  <p className="text-gray-300 text-lg">Complete the crossword puzzle</p>
                </div>
                
                {/* Game Controls */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6">
                  <div className="flex flex-wrap justify-center items-center gap-8">
                    {/* Timer */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl px-6 py-3 shadow-lg">
                      <div className="text-2xl">⏱️</div>
                      <div className="text-white">
                        <div className="text-sm font-medium opacity-90">Time Left</div>
                        <div className="font-mono text-2xl font-bold">
                          {formatTime(gameState.timeLeft)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Pause/Resume Button */}
                    <button
                      onClick={handlePauseToggle}
                      disabled={gameState.isGameOver}
                      className={`
                        px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg
                        ${gameState.isGameOver 
                          ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed' 
                          : gameState.isPaused 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' 
                            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                        }
                      `}
                    >
                      {gameState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
                    </button>
                    
                    {/* Score */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl px-6 py-3 shadow-lg">
                      <div className="text-2xl">⭐</div>
                      <div className="text-white">
                        <div className="text-sm font-medium opacity-90">Score</div>
                        <div className="text-2xl font-bold">
                          {gameState.score}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Controls */}
              <div className="max-w-6xl mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6">
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
                    }}
                  />
                </div>
              </div>

              {/* Main Game Area */}
              <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Crossword Grid */}
                <div className="flex-1 flex justify-center">
                  <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/30">
                    <div 
                      className="grid gap-[3px] mx-auto w-fit" 
                      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 36px)` }}
                    >
                      {gridCells}
                    </div>
                    
                    {/* Hints */}
                    {hints.map((hint, i) => (
                      <div
                        key={i}
                        className="absolute z-20 p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-xl max-w-[280px] border border-white/20"
                        style={{ 
                          top: `${hint.start.row * 39 + 60}px`, 
                          left: `${hint.start.col * 39 + 20}px` 
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="text-2xl">💡</div>
                          <div>
                            <p className="font-semibold text-sm">{hint.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Side Panel */}
                <div className="lg:w-80 space-y-6">
                  {/* Progress */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6">
                    <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      Progress
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                          <span>Completion</span>
                          <span>{gameState.score}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${gameState.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6">
                    <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      How to Play
                    </h3>
                    <ul className="text-gray-300 space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        Click on a cell to see the clue
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        Use arrow keys to navigate
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        Type letters to fill the grid
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        Submit when ready!
                      </li>
                    </ul>
                  </div>

                  {/* Word List */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6">
                    <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="text-2xl">📝</span>
                      Clues
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {wordPlacements.map((placement, i) => (
                        <div key={i} className="text-sm text-gray-300 p-2 bg-white/5 rounded-lg">
                          <span className="font-semibold text-blue-400">
                            {placement.number}. {placement.direction === 'horizontal' ? 'Across' : 'Down'}:
                          </span>
                          <span className="ml-2">{placement.clue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Status */}
              {gameState.isGameOver && (
                <div className="max-w-6xl mx-auto mt-8">
                  <div className={`
                    p-8 rounded-2xl text-center shadow-2xl border backdrop-blur-lg
                    ${gameState.isCompleted 
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30' 
                      : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30'
                    }
                  `}>
                    <div className="text-6xl mb-4">
                      {gameState.isCompleted ? '🎉' : '⏰'}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {gameState.isCompleted ? 'Congratulations!' : 'Game Over!'}
                    </h2>
                    <p className="text-xl text-gray-200 mb-6">
                      {gameState.isCompleted ? 'Perfect score! You\'re amazing!' : `Final Score: ${gameState.score}%`}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="max-w-6xl mx-auto mt-8">
                <div className="flex justify-center gap-6">
                  <button 
                    onClick={handleTryAgain} 
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <span className="text-xl">🔄</span>
                    Try Again
                  </button>
                  
                  <button 
                    onClick={handleSubmit} 
                    disabled={gameState.isGameOver}
                    className={`
                      px-8 py-4 font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2
                      ${gameState.isGameOver 
                        ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      }
                    `}
                  >
                    <span className="text-xl">✅</span>
                    Submit Answer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </>
      )}
    </>
  );
};

export default CrosswordReview;