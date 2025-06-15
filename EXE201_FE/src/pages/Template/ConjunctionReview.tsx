/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import KeywordDragDrop from "../../components/Conjunction/DragDrop";
import Header from "../../components/HomePage/Header";
import { fetchPlayMinigames } from "../../services/authService";
import EditConjunction from "../Teacher/Template/EditConjunction";
import { baseImageUrl } from "../../config/base";
import { toast } from "react-toastify";
import Conjunction from "../Teacher/RawMinigameInfo/Conjunction";

const ConjunctionReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [activityName, setActivityName] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [meanings, setMeanings] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string | null>(null); // URL for display
  const [dropped, setDropped] = useState<{ [index: number]: string | null }>({});
  const [duration, setDuration] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDrop = (targetIndex: number, keyword: string) => {
    if (!isTimeUp && !isPaused) {
      setDropped((prev) => ({ ...prev, [targetIndex]: keyword }));
    }
  };

  const normalizeUrl = (base: string, path: string): string => {
    // Remove trailing slash from base and leading slash from path, then join with a single slash
    return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  };

  const loadMinigame = async () => {
    if (!minigameId) return;

    try {
      const result = await fetchPlayMinigames(minigameId);
      setActivityName(result.minigameName || "");
      setDuration(result.duration || 0);

      // Construct thumbnail URL
      const thumbnailUrl = result.thumbnailImage ? normalizeUrl(baseImageUrl, result.thumbnailImage) : null;
      setThumbnail(thumbnailUrl);

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
      toast.error("Failed to load minigame.");
    }
  };

  useEffect(() => {
    loadMinigame();
  }, [minigameId]);

  const calculateScore = () => {
    let correct = 0;
    meanings.forEach((meaning, index) => {
      if (dropped[index] === keywords[index]) correct++;
    });
    setScore(correct);
    setShowResult(true);
  };

  const finishEarly = useCallback(() => {
    setIsTimeUp(true);
    calculateScore();
  }, [calculateScore]);

  useEffect(() => {
    if (duration <= 0 || isPaused || isTimeUp) return;

    const interval = setInterval(() => {
      setDuration((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishEarly();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, finishEarly, isPaused, isTimeUp]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const tryAgain = () => {
    setDropped({});
    setDuration(0);
    setIsTimeUp(false);
    setIsPaused(false);
    setShowResult(false);
    setScore(0);
    loadMinigame();
  };

  return (
    <>
      <Header />
      {!isPlaying ? (
        <Conjunction onStart={() => setIsPlaying(true)}/>
      ):
      <div className="max-w-3xl mx-auto p-6 space-y-4 mt-20 border rounded-lg shadow-lg bg-white">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Activity Review</h1>
          <div className="text-red-600 font-semibold text-lg">⏳ {formatTime(duration)}</div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1 rounded border bg-gray-200 hover:bg-gray-300"
          >
            {isPaused ? "▶️ Resume" : "⏸️ Pause"}
          </button>
          <EditConjunction
            initialActivityName={activityName}
            initialDuration={duration}
            initialEntries={keywords.map((k, i) => ({
              Term: k,
              Definition: meanings[i] || "",
            }))}
            initialThumbnailUrl={thumbnail} // Pass URL only
            onSave={(newData) => {
              setActivityName(newData.activityName);
              setDuration(newData.duration);
              setKeywords(newData.entries.map((e) => e.Term));
              setMeanings(newData.entries.map((e) => e.Definition));
              setThumbnail(newData.thumbnailUrl); // Update URL
            }}
          />
        </div>

        <h2 className="text-xl font-semibold text-blue-700">Activity Name: {activityName}</h2>
        {thumbnail && (
          <div className="mt-2">
            <img src={thumbnail} alt="Activity thumbnail" className="w-20 h-20 object-cover rounded" />
          </div>
        )}

        {isTimeUp && (
          <div className="text-red-600 font-bold mt-2">
            ⏰ Time is up! You can no longer interact with this activity.
          </div>
        )}

        <div className="p-6 mt-6 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-bold mb-4">Match the keywords</h2>
          <KeywordDragDrop
            keywords={keywords}
            targets={meanings}
            onDrop={handleDrop}
            droppedKeywords={dropped}
            disabled={isTimeUp || isPaused}
          />
        </div>

        {showResult && (
          <div className="p-4 mt-6 border rounded bg-yellow-50 text-green-700">
            ✅ You got {score} out of {keywords.length} correct!
            <ul className="mt-2 list-disc pl-5 text-sm text-black">
              {meanings.map((meaning, index) => (
                <li key={index}>
                  {meaning}:{" "}
                  <span className={dropped[index] === keywords[index] ? "text-green-600" : "text-red-600"}>
                    {dropped[index] || "No answer"}{" "}
                    {dropped[index] === keywords[index] ? "(Correct)" : `(Expected: ${keywords[index]})`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isTimeUp && (
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={tryAgain}
              className="px-4 py-2 rounded bg-blue-100 hover:bg-blue-200 border"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {!isTimeUp && (
          <div className="flex justify-end mt-6">
            <button
              onClick={finishEarly}
              className="px-4 py-2 rounded bg-green-100 hover:bg-green-200 border"
            >
              ✅ Finish
            </button>
          </div>
        )}
      </div>
}
    </>
  );
};

export default ConjunctionReview;