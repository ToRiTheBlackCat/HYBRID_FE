import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { fetchteacherMinigames } from "../../services/authService";
import { Minigame } from "../../types";
import { FaLock } from "react-icons/fa";
import Header from "../../components/HomePage/Header";
import { useNavigate } from "react-router-dom";
import { baseImageUrl } from "../../config/base";


const TeacherAccomplishment: React.FC = () => {
  const teacherId = useSelector((state: RootState) => state.user.userId);
  const [minigames, setMinigames] = useState<Minigame[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMinigames = async () => {
      if (!teacherId) return;
      const result = await fetchteacherMinigames(teacherId);
      console.log('Data', result);
      if (result && Array.isArray(result.minigames)) {
        setMinigames(result.minigames);
      }
    };
    loadMinigames();
  }, [teacherId]);
  const handleMinigameClick = (minigameId: string) => {
    navigate(`/teacher/conjunction-review/${minigameId}`);
  }

  return (
    <>
    <Header />
    <div className="max-w-6xl mt-20 mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">My Activities</h2>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button className="border px-3 py-1 rounded hover:bg-gray-200">➕ New folder</button>
          <button className="border px-3 py-1 rounded hover:bg-gray-200">🗑️ Recycle bin</button>
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-1 rounded w-64"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {minigames.map((game) => {
          const thumbnail = `${baseImageUrl}${game.thumbnailImage?.trim().replace(/^\/+/, "")}`;
          return (
            <div
              key={game.minigameId}
              className="border rounded-lg shadow-sm p-3 hover:shadow-md transition"
              onClick={() => handleMinigameClick(game.minigameId)}
            >
              <img
                src={thumbnail}
                alt={game.minigameName}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="mt-2 font-semibold">{game.minigameName}</h3>
              <p className="text-sm text-gray-600">{game.templateName}</p>
              <div className="flex items-center text-sm mt-1 text-gray-500">
                <FaLock className="mr-1" />
                Private
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default TeacherAccomplishment;
