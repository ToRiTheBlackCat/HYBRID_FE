import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchCourseDetail } from "../services/userService";
import { fetchCourseMinigame } from "../services/authService";
import { Course, Minigame } from "../types/index";
import Header from "../components/HomePage/Header";
import Footer from "../components/HomePage/Footer";
import ImageModal from "../components/common/ImageModal";

const baseImageUrl =
  "https://hybridelearn-acdwdxa8dmh2fdgm.southeastasia-01.azurewebsites.net/images/";

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course>();
  const [minigames, setMinigames] = useState<Minigame[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const parseCourseImages = (dataText: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(dataText, "text/xml");

    const thumbnail = xmlDoc.querySelector("thumbnail")?.textContent?.trim() || "";
    const imgElements = xmlDoc.querySelectorAll("images img");
    const images = Array.from(imgElements).map(img => img.textContent?.trim() || "");

    return { thumbnail, images };
  };

  useEffect(() => {
    const load = async () => {
      if (!courseId) return;

      try {
        const detail = await fetchCourseDetail(courseId);
        const { thumbnail, images } = parseCourseImages(detail.dataText || "");

        setCourse({
          ...detail,
          thumbnail,
          images,
        });

        const gameResponse = await fetchCourseMinigame(courseId);
        if (Array.isArray(gameResponse.minigames)) {
          setMinigames(gameResponse.minigames);
        } else {
          console.warn("Invalid minigame data", gameResponse);
          setMinigames([]);
        }
      } catch (error) {
        console.error("Error loading course detail or minigames:", error);
      }
    };

    load();
  }, [courseId]);

  if (!course) return <div>Loading...</div>;

  const fullThumbnailUrl = `${baseImageUrl}${course.thumbnail?.replace(/^\/+/, "")}`;
  const fullImageUrls = course.images?.map(img =>
    `${baseImageUrl}${img.replace(/^\/+/, "")}`
  ) ?? [];

  // Carousel slice
  const visibleImages = fullImageUrls.slice(carouselIndex, carouselIndex + 4);

  const handleNextCarousel = () => {
    if (carouselIndex + 4 < fullImageUrls.length) {
      setCarouselIndex(carouselIndex + 1);
    }
  };

  const handlePrevCarousel = () => {
    if (carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1);
    }
  };

  return (
    <>
      <Header />
      <div className="mt-25 mb-20 p-6 max-w-5xl mx-auto">
        {/* Course Info */}
        <div className="bg-blue-50 p-6 rounded-lg mb-10">
          <div className="flex flex-row gap-6 justify-center items-start">
            {/* Thumbnail */}
            <img
              src={fullThumbnailUrl}
              alt="Main thumbnail"
              className="w-[320px] h-[320px] object-cover rounded-lg shadow"
            />

            {/* Course details */}
            <div className="flex flex-col justify-start mt-2">
              <p className="text-lg text-gray-800">
                <span className="font-bold">Course‘s name:</span> {course.courseName}
              </p>
              <p className="text-lg text-gray-800 mt-2">
                <span className="font-bold">Level:</span> {course.levelName}
              </p>
            </div>
          </div>

          {/* Carousel */}
          <div className="flex gap-2 items-center justify-center mt-6">
            <button
              className="text-2xl px-3 py-1 rounded hover:bg-gray-200"
              onClick={handlePrevCarousel}
              disabled={carouselIndex === 0}
            >
              ←
            </button>
            {visibleImages.map((url, i) => (
              <img
                key={i + carouselIndex}
                src={url}
                alt={`Thumbnail ${i + carouselIndex}`}
                className="w-30 h-30 rounded-md border cursor-pointer"
                onClick={() => setSelectedImageIndex(i + carouselIndex)}
              />
            ))}
            <button
              className="text-2xl px-3 py-1 rounded hover:bg-gray-200"
              onClick={handleNextCarousel}
              disabled={carouselIndex + 4 >= fullImageUrls.length}
            >
              →
            </button>
          </div>
        </div>

        {/* Games */}
        <h3 className="text-2xl font-semibold mb-4">Here are some games to practice</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {minigames.map(game => {
            const imageUrl = `${baseImageUrl}${game.thumbnailImage.replace(/^\/+/, "")}`;
            return (
              <div key={game.minigameId} className="bg-pink-100 rounded-lg p-4 shadow-md">
                <img
                  src={imageUrl}
                  alt={game.minigameName}
                  className="rounded-md mb-3 w-full h-40 object-cover"
                />
                <h4 className="text-lg font-bold">{game.minigameName}</h4>
                <p className="text-sm">Author: {game.teacherName}</p>
                <p className="text-sm">Type: {game.templateName}</p>
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span>⭐ {game.ratingScore ?? "N/A"}</span>
                  <span>👥 {game.participantsCount ?? "0"} participants</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {selectedImageIndex !== null && (
        <ImageModal
          imageUrls={fullImageUrls}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
          onNext={() =>
            setSelectedImageIndex(prev =>
              prev !== null && prev < fullImageUrls.length - 1 ? prev + 1 : prev
            )
          }
          onPrev={() =>
            setSelectedImageIndex(prev =>
              prev !== null && prev > 0 ? prev - 1 : prev
            )
          }
        />
      )}

      <Footer />
    </>
  );
};

export default CourseDetail;
