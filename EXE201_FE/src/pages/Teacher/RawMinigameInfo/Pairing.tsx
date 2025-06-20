import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPlayMinigames, fetchMinigameRating } from "../../../services/authService";
import { Minigame } from "../../../types";
import { baseImageUrl } from "../../../config/base";

/**
 * Pairing – giới thiệu + nút Play/Editor cho minigame Pairing
 * UI & logic tương tự component Anagram mà bạn gửi
 */
interface PairingProps {
  onStart: () => void;
}

const Pairing: React.FC<PairingProps> = ({ onStart }) => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const navigate = useNavigate();

  const [minigame, setMinigame] = useState<Minigame | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [showWords, setShowWords] = useState(false);
  const [ratings, setRatings] = useState<{
    studentId: string;
    studentName: string;
    minigameId: string;
    score: number;
    comment: string;
    createdDate: string;
  }[]>([]);

  /*──────── fetch data ────────*/
  useEffect(() => {
    if (!minigameId) return;

    (async () => {
      const game = await fetchPlayMinigames(minigameId);
      if (game) {
        setMinigame(game);
        extractWords(game.dataText);
      }
    })();

    (async () => {
      const rs = await fetchMinigameRating(minigameId);
      if (rs) setRatings(rs);
    })();
  }, [minigameId]);

  /*──────── helpers ────────*/
  const extractWords = (xml: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const ws = Array.from(doc.getElementsByTagName("words"))
      .map((n) => n.textContent?.trim() ?? "")
      .filter(Boolean);
    setWords(ws);
  };

  if (!minigame) return <div>Loading…</div>;

  return (
    <div className="min-h-screen font-sans mt-25">
      <div className="max-w-4xl mx-auto mt-6 p-4 bg-blue-200 rounded-xl shadow-md">
        {/*── Info row ──*/}
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
              <span className="text-sm text-gray-500">( {ratings.length} votes )</span>
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

        {/*── Word list toggle ──*/}
        <div className="mt-6">
          <label className="inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={showWords}
              onChange={() => setShowWords((s) => !s)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-yellow-400 transition-colors" />
            <span className="ml-3 text-sm font-medium text-gray-700">Show words</span>
          </label>

          <div
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4 transition-opacity duration-300 ${
              showWords ? "opacity-100" : "opacity-40 pointer-events-none select-none"
            }`}
          >
            {words.map((w, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-3 shadow-sm text-center font-medium">
                {i + 1}. {w}
              </div>
            ))}
          </div>
        </div>

        {/*── Ratings ──*/}
        {ratings.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Đánh giá</h2>
            {ratings.map((r, idx) => (
              <div key={idx} className="border-t pt-4 mt-4">
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

export default Pairing;
