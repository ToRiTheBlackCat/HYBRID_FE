import React, { useState, useEffect } from "react";
import AnimatedText from "../../components/hooks/AnimatedText";
import FadeInOnView from "../../components/hooks/FadeInOnView";

// import Anagram from "../../assets/TemplateLogo/Anagram.jpg";
// import Conjunction from "../../assets/TemplateLogo/Conjunction.jpg";
// import Crossword from "../../assets/TemplateLogo/Crossword.jpg";
// import DragDrop from "../../assets/TemplateLogo/DragDrop.jpg";
// import TrueFalse from "../../assets/TemplateLogo/TrueFalse.jpg";
// import SongPuzzle from "../../assets/TemplateLogo/SongPuzzle.jpg";
// import Pronunciation from "../../assets/TemplateLogo/Pronunciation.jpg";
// import { FaSearch } from "react-icons/fa";
import Header from "../../components/HomePage/Header";
import { fetchCourseList, fetchCourseDetail } from "../../services/userService";
import CourseCard from "../../components/common/CourseCard";
import { baseImageUrl } from "../../config/base";
import { useNavigate } from "react-router-dom";
import { Course } from "../../types";

const StudentPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const extractThumbnail = (dataText?: string): string => {
    if (!dataText) return "/placeholder-image.jpg";
    try {
      const sanitizedDataText = dataText.replace(/&(?!amp;)/g, "&amp;");
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(sanitizedDataText, "text/xml");
      const thumbnailElement = xmlDoc.querySelector("thumbnail");
      const path = thumbnailElement?.textContent;
      return path ? `${baseImageUrl}${path.startsWith("/") ? path.slice(1) : path}` : "/placeholder-image.jpg";
    } catch {
      return "/placeholder-image.jpg";
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const basicCourses = await fetchCourseList("", "", 1);
        const detailed = await Promise.all(
          basicCourses.map(async (course: { courseId: string; }) => {
            const detail = await fetchCourseDetail(course.courseId);
            const thumbnail = extractThumbnail(detail.dataText);
            return { ...course, thumbnail };
          })
        );
        setCourses(detailed);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (id: string) => navigate(`/student/course/${id}`);

  // const templates = [
  //   { name: "Conjunction", image: Conjunction },
  //   { name: "Anagram", image: Anagram },
  //   { name: "True or False", image: TrueFalse },
  //   { name: "Crossword", image: Crossword },
  //   { name: "Pronunciation", image: Pronunciation },
  //   { name: "Drag and Drop", image: DragDrop },
  //   { name: "Song Puzzle", image: SongPuzzle },
  // ];
  return (
    <>
      <Header />
      <section className="bg-white text-center mt-20 mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-10">
          <AnimatedText text="Let's explore our" />{" "}
          <span className="text-blue-600 text-7xl font-bold relative inline-block">
            <AnimatedText text="Courses" />
            <span className="absolute -top-2 -right-6 text-blue-400 text-xl">✨</span>
          </span>
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-10 text-gray-700">
          <div>
            <h3 className="font-bold text-lg mb-2">
              <AnimatedText text="Step 1:" />
            </h3>
            <p className="text-sm">
              <AnimatedText text="Search for a skill" />
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">
              <AnimatedText text="Step 2:" />
            </h3>
            <p className="text-sm">
              <AnimatedText text="Choose a course" />
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">
              <AnimatedText text="Step 3:" />
            </h3>
            <p className="text-sm">
              <AnimatedText text="Enjoy it" />
            </p>
          </div>
        </div>
      </section>
      <div className="w-full h-[80px] bg-gradient-to-r from-blue-400 to-white"></div>
      {/* Section Tìm kiếm và lọc */}
      {/* <FadeInOnView>
        <section className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="flex flex-col items-center gap-6 mt-10">
            <div className="w-full max-w-[500px]">
              <label className="text-gray-700 text-left block mb-2">Search By Course</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search course..."
                  className="w-full border rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
              </div>
            </div>

            <div className="text-center">
              <label className="text-gray-700 block mb-2">Search By Skill</label>
              <div className="flex flex-wrap justify-center gap-3">
                {["Reading", "Listening", "Writing", "Speaking"].map((skill) => (
                  <button
                    key={skill}
                    className="flex items-center justify-between border border-blue-500 text-blue-600 px-4 py-2 rounded-full min-w-[120px] hover:bg-blue-100"
                  >
                    <span>{skill}</span>
                    <FaSearch className="ml-2 text-blue-600 text-sm" />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <label className="text-gray-700 block mb-2">Sort By</label>
              <div className="flex flex-wrap justify-center gap-3">
                <select className="border rounded-full px-4 py-2 focus:outline-none">
                  <option>Newest</option>
                  <option>Oldest</option>
                </select>
                <select className="border rounded-full px-4 py-2 focus:outline-none">
                  <option>Free</option>
                  <option>Premium</option>
                </select>
                <select className="border rounded-full px-4 py-2 focus:outline-none">
                  <option>Popular</option>
                  <option>Less Popular</option>
                </select>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {templates.map((template) => (
              <div
                key={template.name}
                className="border rounded-xl p-2 flex flex-col items-center shadow-sm hover:shadow-md transition"
              >
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-14 h-14 rounded-md mb-2 object-contain border-2 border-blue-400"
                />
                <p className="text-sm font-semibold text-gray-700">{template.name}</p>
              </div>
            ))}
          </div>


          <div className="text-center mt-6">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700">
              SEE MORE
            </button>
          </div>
        </section>
      </FadeInOnView> */}
      <FadeInOnView>
        <section className="mt-10 px-4 max-w-6xl mx-auto">
          <h3 className="text-xl font-bold text-center mb-4">Popular Courses</h3>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-center">
              {courses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  courseName={course.courseName}
                  levelName={course.levelName}
                  thumbnail={course.thumbnail}
                  onClick={() => handleCourseClick(course.courseId)}
                />
              ))}
            </div>
          )}
        </section>
      </FadeInOnView>
    </>
  )
}
export default StudentPage;