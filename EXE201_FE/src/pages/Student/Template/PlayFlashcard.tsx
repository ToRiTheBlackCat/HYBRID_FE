import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchPlayMinigames, submitAccomplishment, fetchCourseMinigame } from '../../../services/authService';
import { Flashcard, Accomplishment, Minigame } from '../../../types';
import { ChevronLeft, ChevronRight, RotateCcw, Check, Menu, X } from 'lucide-react';
import Header from '../../../components/HomePage/Header';
import { baseImageUrl } from '../../../config/base';
import { getLocalISOTime } from '../../../services/userService';
import '../../../style/Flashcard.css'; // Import custom styles for flashcard animations

const normalize = (base: string, path: string) =>
  `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}?t=${Date.now()}`;

const PAGE_SIZE = 50;

// Map templateId → route segment; keep in sync with router
const paths: Record<string, string> = {
  TP1: "conjunction",
  TP2: "quiz",
  TP3: "anagram",
  TP4: "random-card",
  TP5: "spelling",
  TP6: "flashcard",
  TP7: "completion",
  TP8: "pairing",
  TP9: "restoration",
  TP10: "find-word",
  TP11: "true-false",
  TP12: "crossword",
};

const PlayFlashcard: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;
  const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        if (!minigameId) return;

        const data = await fetchPlayMinigames(minigameId);
        const raw = data.dataText as string;

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(raw, 'application/xml');
        const questionNodes = Array.from(xmlDoc.getElementsByTagName('question'));

        const parsedFlashcards: Flashcard[] = questionNodes.map((node, index) => {
          const front = node.getElementsByTagName('front')[0]?.textContent || '';
          const back = node.getElementsByTagName('back')[0]?.textContent || '';
          return { id: index + 1, front, back };
        });

        setFlashcards(parsedFlashcards);
        setStartTime(new Date());
      } catch (err) {
        console.error('Error fetching flashcards', err);
      }
    };

    loadFlashcards();
  }, [minigameId]);

  useEffect(() => {
    if (!courseIdFromState) return;
    const load = async () => {
      try {
        const res = await fetchCourseMinigame(courseIdFromState, {
          PageNum: 1,
          PageSize: PAGE_SIZE,
        });
        setCourseMinigames(res?.minigames ?? []);
      } catch (err) {
        console.error("Error loading course minigames", err);
      }
    };
    load();
  }, [courseIdFromState]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!submitted) handleSubmit();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [submitted]);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handlePrev = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handleReset = () => {
    setFlipped(false);
    setCurrentIndex(0);
  };

  const handleSubmit = async () => {
    if (submitted || !minigameId || !startTime) return;
    setSubmitted(true);

    const durationUsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const viewed = currentIndex + 1;
    const percent = Math.round((viewed / flashcards.length) * 100);

    const payload: Accomplishment = {
      MinigameId: minigameId,
      Percent: percent,
      DurationInSecond: durationUsed,
      TakenDate: getLocalISOTime(),
    } as unknown as Accomplishment;

    try {
      await submitAccomplishment(payload);
    } catch (err) {
      console.error('submitAccomplishment error:', err);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
        {/* Sidebar Toggle Button */}
        {courseMinigames.length > 0 && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-24 right-4 z-50 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-full p-3 shadow-lg hover:shadow-xl border border-white/20"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* Sidebar */}
        {courseMinigames.length > 0 && (
          <aside className={`fixed top-24 right-4 w-80 bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden max-h-[80vh] transition-all duration-300 z-40 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <h3 className="font-bold text-lg">Minigames khác</h3>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              {courseMinigames.map((mg) => {
                const isActive = mg.minigameId === minigameId;
                const path = paths[mg.templateId];
                return (
                  <button
                    key={mg.minigameId}
                    onClick={() => {
                      navigate(`/student/${path}/${mg.minigameId}`, {
                        state: { courseId: courseIdFromState },
                      });
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 ${
                      isActive ? "bg-blue-100 border-r-4 border-blue-500" : ""
                    }`}
                    disabled={isActive}
                  >
                    <img
                      src={normalize(baseImageUrl, mg.thumbnailImage)}
                      alt={mg.minigameName}
                      className="w-12 h-12 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex flex-col flex-1">
                      <span className="line-clamp-2 font-medium text-gray-800">{mg.minigameName}</span>
                      <span className="line-clamp-2 text-gray-500 text-sm">{mg.templateName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Flashcard Learning
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {flashcards.length > 0 ? (
            <div className="flex flex-col items-center space-y-8">
              {/* Progress Section */}
              <div className="w-full max-w-md">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Tiến độ</span>
                  <span>{currentIndex + 1} / {flashcards.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Flashcard Section */}
              <div className="flex items-center justify-center space-x-8">
                <button 
                  onClick={handlePrev} 
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-full p-4 shadow-lg hover:shadow-xl border border-white/20 hover:scale-105"
                >
                  <ChevronLeft size={32} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                </button>

                <div className="card-container relative cursor-pointer" onClick={handleFlip}>
                  <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                    <div className="card-front">
                      <div className="absolute top-4 left-4 px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-medium">
                        Câu hỏi
                      </div>
                      <div className="pt-12 text-center text-lg font-medium text-gray-800">
                        {flashcards[currentIndex].front}
                      </div>
                      <div className="absolute bottom-4 right-4 text-gray-400 text-sm flex items-center space-x-1">
                        <span>Nhấn để xem đáp án</span>
                        <span className="text-blue-500">↻</span>
                      </div>
                    </div>
                    <div className="card-back">
                      <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-sm rounded-full font-medium">
                        Đáp án
                      </div>
                      <div className="pt-12 text-center text-lg font-medium text-gray-800">
                        {flashcards[currentIndex].back}
                      </div>
                      <div className="absolute bottom-4 right-4 text-gray-400 text-sm flex items-center space-x-1">
                        <span>Nhấn để xem câu hỏi</span>
                        <span className="text-green-500">↻</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleNext} 
                  className="group bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 rounded-full p-4 shadow-lg hover:shadow-xl border border-white/20 hover:scale-105"
                >
                  <ChevronRight size={32} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                </button>
              </div>

              {/* Navigation Dots */}
              <div className="flex space-x-2 max-w-md overflow-x-auto">
                {flashcards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setFlipped(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 flex-shrink-0 ${
                      index === currentIndex
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 flex-wrap justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={submitted}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    submitted
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  <Check size={20} />
                  {submitted ? 'Đã hoàn thành' : 'Hoàn thành'}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <RotateCcw size={20} />
                  Bắt đầu lại
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-md mx-auto">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-600 text-lg">Chưa có flashcard nào để xem.</p>
                <p className="text-gray-500 text-sm mt-2">Hãy thêm flashcard để bắt đầu học!</p>
              </div>
            </div>
          )}
        </div>
      </div>


    </>
  );
};

export default PlayFlashcard;