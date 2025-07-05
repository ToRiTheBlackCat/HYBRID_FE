import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCourseDetail } from "../../services/userService";
import { fetchCourseMinigame, fetchMinigameScore } from "../../services/authService";
import { Course, Minigame } from "../../types/index";
import Header from "../../components/HomePage/Header";
import Footer from "../../components/HomePage/Footer";
import ImageModal from "../../components/common/ImageModal";
import { baseImageUrl } from "../../config/base";
import TemplatePage from "../TemplatePage";
import TemplateModal from "../../components/common/TemplateModal";

const TEMPLATE_OPTIONS = [
  { id: "", name: "All Types" },
  { id: "TP1", name: "Conjunction" },
  { id: "TP2", name: "Quiz" },
  { id: "TP3", name: "Anagram" },
  { id: "TP4", name: "Random Card" },
  { id: "TP5", name: "Spelling" },
  { id: "TP6", name: "Flash Card" },
  { id: "TP7", name: "Completion" },
  { id: "TP8", name: "Pairing" },
  { id: "TP9", name: "Restoration" },
  { id: "TP10", name: "Find Word" },
  { id: "TP11", name: "True/False" },
  { id: "TP12", name: "Crossword" },
];

const PAGE_SIZE = 6;

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course>();
  const [minigames, setMinigames] = useState<Minigame[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [templateFilter, setTemplateFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const parseCourseImages = (dataText: string) => {
    const sanitized = dataText.replace(/&(?!amp;)/g, "&amp;");
    const xml = new DOMParser().parseFromString(sanitized, "text/xml");
    const thumbnail = xml.querySelector("thumbnail")?.textContent?.trim() || "";
    const images = Array.from(xml.querySelectorAll("images img")).map((n) => n.textContent?.trim() || "");
    return { thumbnail, images };
  };


  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      const detail = await fetchCourseDetail(courseId);
      const { thumbnail, images } = parseCourseImages(detail.dataText || "");
      setCourse({ ...detail, thumbnail, images });
    };
    load();
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      const res = await fetchCourseMinigame(courseId, {
        TemplateId: templateFilter || undefined,
        MinigameName: nameFilter || undefined,
        PageNum: pageNum,
        PageSize: PAGE_SIZE,
      });
      const mgWithScore = await Promise.all(
        res.minigames.map(async (g: { minigameId: string; }) => {
          const s = await fetchMinigameScore(g.minigameId);
          return { ...g, ratingScore: s?.ratingScore ?? null };
        })
      );
      setMinigames(mgWithScore);
      setTotalPages(res.totalPages || 1);
      if (res.pageNum !== undefined && res.pageNum !== pageNum) setPageNum(res.pageNum);
    };
    load();
  }, [courseId, templateFilter, nameFilter, pageNum]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading course details...</p>
        </div>
      </div>
    );
  }

  const thumbnailUrl = `${baseImageUrl}${course.thumbnail?.replace(/^\/+/g, "")}`;
  const imageUrls = (course.images ?? []).map((img) => `${baseImageUrl}${img.replace(/^\/+/g, "")}`);
  const visibleImages = imageUrls.slice(carouselIndex, carouselIndex + 4);

  const getTemplateColor = (templateName: string) => {
    const colors: Record<string, string> = {
      "Quiz": "bg-gradient-to-br from-purple-500 to-purple-600",
      "Anagram": "bg-gradient-to-br from-green-500 to-green-600",
      "Spelling": "bg-gradient-to-br from-blue-500 to-blue-600",
      "Flash Card": "bg-gradient-to-br from-yellow-500 to-orange-500",
      "True/False": "bg-gradient-to-br from-red-500 to-red-600",
      "Crossword": "bg-gradient-to-br from-indigo-500 to-indigo-600",
    };
    return colors[templateName] || "bg-gradient-to-br from-gray-500 to-gray-600";
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
          {/* Course Header Section */}
          <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 h-2"></div>
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-shrink-0">
                  <div className="relative group">
                    <img 
                      src={thumbnailUrl} 
                      alt="Course thumbnail" 
                      className="w-80 h-80 object-cover rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">{course.courseName}</h1>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        📚 Level: {course.levelName}
                      </span>
                    </div>
                  </div>

                  {/* Image Carousel */}
                  {imageUrls.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">Course Gallery</h3>
                      <div className="flex gap-3 items-center">
                        <button 
                          disabled={carouselIndex === 0} 
                          onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))} 
                          className="p-2 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-50"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <div className="flex gap-2 flex-1">
                          {visibleImages.map((url, i) => (
                            <img 
                              key={i} 
                              src={url} 
                              alt={`Course image ${i + 1}`} 
                              className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105" 
                              onClick={() => setSelectedImageIndex(carouselIndex + i)} 
                            />
                          ))}
                        </div>
                        
                        <button 
                          disabled={carouselIndex + 4 >= imageUrls.length} 
                          onClick={() => setCarouselIndex((i) => (i + 4 < imageUrls.length ? i + 1 : i))} 
                          className="p-2 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-50"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Minigame
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🎮 Minigames
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {minigames.length} available
              </span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
                <select 
                  value={templateFilter} 
                  onChange={(e) => { setTemplateFilter(e.target.value); setPageNum(1); }} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {TEMPLATE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
                <div className="flex gap-2">
                  <input 
                    value={nameFilter} 
                    onChange={(e) => setNameFilter(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && setPageNum(1)} 
                    placeholder="Enter minigame name..." 
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button 
                    onClick={() => setPageNum(1)} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Minigames Grid */}
          {minigames.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No minigames found</h3>
              <p className="text-gray-600">Try adjusting your filters or create a new minigame to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {minigames.map((game) => (
                <div 
                  key={game.minigameId} 
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                >
                  <div className="relative">
                    <img 
                      src={`${baseImageUrl}${game.thumbnailImage.replace(/^\/+/g, "")}`} 
                      alt={game.minigameName} 
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`${getTemplateColor(game.templateName)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                        {game.templateName}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {game.minigameName}
                    </h4>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {game.teacherName}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {game.ratingScore ?? "N/A"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">
                          {game.participantsCount ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button 
                disabled={pageNum === 1} 
                onClick={() => setPageNum((p) => p - 1)} 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                  {pageNum}
                </span>
                <span className="text-gray-500">of</span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                  {totalPages}
                </span>
              </div>
              
              <button 
                disabled={pageNum === totalPages} 
                onClick={() => setPageNum((p) => p + 1)} 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showTemplateModal && (
        <TemplateModal onClose={() => setShowTemplateModal(false)}>
          <TemplatePage courseId={courseId ?? ""} />
        </TemplateModal>
      )}

      {selectedImageIndex !== null && (
        <ImageModal
          imageUrls={imageUrls}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
          onNext={() => setSelectedImageIndex((i) => (i !== null && i < imageUrls.length - 1 ? i + 1 : i))}
          onPrev={() => setSelectedImageIndex((i) => (i !== null && i > 0 ? i - 1 : i))}
        />
      )}
      <Footer />
    </>
  );
};

export default CourseDetail;