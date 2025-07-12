import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseDetail } from "../services/userService";
import { fetchCourseMinigame, fetchMinigameScore, fetchUserProfile } from "../services/authService";
import { Course, Minigame, Profile } from "../types/index";
import Header from "../components/HomePage/Header";
import Footer from "../components/HomePage/Footer";
import ImageModal from "../components/common/ImageModal";
import { baseImageUrl } from "../config/base";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const templateOptions = [
  { id: "TP1", name: "Conjunction", icon: "🔗", color: "from-blue-500 to-indigo-500" },
  { id: "TP10", name: "Find Word", icon: "🔍", color: "from-green-500 to-emerald-500" },
  { id: "TP11", name: "True/False", icon: "✅", color: "from-red-500 to-pink-500" },
  { id: "TP12", name: "Crossword", icon: "🧩", color: "from-purple-500 to-violet-500" },
  { id: "TP2", name: "Quiz", icon: "❓", color: "from-yellow-500 to-orange-500" },
  { id: "TP3", name: "Anagram", icon: "🔤", color: "from-teal-500 to-cyan-500" },
  { id: "TP4", name: "Random Card", icon: "🎴", color: "from-rose-500 to-pink-500" },
  { id: "TP5", name: "Spelling", icon: "📝", color: "from-indigo-500 to-purple-500" },
  { id: "TP6", name: "Flash Card", icon: "⚡", color: "from-amber-500 to-yellow-500" },
  { id: "TP7", name: "Completion", icon: "✏️", color: "from-lime-500 to-green-500" },
  { id: "TP8", name: "Pairing", icon: "🤝", color: "from-pink-500 to-rose-500" },
  { id: "TP9", name: "Restoration", icon: "🔧", color: "from-slate-500 to-gray-500" },
];

