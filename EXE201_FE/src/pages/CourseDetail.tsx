import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseDetail } from "../services/userService";
import { fetchCourseMinigame, fetchMinigameScore } from "../services/authService";
import { Course, Minigame } from "../types/index";
import Header from "../components/HomePage/Header";
import Footer from "../components/HomePage/Footer";
import ImageModal from "../components/common/ImageModal";
import { baseImageUrl } from "../config/base";

const templateOptions = [
  { id: "TP1", name: "Conjunction" },
  { id: "TP10", name: "Find Word" },
  { id: "TP11", name: "True/False" },
  { id: "TP12", name: "Crossword" },
  { id: "TP2", name: "Quiz" },
  { id: "TP3", name: "Anagram" },
  { id: "TP4", name: "Random Card" },
  { id: "TP5", name: "Spelling" },
  { id: "TP6", name: "Flash Card" },
  { id: "TP7", name: "Completion" },
  { id: "TP8", name: "Pairing" },
  { id: "TP9", name: "Restoration" },
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadCourse = async () => {
    if (!courseId) return;
    const detail = await fetchCourseDetail(courseId);
    const { thumbnail, images } = parseCourseImages(detail.dataText || "");
    setCourse({ ...detail, thumbnail, images });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadMinigames = async () => {
    if (!courseId) return;
    const res = await fetchCourseMinigame(courseId, {
      TemplateId: templateFilter || undefined,
      MinigameName: nameFilter || undefined,
      PageNum: pageNum,
      PageSize: PAGE_SIZE,
    });

    const gamesWithScores = await Promise.all(
      res.minigames.map(async (game: Minigame) => {
        const scoreData = await fetchMinigameScore(game.minigameId);
        return { ...game, ratingScore: scoreData?.ratingScore ?? null };
      })
    );

    setMinigames(gamesWithScores);
    setTotalPages(res.totalPages);
  };

  useEffect(() => { loadCourse(); }, [courseId, loadCourse]);
  useEffect(() => { loadMinigames(); }, [courseId, templateFilter, nameFilter, pageNum, loadMinigames]);

  if (!course) return <div>Loading...</div>;

  const fullThumbnailUrl = `${baseImageUrl}${course.thumbnail?.replace(/^\/\/+/, "")}`;
  const fullImageUrls = course.images?.map(img => `${baseImageUrl}${img.replace(/^\/\/+/, "")}`) ?? [];
  const visibleImages = fullImageUrls.slice(carouselIndex, carouselIndex + 4);

  return (
    <>
      <Header />
      <div className="mt-24 mb-20 p-6 max-w-5xl mx-auto">
        <div className="bg-blue-50 p-6 rounded-lg mb-10">
          <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row gap-6 items-center">
            <img src={fullThumbnailUrl} alt="Main thumbnail" className="w-full max-w-[320px] h-[320px] object-cover rounded-xl shadow-lg" />
            <div className="text-left">
              <h2 className="text-3xl font-bold text-blue-800 mb-2">{course.courseName}</h2>
              <p className="text-lg text-gray-700"><span className="font-semibold">Level:</span> {course.levelName}</p>
            </div>
          </div>

          <div className="flex gap-2 items-center justify-center mt-6">
            <button
              className="text-xl font-bold text-blue-600 hover:text-blue-800 transition"
              onClick={() => setCarouselIndex(c => Math.max(c - 1, 0))}>←</button>
            {visibleImages.map((url, i) => (
              <img key={i + carouselIndex} src={url} className="w-[150px] h-[150px] rounded-xl border-4 border-blue-200 hover:border-blue-500 transition-shadow duration-300 cursor-pointer shadow-sm hover:shadow-lg" onClick={() => setSelectedImageIndex(i + carouselIndex)} />
            ))}
            <button
              className="text-xl font-bold text-blue-600 hover:text-blue-800 transition"
              onClick={() => setCarouselIndex(c => Math.min(c + 1, fullImageUrls.length - 4))}>→</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <select
            value={templateFilter}
            onChange={(e) => { setTemplateFilter(e.target.value); setPageNum(1); }}
            className="border border-blue-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Templates</option>
            {templateOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setPageNum(1)}
            className="border border-blue-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => setPageNum(1)}
          >Search</button>
        </div>

        {/* Games */}
        <h3 className="text-2xl font-semibold mb-4">Here are some games to practice</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {minigames.map(game => (
            <div key={game.minigameId} className="bg-pink-100 rounded-lg p-4 shadow-md transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer" onClick={() => handleMinigameClick(game.templateId, game.minigameId)}>
              <img
                src={`${baseImageUrl}${game.thumbnailImage?.replace(/^\/\/+/, "")}`}
                alt={game.minigameName}
                className="rounded-md mb-3 w-full h-40 object-cover"
              />
              <h4 className="text-lg font-semibold text-blue-700 mb-1 line-clamp-2">{game.minigameName}</h4>
              <p className="text-sm text-gray-600">Author: {game.teacherName}</p>
              <p className="text-sm text-gray-600 mb-1">Type: {game.templateName}</p>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span>⭐ {game.ratingScore ?? "N/A"}</span>
                <span>👥 {game.participantsCount ?? "0"} participants</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-8 gap-3 text-sm">
          <button onClick={() => setPageNum(p => Math.max(p - 1, 1))} disabled={pageNum <= 1} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">Prev</button>
          <span className="px-4 py-1">Page {pageNum} of {totalPages}</span>
          <button onClick={() => setPageNum(p => Math.min(p + 1, totalPages))} disabled={pageNum >= totalPages} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">Next</button>
        </div>
      </div>

      {/* Modal */}
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