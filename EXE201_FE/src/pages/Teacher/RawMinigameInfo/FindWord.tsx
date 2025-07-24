import React, { useState, useEffect } from "react";
import { fetchPlayMinigames, fetchMinigameRating } from "../../../services/authService";
import { Minigame } from "../../../types";
import { baseImageUrl } from "../../../config/base";
import { useParams, useNavigate } from "react-router-dom";

interface FindWordProps {
  onStart: () => void;
}

const FindWordPreview: React.FC<FindWordProps> = ({ onStart }) => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const navigate = useNavigate();

  const [minigame, setMinigame] = useState<Minigame | null>(null);
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

  const [words, setWords] = useState<string[]>([]);
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!minigameId) return;

    const loadMinigame = async () => {
      const data = await fetchPlayMinigames(minigameId);
      if (data) {
        setMinigame(data);
        parseDataText(data.dataText);
      }
    };

    const loadRatings = async () => {
      const data = await fetchMinigameRating(minigameId);
      if (data) setRatings(data);
    };

    loadMinigame();
    loadRatings();
  }, [minigameId]);

  const parseDataText = (xmlString: string) => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    const question = xml.querySelector("question");
    const wordsList = question?.querySelectorAll("words");
    const parsedWords = wordsList ? Array.from(wordsList).map(w => w.textContent?.trim().toUpperCase() || "") : [];
    const hintText = question?.querySelector("hint")?.textContent ?? "";
    // const dim = parseInt(question?.querySelector("dimension")?.textContent ?? "10");

    setWords(parsedWords);
    setHint(hintText);
  };

  if (!minigame) return <div>Loading...</div>;

  return (
    <div className="min-h-screen font-sans mt-30">
      <div className="max-w-4xl mx-auto mt-6 p-4 bg-blue-200 rounded-xl shadow-md">
        {/* Top card */}
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
              <span className="font-semibold">Teacher:</span> {minigame.teacherName}
            </p>
            <h1 className="text-xl font-bold">{minigame.minigameName}</h1>

            <div className="flex items-center gap-2 mt-1 text-yellow-600">
              <span className="font-semibold">{minigame.ratingScore ?? 5.0}</span>
              <span className="text-sm text-gray-500">
                ({ratings.length} {ratings.length === 1 ? "vote" : "votes"})
              </span>
            </div>

            <div className="text-sm text-gray-600 mt-1">
              {words.length} words • {minigame.duration} sec duration
            </div>

            <div className="mt-3 flex gap-3">
              <button
                className="bg-yellow-400 hover:bg-yellow-300 px-5 py-2 rounded-full font-semibold shadow"
                onClick={onStart}
              >
                Play and edit now
              </button>
              <button
                className="bg-blue-400 hover:bg-blue-300 px-5 py-2 rounded-full font-semibold shadow"
                onClick={() => navigate(`/teacher/minigame-data/${minigameId}`)}
              >
                View minigame data
              </button>
            </div>
          </div>
        </div>

        {/* Words and hint */}
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-700">Hint: {hint}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
            {words.map((word, idx) => (
              <div key={idx} className="bg-white p-2 rounded shadow text-center font-semibold text-gray-700">
                {word}
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

export default FindWordPreview;
