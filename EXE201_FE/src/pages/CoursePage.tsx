import React, { useState, useEffect } from "react";
import BG from "../assets/mentor.jpg";
import Header from "../components/HomePage/Header";
import { fetchCourseList, fetchCourseDetail } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { Course } from "../types/index";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { baseImageUrl } from "../config/base";


const CoursePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchCourseName, setSearchCourseName] = useState<string>("");
  const [searchLevelId, setSearchLevelId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const roleId = useSelector((state: RootState) => state.user.roleId);

  const pageSize = 3;

  const extractThumbnail = (dataText?: string): string => {
    if (!dataText) {
      console.warn("No dataText provided, returning placeholder image.");
      return "/placeholder-image.jpg";
    }
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(dataText, "text/xml");
      const thumbnailElement = xmlDoc.querySelector("thumbnail");
      const thumbnailPath = thumbnailElement?.textContent;
      if (thumbnailPath) {
        console.log("Extracted thumbnail path:", thumbnailPath);
        return `${baseImageUrl}${thumbnailPath.startsWith("/") ? thumbnailPath.slice(1) : thumbnailPath}`;
      }else{
        console.warn("No thumbnail found in dataText, returning placeholder image.");
        return "/placeholder-image.jpg";
      }
    } catch (error) {
      console.error("Error parsing thumbnail:", error);
      return "/placeholder-image.jpg";
    }
  };

  useEffect(() => {
    const fetchCoursesWithDetails = async () => {
      setLoading(true);
      try {
        const initialCourses = await fetchCourseList(searchCourseName, searchLevelId, currentPage);
        const detailedCourses = await Promise.all(
          initialCourses.map(async (course: Course) => {
            const detail = await fetchCourseDetail(course.courseId);
            const thumbnail = extractThumbnail(detail.dataText);
            return { ...course, dataText: detail.dataText, thumbnail };
          })
        );
        setCourses(detailedCourses);
        

        const totalCourses = 10; // Replace with actual value from API
        setTotalPages(Math.ceil(totalCourses / pageSize));
      } catch (error) {
        console.error("Error fetching courses or details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesWithDetails();
  }, [searchCourseName, searchLevelId, currentPage]);
  const handleCourseClick = (courseId: string) => {
    if(roleId === "3") {
      navigate(`/teacher/course/${courseId}`);
    }
    else if(roleId === "2") {
      navigate(`/student/course/${courseId}`);
    }
  };

  const CourseCard = ({
    courseName,
    levelName,
    thumbnail,
    onClick,
  }: {
    courseName: string;
    levelName: string;
    thumbnail?: string;
    onClick?: () => void;
  }) => (
    <div 
    onClick={onClick}
    className="bg-pink-50 p-4 rounded-xl shadow-md text-center w-[200px] h-[250px]">
      <img
        src={encodeURI(thumbnail ?? "/placeholder-image.jpg")}
        alt={`${courseName} thumbnail`}
        className="w-full h-[120px] object-cover rounded-md mb-2"
        // onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
      />
      <h3 className="text-lg font-semibold">{courseName}</h3>
      <p className="text-sm text-gray-500">{levelName}</p>
    </div>
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  console.log("Fetched courses with details:", courses);
  return (
    <>
      <Header />
      <div className="font-sans">
        {/* Search Bar */}
        <div
          className="relative bg-cover bg-center h-[650px] flex items-center justify-center"
          style={{ backgroundImage: `url(${BG})` }}
        >
          {/* <div className="absolute top-1/4 text-white text-xl font-semibold">Choose a course</div>
          <div className="absolute top-1/3 text-white text-3xl font-bold">text</div> */}
          <div className="flex bg-white rounded-md overflow-hidden mt-40 shadow-md">
            <select
              className="px-4 py-2 border-r border-gray-300 text-gray-600"
              value={searchLevelId}
              onChange={(e) => setSearchLevelId(e.target.value)}
            >
              <option value="">Level</option>
              <option value="1">Starter</option>
              <option value="2">Movers</option>
              <option value="3">Flyers</option>
            </select>
            <input
              type="text"
              placeholder="Keyword"
              className="px-4 py-2 outline-none"
              value={searchCourseName}
              onChange={(e) => setSearchCourseName(e.target.value)}
            />
            <button className="bg-red-500 text-white px-6 py-2" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        {/* Courses List */}
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
                    thumbnail={course.thumbnail}
                    onClick={() => handleCourseClick(course.courseId)}
                  />
                ))}
              </div>

              {/* Pagination */}
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
