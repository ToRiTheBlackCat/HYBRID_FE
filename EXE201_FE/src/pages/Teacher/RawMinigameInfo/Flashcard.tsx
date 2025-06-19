import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPlayMinigames, fetchMinigameRating } from "../../../services/authService";
import { Minigame } from "../../../types";
import { baseImageUrl } from "../../../config/base";

interface FlashcardEntry {
  front: string;
  back: string;
}

interface FlashcardProps {
  onStart: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ onStart }) => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [minigame, setMinigame] = useState<Minigame | null>(null);
  const [cards, setCards] = useState<FlashcardEntry[]>([]);
  const [showCards, setShowCards] = useState(false);
  const navigate = useNavigate();

  const [ratings, setRatings] = useState<
    {
      studentId: string;
      studentName: string;
      minigameId: string;
      score: number;
      comment: string;
      createdDate: string;
    }[]
  >([]);

  /*──────────────────────────────────────────*/
  useEffect(() => {
    const loadMinigame = async () => {
      if (!minigameId) return;
      const data = await fetchPlayMinigames(minigameId);
      if (data) {
        setMinigame(data);
        extractCardsFromXML(data.dataText);
      }
    };

    const loadRatings = async () => {
      if (!minigameId) return;
      const data = await fetchMinigameRating(minigameId);
      if (data) setRatings(data);
    };

    loadMinigame();
    loadRatings();
  }, [minigameId]);

  /*──────────────────────────────────────────*/
  const extractCardsFromXML = (xml: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const questions = Array.from(doc.getElementsByTagName("question"));

    const parsed: FlashcardEntry[] = questions.map((q) => ({
      front: q.getElementsByTagName("front")[0]?.textContent?.trim() || "",
      back: q.getElementsByTagName("back")[0]?.textContent?.trim() || "",
    }));
    setCards(parsed);
  };

  if (!minigame) return <div className="text-center mt-10">Loading...</div>;

  /*──────────────────────────────────────────*/
  return (
    <div className="min-h-screen font-sans mt-30">
      <div className="max-w-4xl mx-auto mt-6 p-4 bg-blue-200 rounded-xl shadow-md">
        {/* Header info */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
            {minigame.thumbnailImage ? (
              <img
                src={`${baseImageUrl}${minigame.thumbnailImage}`}
                alt="Thumbnail"
                className="object-cover w-full h-full rounded-lg"
              />
            ) : (
              <span>No Image</span>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-semibold">Teacher:</span>{" "}
              {minigame.teacherName}
            </p>
            <h1 className="text-xl font-bold">{minigame.minigameName}</h1>

            <div className="flex items-center gap-2 mt-1 text-yellow-600">
              <span className="font-semibold">
                {minigame.ratingScore ?? 5.0}
              </span>
              <span className="text-sm text-gray-500">(2 votes)</span>
            </div>

            <div className="text-sm text-gray-600 mt-1">
              {cards.length} cards • {minigame.duration}sec duration
            </div>

            <div className="mt-3 flex gap-3">
              <button
                className="bg-yellow-400 hover:bg-yellow-300 px-5 py-2 rounded-full font-semibold shadow"
                onClick={onStart}
              >
                Play and edit now
              </button>
              <button
                className="bg-blue-400 hover:bg-blue-500 px-5 py-2 rounded-full font-semibold shadow"
                onClick={() => navigate(`/teacher/minigame-data/${minigameId}`)}
              >
                View minigame data
              </button>
            </div>
          </div>
        </div>

        {/* Toggle show cards */}
        <div className="mt-6">
          <div className="flex items-center mt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showCards}
                onChange={() => setShowCards(!showCards)}
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-yellow-400 transition-all duration-300"></div>
              <span className="ml-3 text-sm font-medium text-gray-700 select-none">
                Show cards
              </span>
            </label>
          </div>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 transition-opacity duration-300 ${
              showCards ? "opacity-100" : "opacity-40 pointer-events-none select-none"
            }`}
          >
            {cards.map((c, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-4 shadow-sm space-y-2"
              >
                <p className="font-semibold text-blue-700">
                  {idx + 1}. {c.front}
                </p>
                <p className="text-green-700">{c.back}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings */}
        {ratings.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Đánh giá</h2>
            {ratings.map((r, i) => (
              <div key={i} className="border-t pt-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                    {r.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{r.studentName}</p>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      {"★".repeat(r.score)}
                      {"☆".repeat(5 - r.score)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(r.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcard;
