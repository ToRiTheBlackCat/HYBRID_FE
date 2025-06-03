import React, { useState, useEffect } from "react";
import BG from "../assets/mentor.jpg";
import Header from "../components/HomePage/Header";
import { fetchCourseList, fetchCourseDetail } from "../services/userService";

interface Course {
  courseId: string;
  courseName: string;
  levelId: string;
  levelName: string;
  dataText?: string; // Added for thumbnail data
}

const CoursePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchCourseName, setSearchCourseName] = useState<string>("");
  const [searchLevelId, setSearchLevelId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1); // Will calculate based on total courses
  const [loading, setLoading] = useState<boolean>(true);
  // const [courseId, setCourseId] = useState<string>("");

  // Assume a page size (adjust based on your API)
  const pageSize = 3;

  // Base URL for images
  const baseImageUrl = "images/";

  // Function to extract thumbnail from dataText
  const extractThumbnail = (dataText?: string): string => {
  if (!dataText) return "/placeholder-image.jpg"; // Fallback nếu không có dataText

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(dataText, "text/xml");
    const thumbnailElement = xmlDoc.querySelector("thumbnail");
    const thumbnailPath = thumbnailElement?.textContent;
    if (thumbnailPath) {
      // Ghép baseImageUrl và loại bỏ dấu / đầu tiên nếu có
      const fullThumbnailUrl = `${baseImageUrl}${thumbnailPath.startsWith("/") ? thumbnailPath.slice(1) : thumbnailPath}`;
      console.log("Thumbnail URL:", fullThumbnailUrl); // Kiểm tra URL thumbnail
      return fullThumbnailUrl;
    }
    return "/placeholder-image.jpg"; // Fallback nếu không tìm thấy thumbnail
  } catch (error) {
    console.error("Error parsing thumbnail:", error);
    return "/placeholder-image.jpg"; // Fallback nếu lỗi
  }
};

  // Fetch courses and their details
  useEffect(() => {
    const fetchCoursesWithDetails = async () => {
      setLoading(true);
      try {
        const initialCourses = await fetchCourseList(searchCourseName, searchLevelId, currentPage);
        console.log("Initial courses fetched:", initialCourses); // Debug log
        // setCourseId(initialCourses.courseId); // Set courseId from the first course
        const detailedCourses = await Promise.all(
          initialCourses.map(async (course: Course) => {
            const detail = await fetchCourseDetail(course.courseId);
            console.log(detail) // ✅ dùng đúng courseId
            return { ...course, dataText: detail.dataText };
          })
        );
        setCourses(detailedCourses);

        // Simulate total pages calculation (replace with actual API data)
        // Assume totalCourses is known (e.g., 10 courses total for this example)
        const totalCourses = 10; // In a real app, this should come from the API
        const calculatedTotalPages = Math.ceil(totalCourses / pageSize);
        setTotalPages(calculatedTotalPages);
      } catch (error) {
        console.error("Error fetching courses or details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoursesWithDetails();
  }, [searchCourseName, searchLevelId, currentPage]);

  const CourseCard = ({
    courseName,
    levelName,
    dataText,
  }: {
    courseName: string;
    levelName: string;
    dataText?: string;
  }) => (
    <div className="bg-pink-50 p-4 rounded-xl shadow-md text-center w-[200px]">
      <img
        src={extractThumbnail(dataText)}
        alt={`${courseName} thumbnail`}
        className="w-full h-[120px] object-cover rounded-md mb-2"
        onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")} // Fallback on error
      />
      <h3 className="text-lg font-semibold">{courseName}</h3>
      <p className="text-sm text-gray-500">{levelName}</p>
    </div>
  );

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <>
      <Header />
      <div className="font-sans">
        {/* SearchBar section */}
        <div
          className="relative bg-cover bg-center h-[650px] flex items-center justify-center"
          style={{ backgroundImage: `url(${BG})` }}
        >
          <div className="absolute top-1/4 text-white text-xl font-semibold">text</div>
          <div className="absolute top-1/3 text-white text-3xl font-bold">text</div>
          <div className="flex bg-white rounded-md overflow-hidden mt-40 shadow-md">
            <select
              className="px-4 py-2 border-r border-gray-300 text-gray-600"
              value={searchLevelId}
              onChange={(e) => setSearchLevelId(e.target.value)}
            >
              <option value="">Level</option>
              <option value="1">Beginner</option>
              <option value="2">Intermediate</option>
              <option value="3">Flyers</option>
            </select>
            <input
              type="text"
              placeholder="Keyword"
              className="px-4 py-2 outline-none"
              value={searchCourseName}
              onChange={(e) => setSearchCourseName(e.target.value)}
            />
            <button
              className="bg-red-500 text-white px-6 py-2"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {/* Popular courses section */}
        <div className="py-10 px-4">
          <h2 className="text-2xl font-bold mb-4 text-center">Popular courses</h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading courses...</div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {courses.map((course, index) => (
                  <CourseCard
                    key={index}
                    courseName={course.courseName}
                    levelName={course.levelName}
                    dataText={course.dataText}
                  />
                ))}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Previous
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursePage;