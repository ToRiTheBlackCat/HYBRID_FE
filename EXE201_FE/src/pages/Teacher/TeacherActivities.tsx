import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { fetchTeacherMinigames, deleteMinigame } from "../../services/authService";
import { Minigame } from "../../types";
import { FaLock, FaTrash, FaSearch, FaFilter, FaGrin, FaList, FaEye } from "react-icons/fa";
import Header from "../../components/HomePage/Header";
import { useNavigate } from "react-router-dom";
import { baseImageUrl } from "../../config/base";
import { toast } from "react-toastify";

const PAGE_SIZE = 8;

const TeacherActivities: React.FC = () => {
  const teacherId = useSelector((state: RootState) => state.user.userId);
  const [minigames, setMinigames] = useState<Minigame[]>([]);
  const [search, setSearch] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isRecycleBinMode, setIsRecycleBinMode] = useState(false);
  const [selectedMinigameId, setSelectedMinigameId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();
  const templates = [
    { label: "All Templates", value: "", icon: "🎯" },
    { label: "Conjunction", value: "TP1", icon: "🔗" },
    { label: "Quiz", value: "TP2", icon: "❓" },
    { label: "Anagram", value: "TP3", icon: "🔤" },
    { label: "Random Card", value: "TP4", icon: "🎴" },
    { label: "Spelling", value: "TP5", icon: "✏️" },
    { label: "Flash Card", value: "TP6", icon: "💡" },
    { label: "Completion", value: "TP7", icon: "✅" },
    { label: "Pairing", value: "TP8", icon: "🤝" },
    { label: "Restoration", value: "TP9", icon: "🔄" },
    { label: "Find Word", value: "TP10", icon: "🔍" },
    { label: "True/False", value: "TP11", icon: "⚖️" },
    { label: "Crossword", value: "TP12", icon: "🧩" },
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
          setTotalPages(result.totalPages ?? 1);
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
    if (isRecycleBinMode) {
      setSelectedMinigameId(minigameId === selectedMinigameId ? null : minigameId);
    } else {
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
        case "TP4":
          navigate(`/teacher/random-card-review/${minigameId}`);
          break;
        case "TP5":
          navigate(`/teacher/spelling-review/${minigameId}`);
          break;  
        case "TP6":
          navigate(`/teacher/flashcard-review/${minigameId}`);
          break; 
        case "TP7":
          navigate(`/teacher/completion-review/${minigameId}`);
          break;
        case "TP8":
          navigate(`/teacher/pairing-review/${minigameId}`);
          break;
        case "TP9":
          navigate(`/teacher/restoration-review/${minigameId}`);
          break;
        case "TP10":
          navigate(`/teacher/find-word-review/${minigameId}`);
          break;  
        case"TP11":
          navigate(`/teacher/true-false-review/${minigameId}`);
          break;   
        case "TP12":
          navigate(`/teacher/crossword-review/${minigameId}`);
          break;   
        default:
          break;
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPageNum(1);
  };

  const handlePrevPage = () => {
    if (pageNum > 1) setPageNum(pageNum - 1);
  };

  const handleNextPage = () => {
    if (pageNum < totalPages) setPageNum(pageNum + 1);
  };

  const handleRecycleBinToggle = () => {
    setIsRecycleBinMode(!isRecycleBinMode);
    setSelectedMinigameId(null);
  };

  const handleDeleteMinigame = async () => {
    if (!selectedMinigameId) {
      toast("Please select a minigame to delete.");
      return;
    }

    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMinigameId) return;

    try {
      setLoading(true);
      const result = await deleteMinigame(selectedMinigameId);
      if (result) {
        setMinigames(minigames.filter((game) => game.minigameId !== selectedMinigameId));
        setSelectedMinigameId(null);
        setShowDeleteModal(false);
        // Success notification can be added here
      } else {
        toast.error("Failed to delete minigame.");
      }
    } catch (error) {
      console.error("Error deleting minigame:", error);
      toast.error("An error occurred while deleting the minigame.");
    } finally {
      setLoading(false);
    }
  };

  const getTemplateIcon = (templateId: string) => {
    const template = templates.find(t => t.value === templateId);
    return template?.icon || "🎯";
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🎮</div>
      <h3 className="text-xl font-semibold text-gray-600 mb-2">No activities found</h3>
      <p className="text-gray-500">Create your first activity to get started!</p>
    </div>
  );

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 rounded-full p-3 mr-3">
            <FaTrash className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Activity</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this activity? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Activities</h1>
            <p className="text-gray-600">Manage and organize your educational activities</p>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRecycleBinToggle}
                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors shadow-sm ${
                    isRecycleBinMode 
                      ? "bg-red-100 text-red-700 border border-red-200" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaTrash className="mr-2" />
                  {isRecycleBinMode ? "Exit Delete Mode" : "Delete Mode"}
                </button>
                {isRecycleBinMode && (
                  <button
                    onClick={handleDeleteMinigame}
                    disabled={!selectedMinigameId}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTrash className="mr-2" />
                    Delete Selected
                  </button>
                )}
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <FaGrin />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <FaList />
                  </button>
                </div>

                {/* Template Filter */}
                <div className="relative">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value);
                      setPageNum(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
                  >
                    {templates.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.icon} {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={search}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[250px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
            {loading ? (
              <LoadingSpinner />
            ) : minigames.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                    {minigames.map((game) => {
                      const thumbnail = `${baseImageUrl}${game.thumbnailImage?.trim().replace(/^\/+/, "")}`;
                      const isSelected = selectedMinigameId === game.minigameId;
                      
                      return (
                        <div
                          key={game.minigameId}
                          className={`group relative bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                            isSelected 
                              ? "border-red-500 shadow-lg transform scale-105" 
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                          onClick={() => handleMinigameClick(game.minigameId, game.templateId)}
                        >
                          {/* Thumbnail */}
                          <div className="relative overflow-hidden rounded-t-lg">
                            <img
                              src={`${thumbnail}?t=${Date.now()}`}
                              alt={game.minigameName}
                              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {!isRecycleBinMode && (
                                  <button className="bg-white rounded-full p-2 mx-1 hover:bg-gray-100 transition-colors">
                                    <FaEye className="text-gray-600" />
                                  </button>
                                )}
                              </div>
                            </div>
                            {/* Template Badge */}
                            <div className="absolute top-2 left-2 bg-white rounded-full px-2 py-1 text-xs font-medium shadow-sm">
                              {getTemplateIcon(game.templateId)}
                            </div>
                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                                <FaTrash className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                              {game.minigameName}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {game.templateName}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-xs text-gray-500">
                                <FaLock className="mr-1" />
                                Private
                              </div>
                              <div className="text-xs text-gray-400">
                                {/* Add creation date if available */}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {minigames.map((game) => {
                      const thumbnail = `${baseImageUrl}${game.thumbnailImage?.trim().replace(/^\/+/, "")}`;
                      const isSelected = selectedMinigameId === game.minigameId;
                      
                      return (
                        <div
                          key={game.minigameId}
                          className={`flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                            isSelected ? "bg-red-50 border-l-4 border-red-500" : ""
                          }`}
                          onClick={() => handleMinigameClick(game.minigameId, game.templateId)}
                        >
                          <img
                            src={`${thumbnail}?t=${Date.now()}`}
                            alt={game.minigameName}
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{game.minigameName}</h3>
                            <p className="text-sm text-gray-600">{game.templateName}</p>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <FaLock className="mr-1" />
                            Private
                          </div>
                          {isSelected && (
                            <div className="ml-4 text-red-500">
                              <FaTrash />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 p-6 border-t border-gray-200">
                    <button
                      onClick={handlePrevPage}
                      disabled={pageNum === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= pageNum - 1 && page <= pageNum + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setPageNum(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                page === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (page === pageNum - 2 || page === pageNum + 2) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={pageNum === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && <DeleteModal />}
      </div>
    </>
  );
};

export default TeacherActivities;