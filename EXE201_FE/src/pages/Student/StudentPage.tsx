import React, { useState, useEffect } from "react";
import AnimatedText from "../../components/hooks/AnimatedText";
import FadeInOnView from "../../components/hooks/FadeInOnView";
import Header from "../../components/HomePage/Header";
import Footer from "../../components/HomePage/Footer";
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

  const steps = [
    {
      number: "01",
      title: "Search for a skill",
      description: "Find the perfect course for your learning goals",
      icon: "🔍"
    },
    {
      number: "02", 
      title: "Choose a course",
      description: "Select from our curated collection of courses",
      icon: "📚"
    },
    {
      number: "03",
      title: "Enjoy it",
      description: "Start learning and track your progress",
      icon: "🎯"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          {/* Main heading */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
              <AnimatedText text="Let's explore our" />
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-4xl md:text-6xl lg:text-7xl font-extrabold">
                  <AnimatedText text="Courses" />
                </span>
                <span className="absolute -top-2 -right-8 text-2xl animate-bounce">✨</span>
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-6">
              Discover amazing courses designed to help you master new skills and achieve your learning goals
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <FadeInOnView key={index}>
                <div className="relative group">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <div className="text-3xl font-bold text-blue-600 mb-3">{step.number}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      <AnimatedText text={step.title} />
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      <AnimatedText text={step.description} />
                    </p>
                  </div>
                  
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300 transform -translate-y-1/2 z-10"></div>
                  )}
                </div>
              </FadeInOnView>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative separator */}
      <div className="relative h-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-400 to-transparent"></div>
        <svg className="absolute bottom-0 w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="currentColor"></path>
        </svg>
      </div>

      {/* Courses Section */}
      <FadeInOnView>
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Popular Courses
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join thousands of learners who have already started their journey with our most popular courses
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mt-6 rounded-full"></div>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 mt-4 text-lg">Loading amazing courses...</p>
              </div>
            ) : (
              /* Courses grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course, index) => (
                  <div 
                    key={course.courseId}
                    className="transform transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >

                      <CourseCard
                        courseName={course.courseName}
                        levelName={course.levelName}
                        thumbnail={course.thumbnail}
                        onClick={() => handleCourseClick(course.courseId)}
                      />
                  </div>
                ))}
              </div>
            )}

            {/* Show more button */}
            {!loading && courses.length > 0 && (
              <div className="text-center mt-12">
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <span className="flex items-center gap-2">
                    Explore More Courses
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </div>
        </section>
      </FadeInOnView>

      {/* Footer */}
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default StudentPage;