const PAGE_SIZE = 6;

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course>();
  const [minigames, setMinigames] = useState<Minigame[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const userId = useSelector((state: RootState) => state.user.userId);
  const isTeacher = useSelector((state: RootState) => state.user.roleId === "3");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [templateFilter, setTemplateFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState<Profile | null>(null);
  const navigate = useNavigate();

  const parseCourseImages = (dataText: string) => {
    const sanitizedDataText = dataText.replace(/&(?!amp;)/g, "&amp;");
    const xmlDoc = new DOMParser().parseFromString(sanitizedDataText, "text/xml");
    const thumbnail = xmlDoc.querySelector("thumbnail")?.textContent?.trim() || "";
    const imgElements = xmlDoc.querySelectorAll("images img");
    const images = Array.from(imgElements).map(img => img.textContent?.trim() || "");
    return { thumbnail, images };
  };

  const handleMinigameClick = (templateId: string, minigameId: string) => {
    const paths: Record<string, string> = {
      TP1: "conjunction",
      TP2: "quiz",
      TP3: "anagram",
      TP4: "random-card",
      TP5: "spelling",
      TP6: "flashcard",
      TP7: "completion",
      TP8: "pairing",
      TP9: "restoration",
      TP10: "find-word",
      TP11: "true-false",
      TP12: "crossword",
    };
    if (paths[templateId]) navigate(`/student/${paths[templateId]}/${minigameId}`, { state: { courseId: courseId } });
  };

  const getTemplateInfo = (templateId: string) => {
    return templateOptions.find(opt => opt.id === templateId) || { icon: "🎮", color: "from-gray-500 to-slate-500" };
  };

  const fetchUserTier = useCallback(async () => {
    try {
      const response = await fetchUserProfile(userId, isTeacher);
      if (response) {
        setUser(response);
        return response; // Return để có thể dùng ngay
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, [userId, isTeacher]);

  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      const detail = await fetchCourseDetail(courseId);
      const { thumbnail, images } = parseCourseImages(detail.dataText || "");
      setCourse({ ...detail, thumbnail, images });
    } catch (error) {
      console.error("Error loading course:", error);
    }
  }, [courseId]);

  const loadMinigames = useCallback(async () => {
    if (!courseId) return;
    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await fetchUserTier();
      }
      const res = await fetchCourseMinigame(courseId, {
        TemplateId: templateFilter || undefined,
        MinigameName: nameFilter || undefined,
        PageNum: pageNum,
        PageSize: PAGE_SIZE,
      });
      let filteredMinigames = res.minigames;
      const allowedTemplateIds = ["TP1", "TP2", "TP4"];
      if (user?.tierName === "Free") {
        filteredMinigames = res.minigames.filter((game: Minigame) =>
          allowedTemplateIds.includes(game.templateId)
        );
      }
      console.log("Filtered Minigames:", filteredMinigames);

      const gamesWithScores = await Promise.all(
        filteredMinigames.map(async (game: Minigame) => {
          const scoreData = await fetchMinigameScore(game.minigameId);
          return { ...game, ratingScore: scoreData?.ratingScore ?? null };
        })
      );

      setMinigames(gamesWithScores);
      const total = filteredMinigames.length;
      setTotalPages(total);
    } catch (error) {
      console.error("Error loading minigames:", error);
    }
  }, [courseId, user, templateFilter, nameFilter, pageNum, fetchUserTier]);

  useEffect(() => {
    const initializePage = async () => {
      await fetchUserTier(); // Load user trước
      loadCourse(); // Load course
    };
    initializePage();
  }, [fetchUserTier, loadCourse]);

  // Load minigames sau khi user đã được load
  useEffect(() => {
    if (user) { // Chỉ load minigames khi đã có user info
      loadMinigames();
    }
  }, [loadMinigames, user]);


  if (!course) return <div>Course not found</div>;

  const fullThumbnailUrl = `${baseImageUrl}${course.thumbnail?.replace(/^\/\/+/, "")}`;
  const fullImageUrls = course.images?.map(img => `${baseImageUrl}${img.replace(/^\/\/+/, "")}`) ?? [];
  const visibleImages = fullImageUrls.slice(carouselIndex, carouselIndex + 4);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Course Header */}
          <div className="relative bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-600 rounded-3xl shadow-2xl overflow-hidden mb-12">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="relative group">
                  <img
                    src={`${fullThumbnailUrl}?t=${Date.now()}`}
                    alt="Course thumbnail"
                    className="w-80 h-80 object-cover rounded-2xl shadow-2xl border-4 border-white/20
                              group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
                </div>

                <div className="text-center lg:text-left text-white">
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                    {course.courseName}
                  </h1>
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-lg font-semibold">
                      📚 Level: {course.levelName}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                    <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      🎮 {minigames.length} Games
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      🖼️ {fullImageUrls.length} Images
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          {fullImageUrls.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                📸 Course Gallery
              </h2>
              <div className="flex items-center justify-center gap-4">
                <button
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full
                            hover:from-purple-600 hover:to-pink-600 transition-all duration-300
                            shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCarouselIndex(c => Math.max(c - 1, 0))}
                  disabled={carouselIndex === 0}
                >
                  ←
                </button>

                <div className="flex gap-4 overflow-hidden">
                  {visibleImages.map((url, i) => (
                    <img
                      key={i + carouselIndex}
                      src={url}
                      className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl object-cover cursor-pointer
                                border-4 border-purple-200 hover:border-purple-500 
                                transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      onClick={() => setSelectedImageIndex(i + carouselIndex)}
                    />
                  ))}
                </div>

                <button
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full
                            hover:from-purple-600 hover:to-pink-600 transition-all duration-300
                            shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCarouselIndex(c => Math.min(c + 1, fullImageUrls.length - 4))}
                  disabled={carouselIndex >= fullImageUrls.length - 4}
                >
                  →
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 Filter Games</h3>
            <div className="flex flex-wrap gap-4">
              <select
                value={templateFilter}
                onChange={(e) => { setTemplateFilter(e.target.value); setPageNum(1); }}
                className="flex-1 min-w-[200px] border-2 border-purple-200 px-4 py-3 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                          bg-gradient-to-r from-purple-50 to-pink-50"
              >
                <option value="">🎮 All Game Types</option>
                {templateOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.icon} {opt.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="🔍 Search games by name..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPageNum(1)}
                className="flex-1 min-w-[200px] border-2 border-purple-200 px-4 py-3 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                          bg-gradient-to-r from-purple-50 to-pink-50"
              />

              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl
                          font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300
                          shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={() => setPageNum(1)}
              >
                Search
              </button>
            </div>
          </div>

          {user?.tierName === "Free" && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🎮</div>
                <div>
                  <h3 className="text-xl font-semibold text-amber-800 mb-2">
                    You're on the Free Plan
                  </h3>
                  <p className="text-amber-700 mb-3">
                    You have access to 3 game types: Conjunction, Quiz, and Random Card.
                    Upgrade to Premium to unlock all {templateOptions.length} game types!
                  </p>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300">
                    Upgrade to Premium ⭐
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Games Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                🎮 Practice Games
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
            </div>

            {minigames.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">No games found</h3>
                <p className="text-gray-500">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {minigames.map(game => {
                  const templateInfo = getTemplateInfo(game.templateId);
                  return (
                    <div
                      key={game.minigameId}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 cursor-pointer
                                transform transition-all duration-500 hover:scale-105 hover:-translate-y-2
                                border border-gray-100 overflow-hidden relative"
                      onClick={() => handleMinigameClick(game.templateId, game.minigameId)}
                    >
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${templateInfo.color} opacity-0 
                                      group-hover:opacity-10 transition-opacity duration-300`}></div>

                      {/* Template badge */}
                      <div className={`absolute top-4 right-4 bg-gradient-to-r ${templateInfo.color} 
                                      text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg z-10`}>
                        {templateInfo.icon}
                      </div>

                      <div className="relative z-10">
                        <img
                          src={`${baseImageUrl}${game.thumbnailImage?.replace(/^\/\/+/, "")}`}
                          alt={game.minigameName}
                          className="w-full h-48 object-cover rounded-xl mb-4 
                                    group-hover:scale-110 transition-transform duration-500"
                        />

                        <h4 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 
                                      group-hover:text-purple-600 transition-colors duration-300">
                          {game.minigameName}
                        </h4>

                        <div className="space-y-2 mb-4">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="font-semibold">👨‍🏫 Author:</span> {game.teacherName}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="font-semibold">🎯 Type:</span> {game.templateName}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="font-semibold text-gray-700">
                              {game.ratingScore ?? "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-blue-500">👥</span>
                            <span className="font-semibold text-gray-700">
                              {game.participantsCount ?? "0"}
                            </span>
                          </div>
                        </div>

                        {/* Play button */}
                        <button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                                          py-3 rounded-xl font-semibold opacity-0 group-hover:opacity-100 
                                          transform translate-y-2 group-hover:translate-y-0 
                                          transition-all duration-300">
                          🎮 Play Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-2">
                <button
                  onClick={() => setPageNum(p => Math.max(p - 1, 1))}
                  disabled={pageNum <= 1}
                  className="px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-xl
                            hover:bg-purple-600 hover:text-white transition-all duration-300
                            disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setPageNum(index + 1)}
                      className={`w-12 h-12 rounded-xl font-semibold transition-all duration-300 ${pageNum === index + 1
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-110"
                        : "bg-white text-purple-600 hover:bg-purple-100 border-2 border-purple-200"
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPageNum(p => Math.min(p + 1, totalPages))}
                  disabled={pageNum >= totalPages}
                  className="px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-xl
                            hover:bg-purple-600 hover:text-white transition-all duration-300
                            disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImageIndex !== null && (
        <ImageModal
          imageUrls={fullImageUrls}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
          onNext={() => setSelectedImageIndex(prev => (prev !== null && prev < fullImageUrls.length - 1 ? prev + 1 : prev))}
          onPrev={() => setSelectedImageIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
        />
      )}

      <Footer />
    </>
  );
};

export default CourseDetail;