import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { fetchTeacherMinigames } from "../../services/authService";
import { Minigame } from "../../types";
import { FaLock } from "react-icons/fa";
import Header from "../../components/HomePage/Header";
import { useNavigate } from "react-router-dom";
import { baseImageUrl } from "../../config/base";

const PAGE_SIZE = 9;

const TeacherActivities: React.FC = () => {
  const teacherId = useSelector((state: RootState) => state.user.userId);
  const [minigames, setMinigames] = useState<Minigame[]>([]);
  const [search, setSearch] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");


  const navigate = useNavigate();
  const templates = [
  { label: "All Templates", value: "" },
  { label: "Conjunction", value: "TP1" },
  { label: "Quiz", value: "TP2" },
  { label: "Anagram", value: "TP3" },
  { label: "Random Card", value: "TP4" },
  { label: "Spelling", value: "TP5" },
  { label: "Flash Card", value: "TP6" },
  { label: "Completion", value: "TP7" },
  { label: "Pairing", value: "TP8" },
  { label: "Restoration", value: "TP9" },
  { label: "Find Word", value: "TP10" },
  { label: "True/False", value: "TP11" },
  { label: "Crossword", value: "TP12" },
];


  useEffect(() => {
    const loadMinigames = async () => {
      if (!teacherId) return;
      setLoading(true);
      try {
        const result = await fetchTeacherMinigames({
          teacherId,
          minigameName: search,
          templateId: selectedTemplate,
          pageNum,
          pageSize: PAGE_SIZE,
        });

        if (result && Array.isArray(result.minigames)) {
          setMinigames(result.minigames);
          setTotalPages(result.totalPages ?? 1); // Lấy từ API
        } else {
          setMinigames([]);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMinigames();
  }, [teacherId, search, pageNum, selectedTemplate]);

  const handleMinigameClick = (minigameId: string, templateId: string) => {
    switch (templateId) {
      case "TP1":
        navigate(`/teacher/conjunction-review/${minigameId}`);
        break;
      case "TP2":
        navigate(`/teacher/quiz-review/${minigameId}`);
        break;
      case "TP3":
        navigate(`/teacher/anagram-review/${minigameId}`);
        break;
      default:
        break;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPageNum(1); // Reset về trang đầu khi search
  };

  const handlePrevPage = () => {
    if (pageNum > 1) setPageNum(pageNum - 1);
  };

  const handleNextPage = () => {
    if (pageNum < totalPages) setPageNum(pageNum + 1);
  };

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
          <div className="flex gap-3 items-center">
            <select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                setPageNum(1); // reset page khi filter
              }}
              className="border px-3 py-1 rounded"
            >
              {templates.map((template) => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={handleSearchChange}
              className="border px-3 py-1 rounded w-64"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {minigames.map((game) => {
                const thumbnail = `${baseImageUrl}${game.thumbnailImage?.trim().replace(/^\/+/, "")}`;
                return (
                  <div
                    key={game.minigameId}
                    className="border rounded-lg shadow-sm p-3 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleMinigameClick(game.minigameId, game.templateId)}
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

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={handlePrevPage}
                disabled={pageNum === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {pageNum} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pageNum === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TeacherActivities;
