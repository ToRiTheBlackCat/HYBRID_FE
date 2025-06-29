import React, { useEffect, useState } from "react";
import { fetchPlayMinigames, fetchMinigameRating } from "../../../services/authService";
import { baseImageUrl } from "../../../config/base";
import { useNavigate, useParams } from "react-router-dom";

interface CrosswordPreviewProps {
  onStart: () => void;
}
interface Rating {
  studentId: string;
  studentName: string;
  minigameId: string;
  score: number;
  comment: string;
  createdDate: string;
}
interface MinigameData {
  minigameName: string;
  teacherName: string;
  thumbnailImage?: string;
  duration: number;
  dataText: string;
  ratingScore?: number;
}

const CrosswordPreview: React.FC<CrosswordPreviewProps> = ({ onStart }) => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [minigame, setMinigame] = useState<MinigameData | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [clues, setClues] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMinigame = async () => {
      if (!minigameId) return;
      const data = await fetchPlayMinigames(minigameId);
      if (!data) return;
      setMinigame(data);

      const xml = new DOMParser().parseFromString(data.dataText, "application/xml");
      const wordTags = xml.getElementsByTagName("words");
      const clueTags = xml.getElementsByTagName("clues");
      const parsedWords = Array.from(wordTags).map((w) => w.textContent?.trim() || "");
      const parsedClues = Array.from(clueTags).map((c) => c.textContent?.trim() || "");
      setWords(parsedWords);
      setClues(parsedClues);
    };
    const loadRatings = async () => {
      if (!minigameId) return;
      const data = await fetchMinigameRating(minigameId);
      setRatings(data || []);
    };

    loadRatings();
    loadMinigame();
  }, [minigameId]);

  if (!minigame) return <div>Loading...</div>;

  return (
    <div className="min-h-screen font-sans mt-10">
      <div className="max-w-4xl mx-auto p-4 bg-blue-200 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-20">
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
                className="bg-yellow-400 hover:bg-yellow-300 px-5 py-2 rounded-full font-semibold shadow"
                onClick={() =>
                  navigate(`/teacher/minigame-data/${minigameId}`)
                }
              >
                View minigame data
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Word & Clue List</h2>
          <ul className="space-y-2">
            {words.map((word, index) => (
              <li key={index} className="bg-white p-3 rounded shadow">
                <strong>{index + 1}. {word}</strong> — {clues[index] || "No clue"}
              </li>
            ))}
          </ul>
        </div>
        {ratings.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Student Ratings</h2>
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

export default CrosswordPreview;
