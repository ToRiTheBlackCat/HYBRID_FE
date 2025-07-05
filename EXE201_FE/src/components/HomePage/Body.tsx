import { useState, useEffect } from "react";
import React from "react";
import teacherPic from "../../assets/teacherPic.jpg";
import teacherPic2 from "../../assets/teacherPic2.jpg";
import AiImage from "../../assets/AIImg.jpg";
import { getTopMinigame } from "../../services/userService";
import { baseImageUrl } from "../../config/base";
// import { useNavigate } from "react-router-dom";

import BodyPic2 from "../../assets/user.jpg";

import { FaSearch, FaChevronLeft, FaChevronRight, FaQuoteRight, FaUsers, FaBook, FaStar } from "react-icons/fa";
// import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "../../../node_modules/swiper/swiper-bundle.css";
import "../../../node_modules/swiper/swiper.css";
import AnimatedText from "../hooks/AnimatedText";
import FadeInOnView from "../hooks/FadeInOnView";

interface MinigameCard {
  minigameId: string;
  minigameName: string;
  thumbnailImage: string;
  participantsCount: number;
  ratingScore: number;
  templateName: string;
}

const Body: React.FC = () => {
  const [templates, setTemplates] = useState<MinigameCard[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  // const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTopMinigame(5); // count = 5
        setTemplates(res || []);
      } catch (err) {
        console.error("Error fetching top minigames", err);
      }
    };
    load();
  }, []);

  const visibleTemplates = templates.slice(startIndex, startIndex + 3);
  const testimonials = [
    {
      name: "Tri Nguyen",
      role: "Student",
      // image: "../../assets/BodyPic1.jpg", // thay bằng path ảnh thật hoặc avatar mặc định
      rating: 5,
      text: "An interesting foundation worth experiencing. Help me prepare lessons quickly and conveniently with a very suitable price",
    },
    {
      name: "Thang Duc",
      role: "Student",
      // image: "../../assets/BodyPic2.jpg", // thay bằng path ảnh thật hoặc avatar mặc định
      rating: 5,
      text: "I have used many templates on this platform and I am very satisfied with the quality of the templates. The price is also very reasonable compared to the quality.",
    },
    // Thêm các đánh giá khác nếu muốn
  ];


  return (
    <>
      {/* HERO SECTION - TEMPLATES */}
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 px-4 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>

        {/* Text Section */}
        <div className="max-w-2xl z-10">
          <FadeInOnView>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 font-medium mb-6">
              <span className="animate-bounce mr-2">🎯</span>
              Discover Amazing Templates
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight mb-6">
              Explore our variety of{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TEMPLATES
              </span>
              <span className="inline-block ml-2 animate-bounce text-3xl">✨</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-xl">
              <AnimatedText text="Our platform provides diverse templates with the most suitable price and helps minimize preparation time for teachers." />
            </p>

          </FadeInOnView>
        </div>

        {/* Image Section */}
        <div className="relative z-10">
          <FadeInOnView delay={0.3}>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
              <img
                src={teacherPic2}
                alt="Smiling teacher"
                className="relative max-w-lg w-full rounded-2xl object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg animate-bounce">
              <FaStar className="text-yellow-500 text-2xl" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg animate-bounce delay-500">
              <span className="text-2xl">💙</span>
            </div>
            <div className="absolute top-1/2 -left-8 bg-white rounded-full p-3 shadow-lg animate-pulse">
              <span className="text-xl">⭐</span>
            </div>
          </FadeInOnView>
        </div>
      </section>


      {/* COURSES SECTION */}
      <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 px-4 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1500"></div>

        {/* Image Section */}
        <div className="relative z-10">
          <FadeInOnView>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
              <img
                src={teacherPic}
                alt="Student learning"
                className="relative max-w-lg w-full rounded-2xl object-cover shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg animate-bounce">
              <FaBook className="text-indigo-500 text-2xl" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-4 shadow-lg animate-bounce delay-700">
              <span className="text-2xl">🎓</span>
            </div>
          </FadeInOnView>
        </div>

        {/* Text Section */}
        <div className="max-w-2xl z-10">
          <FadeInOnView delay={0.3}>
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium mb-6">
              <span className="animate-bounce mr-2">📚</span>
              Comprehensive Learning
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 leading-tight mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-5xl">
                COURSES
              </span>
              <br />
              <span className="text-3xl text-gray-600">expanding in all skills</span>
            </h2>

            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6"></div>
          </FadeInOnView>

          <FadeInOnView delay={0.6}>
            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-xl">
              <AnimatedText text="The courses expand in all skills from Reading – Listening – Writing – Speaking, which is really helpful for students to practice Cambridge certificates" />
            </p>
          </FadeInOnView>

          <FadeInOnView delay={0.9}>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.href = "/course"}
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-full flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <FaSearch className="group-hover:rotate-12 transition-transform" />
                Explore Courses Now
              </button>

            </div>
          </FadeInOnView>
        </div>
      </section>


      {/* TOP TEMPLATES SECTION */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <FadeInOnView>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Top Templates
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our most popular and highly-rated templates chosen by educators worldwide
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-6"></div>
            </div>
          </FadeInOnView>

          <div className="relative">
            {/* Navigation Buttons */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setStartIndex((prev) => Math.max(prev - 1, 0))}
              disabled={startIndex === 0}
            >
              <FaChevronLeft className="text-gray-600" />
            </button>

            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setStartIndex((prev) => Math.min(prev + 1, templates.length - 3))}
              disabled={startIndex >= templates.length - 3}
            >
              <FaChevronRight className="text-gray-600" />
            </button>

            {/* Templates Grid */}
            <div className="flex gap-8 justify-center px-16">
              {visibleTemplates.map((item, index) => (
                <FadeInOnView key={item.minigameId} delay={index * 0.1}>
                  <div className="group w-80 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden">
                    <div className="relative overflow-hidden">
                      <img
                        src={`${baseImageUrl}${item.thumbnailImage.replace(/^\/+/g, "")}`}
                        alt={item.templateName}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                        <FaStar className="inline text-yellow-500 mr-1" />
                        {item.ratingScore}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 truncate group-hover:text-blue-600 transition-colors" title={item.minigameName}>
                        {item.minigameName}
                      </h3>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <FaUsers className="text-blue-500" />
                          <span>{item.participantsCount} users</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaBook className="text-green-500" />
                          <span className="truncate max-w-[100px]">{item.templateName}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < Math.floor(item.ratingScore) ? "text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                          <span className="text-sm ml-2 text-gray-600">{item.ratingScore}/5</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm group-hover:translate-x-1 transition-transform">
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeInOnView>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI PROMO SECTION */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className='absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.05%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] opacity-30'></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <FadeInOnView delay={0.3}>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <img
                  src={AiImage}
                  alt="AI Agent"
                  className="relative w-96 rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />

                {/* Floating AI indicators */}
                <div className="absolute -top-4 -right-4 bg-cyan-500 text-white rounded-full p-3 shadow-lg animate-pulse">
                  <span className="text-xl">🤖</span>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white rounded-full p-3 shadow-lg animate-pulse delay-1000">
                  <span className="text-xl">🎯</span>
                </div>
              </div>
            </FadeInOnView>

            <FadeInOnView delay={0.6}>
              <div className="max-w-3xl">
                <div className="inline-flex items-center px-4 py-2 bg-cyan-100 rounded-full text-cyan-700 font-medium mb-6">
                  <span className="animate-bounce mr-2">🚀</span>
                  AI-Powered Learning
                </div>

                <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                  Master the Speaking skill with{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    AI-Powered Grading
                  </span>
                </h2>

                <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-2xl">
                  <AnimatedText text="Enhance your speaking skills with an AI-powered agent that evaluates pronunciation, provides instant feedback. This intelligent system analyzes speech patterns, detects mispronunciations, and grades your performance." />
                </p>
              </div>
            </FadeInOnView>
          </div>
        </div>
      </section>


      {/* TESTIMONIALS SECTION */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="max-w-7xl mx-auto">
          <FadeInOnView>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                What Our{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Students Say
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Real feedback from our amazing community of learners and educators
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mt-6"></div>
            </div>
          </FadeInOnView>

          <div className="flex flex-col lg:flex-row items-center gap-16">
            <FadeInOnView delay={0.3}>
              <div className="lg:w-2/3 text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium mb-6">
                  <span className="animate-bounce mr-2">💬</span>
                  Student Reviews
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  <AnimatedText text="Trusted by thousands of learners worldwide" />
                </h3>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-yellow-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-2xl" />
                  ))}
                  <span className="text-gray-600 ml-2 text-lg">4.9/5 average rating</span>
                </div>
              </div>
            </FadeInOnView>

            <FadeInOnView delay={0.6}>
              <div className="lg:w-2/3">
                <div className="relative">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation={{
                      nextEl: ".swiper-button-next",
                      prevEl: ".swiper-button-prev",
                    }}
                    pagination={{
                      clickable: true,
                      bulletClass: "swiper-pagination-bullet !bg-purple-600",
                      bulletActiveClass: "swiper-pagination-bullet-active !bg-purple-800"
                    }}
                    autoplay={{ delay: 5000 }}
                    loop={true}
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
                  >
                    {testimonials.map((t, i) => (
                      <SwiperSlide key={i}>
                        <div className="p-8 relative">
                          <div className="absolute top-4 right-4 text-purple-200">
                            <FaQuoteRight className="text-4xl" />
                          </div>

                          <div className="flex gap-1 mb-4">
                            {Array.from({ length: t.rating }).map((_, i) => (
                              <FaStar key={i} className="text-yellow-500" />
                            ))}
                          </div>

                          <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                            "{t.text}"
                          </p>

                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={BodyPic2}
                                alt={t.name}
                                className="w-16 h-16 rounded-full object-cover border-4 border-purple-200"
                              />
                              <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-lg">{t.name}</p>
                              <p className="text-purple-600 font-medium">{t.role}</p>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </FadeInOnView>
          </div>
        </div>
      </section>
    </>
  );
};
export default Body;