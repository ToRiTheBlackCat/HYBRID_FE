import React, { useEffect, useState } from "react";
import {
  fetchPlayMinigames,
  fetchMinigameRating,
} from "../../../services/authService";
import { Minigame, SpellingItem } from "../../../types";
import { baseImageUrl } from "../../../config/base";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface SpellingProp {
    onStart: () => void
}

const Spelling: React.FC<SpellingProp> = ({onStart}) =>{
    const { minigameId } = useParams<{ minigameId: string }>();
    const [minigame, setMinigame] = useState<Minigame | null>(null);
    const [showQuestions, setShowQuestions] = useState(false);
    const [deck, setDeck] = useState<SpellingItem[]>([]);
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
    useEffect(() => {
        if (!minigameId) return;
    
        const loadMinigame = async () => {
            const data = await fetchPlayMinigames(minigameId);
            if (data) {
            setMinigame(data);
            extractDeckFromXML(data.dataText);
            }
        };
    
        const loadRatings = async () => {
            const data = await fetchMinigameRating(minigameId);
            if (data) setRatings(data);
        };
    
        loadMinigame();
        loadRatings();
    }, [minigameId]);

    const extractDeckFromXML = async (xmlString: string) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, "text/xml");
        const questions = Array.from(xml.getElementsByTagName("question"));

        const parsed: SpellingItem[] = await Promise.all(
        questions.map(async (q) => {
            const word =
            q.getElementsByTagName("word")[0]?.textContent?.trim() || "";
            const imageURL =
            q.getElementsByTagName("image")[0]?.textContent?.trim() || "";

            const finalUrl = baseImageUrl + imageURL;
            try {
            const response = await fetch(finalUrl);
            const blob = await response.blob();
            const file = new File([blob], "image.jpg", { type: blob.type });
            return { Word: word, Image: file } as SpellingItem;
            } catch (err) {
            console.error("Image fetch failed", err);
            return { Word: word, Image: null } as SpellingItem;
            }
        })
        );

        setDeck(parsed);
    };
    if (!minigame) return <div>Loading...</div>;

  /*--- UI ------------------------------------------------------------------*/
  return (
    <div className="min-h-screen font-sans mt-30">
      <div className="max-w-4xl mx-auto mt-6 p-4 bg-blue-200 rounded-xl shadow-md">
        {/* Header Info */}
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
              {deck.length} cards • {minigame.duration} sec duration
            </div>
            <div className="mt-3 flex gap-3">
              <button
                className="bg-yellow-400 hover:bg-yellow-300 px-5 py-2 rounded-full font-semibold shadow"
                onClick={onStart}
              >
                Play and edit now
              </button>
              <button
                className="bg-yellow-400 hover:bg-yellow-300 px-5 py-2 rounded-full font-semibold shadow"
                onClick={() => navigate(`/teacher/minigame-data/${minigameId}`)}
              >
                View minigame data
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Questions */}
        <div className="mt-6">
          <div className="flex items-center mt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showQuestions}
                onChange={() => setShowQuestions(!showQuestions)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-yellow-400 transition-all duration-300"></div>
              <span className="ml-3 text-sm font-medium text-gray-700 select-none">
                Show cards
              </span>
            </label>
          </div>

          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4 transition-opacity duration-300 ${
              showQuestions
                ? "opacity-100"
                : "opacity-40 pointer-events-none select-none"
            }`}
          >
            {deck.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {card.Image ? (
                  <img
                    src={URL.createObjectURL(card.Image)}
                    alt={`Card ${idx + 1}`}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <p className="p-2 text-center text-sm font-semibold">
                  {idx + 1}. {card.Word}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings */}
        {ratings.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Đánh giá</h2>
            {ratings.map((rating, idx) => (
              <div key={idx} className="border-t pt-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                    {rating.studentName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{rating.studentName}</p>
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      {"★".repeat(rating.score)}
                      {"☆".repeat(5 - rating.score)}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(rating.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{rating.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Spelling;
