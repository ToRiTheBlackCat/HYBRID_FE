import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchPlayMinigames, submitAccomplishment, fetchCourseMinigame } from '../../../services/authService';
import { Flashcard, Accomplishment, Minigame } from '../../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../../components/HomePage/Header';
import { baseImageUrl } from '../../../config/base';

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
      TakenDate: new Date(),
    };

    try {
      await submitAccomplishment(payload);
    } catch (err) {
      console.error('submitAccomplishment error:', err);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        {courseMinigames.length > 0 && (
          <aside className="absolute top-24 right-4 w-60 bg-white border rounded-lg shadow-md overflow-auto max-h-[80vh]">
            <h3 className="font-bold text-center py-2 border-b">Other games</h3>
            {courseMinigames.map((mg) => {
              const isActive = mg.minigameId === minigameId;
              const path = paths[mg.templateId];
              return (
                <button
                  key={mg.minigameId}
                  onClick={() =>
                    navigate(`/student/${path}/${mg.minigameId}`, {
                      state: { courseId: courseIdFromState },
                    })
                  }
                  className={`w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-blue-50 ${isActive ? "bg-blue-100 font-semibold" : ""
                    }`}
                  disabled={isActive}
                >
                  <img
                    src={normalize(baseImageUrl, mg.thumbnailImage)}
                    alt={mg.minigameName}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex flex-col">
                    <span className="line-clamp-2">{mg.minigameName}</span>
                    <span className="line-clamp-2 text-gray-500 text-xs">{mg.templateName}</span>
                  </div>
                </button>
              );
            })}
          </aside>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Xem lại Flashcard</h1>

        {flashcards.length > 0 ? (
          <>
            <div className="flex items-center space-x-6">
              <button onClick={handlePrev} className="text-gray-700 hover:text-black">
                <ChevronLeft size={40} />
              </button>

              <div className="card-container" onClick={handleFlip}>
                <div className={`card-inner ${flipped ? "flipped" : ""}`}>
                  <div className="card-front">{flashcards[currentIndex].front}</div>
                  <div className="card-back">{flashcards[currentIndex].back}</div>
                </div>
              </div>

              <button onClick={handleNext} className="text-gray-700 hover:text-black">
                <ChevronRight size={40} />
              </button>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                disabled={submitted}
              >
                Done
              </button>
              <button
                onClick={handleReset}
                className="bg-yellow-400 text-white px-6 py-2 rounded hover:bg-yellow-500"
              >
                Reset
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 mt-8">Chưa có flashcard nào để xem.</p>
        )}
      </div>
    </>
  );
};

export default PlayFlashcard;
