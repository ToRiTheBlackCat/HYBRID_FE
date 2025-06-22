import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourseDetail } from "../../services/userService";
import { fetchCourseMinigame, fetchMinigameScore } from "../../services/authService";
import { Course, Minigame } from "../../types/index";
import Header from "../../components/HomePage/Header";
import Footer from "../../components/HomePage/Footer";
import ImageModal from "../../components/common/ImageModal";
import { baseImageUrl } from "../../config/base";

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
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course>();
  const [minigames, setMinigames] = useState<Minigame[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [templateFilter, setTemplateFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const parseCourseImages = (dataText: string) => {
    const sanitized = dataText.replace(/&(?!amp;)/g, "&amp;");
    const xml = new DOMParser().parseFromString(sanitized, "text/xml");
    const thumbnail = xml.querySelector("thumbnail")?.textContent?.trim() || "";
    const images = Array.from(xml.querySelectorAll("images img")).map((n) => n.textContent?.trim() || "");
    return { thumbnail, images };
  };

  const handleMinigameClick = (templateId: string, minigameId: string) => {
    const pathMap: Record<string, string> = {
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
    const path = pathMap[templateId];
    if (path) navigate(`/student/${path}/${minigameId}`);
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

  if (!course) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  const thumbnailUrl = `${baseImageUrl}${course.thumbnail?.replace(/^\/+/g, "")}`;
  const imageUrls = (course.images ?? []).map((img) => `${baseImageUrl}${img.replace(/^\/+/g, "")}`);
  const visibleImages = imageUrls.slice(carouselIndex, carouselIndex + 4);

  return (
    <>
      <Header />
      <div className="mt-24 mb-20 p-6 max-w-6xl mx-auto">
        <div className="bg-blue-50 p-6 rounded-lg mb-10 flex flex-col md:flex-row gap-6">
          <img src={thumbnailUrl} alt="thumbnail" className="w-80 h-80 object-cover rounded-lg shadow" />
          <div>
            <h2 className="text-xl font-bold mb-2">{course.courseName}</h2>
            <p className="text-lg mb-4">Level: {course.levelName}</p>
            <div className="flex gap-2 items-center">
              <button disabled={carouselIndex === 0} onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))} className="px-2">←</button>
              {visibleImages.map((url, i) => (
                <img key={i} src={url} alt="course" className="w-24 h-24 rounded cursor-pointer" onClick={() => setSelectedImageIndex(carouselIndex + i)} />
              ))}
              <button disabled={carouselIndex + 4 >= imageUrls.length} onClick={() => setCarouselIndex((i) => (i + 4 < imageUrls.length ? i + 1 : i))} className="px-2">→</button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <select value={templateFilter} onChange={(e) => { setTemplateFilter(e.target.value); setPageNum(1); }} className="border px-3 py-2 rounded">
            {TEMPLATE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
          <input value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setPageNum(1)} placeholder="Minigame name…" className="border px-3 py-2 rounded flex-1 min-w-[200px]" />
          <button onClick={() => setPageNum(1)} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
        </div>

        {minigames.length === 0 ? (
          <p>No minigames found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {minigames.map((g) => (
              <div key={g.minigameId} onClick={() => handleMinigameClick(g.templateId, g.minigameId)} className="bg-pink-100 rounded-lg p-4 shadow cursor-pointer hover:shadow-lg transition">
                <img src={`${baseImageUrl}${g.thumbnailImage.replace(/^\/+/g, "")}`} alt={g.minigameName} className="w-full h-40 object-cover rounded mb-3" />
                <h4 className="font-bold truncate">{g.minigameName}</h4>
                <p className="text-sm">Author: {g.teacherName}</p>
                <p className="text-sm">Type: {g.templateName}</p>
                <div className="flex justify-between text-sm mt-2">
                  <span>⭐ {g.ratingScore ?? "N/A"}</span>
                  <span>👥 {g.participantsCount ?? 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            <button disabled={pageNum === 1} onClick={() => setPageNum((p) => p - 1)} className="px-4 py-1 border rounded">Prev</button>
            <span>Page {pageNum} / {totalPages}</span>
            <button disabled={pageNum === totalPages} onClick={() => setPageNum((p) => p + 1)} className="px-4 py-1 border rounded">Next</button>
          </div>
        )}
      </div>

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
