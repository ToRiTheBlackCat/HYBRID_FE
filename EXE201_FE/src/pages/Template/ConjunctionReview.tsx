import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import KeywordDragDrop from "../../components/Conjunction/DragDrop";
import Header from "../../components/HomePage/Header";
import { fetchPlayMinigames } from "../../services/authService";

// interface Entry {
//   keyword: string;
//   meaning: string;
// }

const ConjunctionReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [activityName, setActivityName] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [meanings, setMeanings] = useState<string[]>([]);
  const [dropped, setDropped] = useState<{ [index: number]: string | null }>({});
  const [duration, setDuration] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleDrop = (targetIndex: number, keyword: string) => {
    if (!isTimeUp && !isPaused) {
      setDropped((prev) => ({ ...prev, [targetIndex]: keyword }));
    }
  };

  useEffect(() => {
    const loadMinigame = async () => {
      if (!minigameId) return;

      try {
        const result = await fetchPlayMinigames(minigameId);
        setActivityName(result.minigameName || "");
        setDuration(result.duration || 0);

        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result.dataText, "text/xml");
        const questions = xmlDoc.getElementsByTagName("question");

        const terms: string[] = [];
        const defs: string[] = [];

        for (let i = 0; i < questions.length; i++) {
          const term = questions[i].getElementsByTagName("term")[0]?.textContent || "";
          const def = questions[i].getElementsByTagName("definition")[0]?.textContent || "";
          if (term && def) {
            terms.push(term);
            defs.push(def);
          }
        }

        setKeywords(terms);
        setMeanings(defs);
      } catch (error) {
        console.error("Failed to load minigame:", error);
      }
    };

    loadMinigame();
  }, [minigameId]);

  useEffect(() => {
    if (duration <= 0 || isPaused) return;

    const interval = setInterval(() => {
      setDuration((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimeUp(true)
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, isPaused]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6 space-y-4 mt-20 border rounded-lg shadow-lg bg-white">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-4">Activity Review</h1>
          <div className="text-red-600 font-semibold text-lg">
            ⏳ {formatTime(duration)}
          </div>
          <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200"
            >
              {isPaused ? "▶️ Resume" : "⏸️ Pause"}
            </button>
        </div>
        <h2 className="text-xl font-semibold text-blue-700">Activity Name: {activityName}</h2>

        {isTimeUp && (
          <div className="text-red-600 font-bold mt-4 text-lg">
            ⏰ Time is up! You can no longer interact with this activity.
          </div>
        )}

        <div className="max-w-3xl mx-auto p-6 mt-20 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-bold mb-4">Match the keywords</h2>

          <KeywordDragDrop
            keywords={keywords}
            targets={meanings}
            onDrop={handleDrop}
            droppedKeywords={dropped}
            disabled={isTimeUp || isPaused}
          />
        </div>
      </div>
    </>
  );
};

export default ConjunctionReview;
