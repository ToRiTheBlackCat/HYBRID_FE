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
      // Replace standalone '&' with '&amp;' to ensure valid XML
      const sanitizedDataText = dataText.replace(/&(?!amp;)/g, "&amp;");
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(sanitizedDataText, "text/xml");
      const thumbnailElement = xmlDoc.querySelector("thumbnail");
      const thumbnailPath = thumbnailElement?.textContent;
      if (thumbnailPath) {
        console.log("Extracted thumbnail path:", thumbnailPath);
        return `${baseImageUrl}${thumbnailPath.startsWith("/") ? thumbnailPath.slice(1) : thumbnailPath}`;
      } else {
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
        console.log(initialCourses);
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
    if (roleId === "3") {
      navigate(`/teacher/course/${courseId}`);
    } else if (roleId === "2") {
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
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl text-center 
                 cursor-pointer transform transition-all duration-500 ease-in-out
                 hover:scale-105 hover:-translate-y-3 border border-gray-100
                 overflow-hidden relative"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 to-purple-400/10 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
      
      {/* Image container */}
      <div className="relative overflow-hidden">
        <img
          src={encodeURI(thumbnail ?? "/placeholder-image.jpg")}
          alt={`${courseName} thumbnail`}
          className="w-full h-48 object-cover transition-transform duration-500 
                     group-hover:scale-110"
        />
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white 
                          px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            {levelName}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 relative z-20">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 
                       group-hover:text-purple-600 transition-colors duration-300">
          {courseName}
        </h3>
        <div className="flex items-center justify-center mt-4">
          <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white 
                            px-6 py-2 rounded-full font-medium text-sm
                            transform transition-all duration-300
                            group-hover:shadow-lg group-hover:scale-105
                            opacity-0 group-hover:opacity-100">
            View Course
          </button>
        </div>
      </div>
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

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
          <div className="bg-gray-300 h-48 rounded-xl mb-4"></div>
          <div className="bg-gray-300 h-6 rounded mb-2"></div>
          <div className="bg-gray-300 h-4 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );

  console.log("Fetched courses with details:", courses);
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Hero Section with Search */}
        <div
          className="relative bg-cover bg-center h-[500px] flex items-center justify-center"
          style={{ backgroundImage: `url(${BG})` }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
          
          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Discover Amazing Courses
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Find the perfect course to advance your skills and achieve your goals
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden 
                           shadow-2xl max-w-2xl mx-auto backdrop-blur-sm">
              <select
                className="flex-1 px-6 py-4 border-b md:border-b-0 md:border-r border-gray-200 
                          text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchLevelId}
                onChange={(e) => setSearchLevelId(e.target.value)}
              >
                <option value="">All Levels</option>
                <option value="1">Starter</option>
                <option value="2">Movers</option>
                <option value="3">Flyers</option>
              </select>
              <input
                type="text"
                placeholder="Search courses..."
                className="flex-1 px-6 py-4 outline-none focus:ring-2 focus:ring-purple-500"
                value={searchCourseName}
                onChange={(e) => setSearchCourseName(e.target.value)}
              />
              <button 
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white 
                          px-8 py-4 font-semibold hover:from-pink-600 hover:to-purple-600 
                          transition-all duration-300 transform hover:scale-105" 
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Popular Courses
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {courses.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-2xl font-semibold text-gray-600 mb-2">No courses found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-600 hover:text-white shadow-lg hover:shadow-xl"
                      }`}
                    >
                      ← Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`w-12 h-12 rounded-xl font-medium transition-all duration-300 ${
                            currentPage === index + 1
                              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                              : "bg-white text-gray-600 hover:bg-purple-100"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-600 hover:text-white shadow-lg hover:shadow-xl"
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursePage;