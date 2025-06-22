import { useState, useEffect } from "react";
import React from "react";
import teacherPic from "../../assets/teacherPic.jpg";
import teacherPic2 from "../../assets/teacherPic2.jpg";
import AiImage from "../../assets/AIImg.jpg";
import { getTopMinigame } from "../../services/userService";
import { baseImageUrl } from "../../config/base";
// import { useNavigate } from "react-router-dom";

import BodyPic2 from "../../assets/BodyPic2.jpg";

import { FaSearch, FaChevronLeft, FaChevronRight, FaQuoteRight } from "react-icons/fa";
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
      <section className="w-full bg-white py-10 px-4 pt-20 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Text Section */}
        <div className="max-w-xl">
          <FadeInOnView>
            <h2 className="text-2xl md:text-3xl font-quicksand font-semibold text-gray-800">
              Explore our variety of{" "}
              <span className="text-blue-600 font-bold">TEMPLATES</span>
              <span className="inline-block ml-1 animate-bounce text-blue-500">✨</span>
            </h2>

            <p className="mt-4 text-gray-600 font-quicksand text-base leading-relaxed">
              <AnimatedText text="Our platform provide diverse templates with the most suitable price and help minimize preparation time for teachers." />
            </p>
            <button
              onClick={() => window.location.href = "/template"}
              className="mt-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-full flex items-center gap-2 shadow-md transition animate-fadeInUp">
              Explore now <FaSearch className="text-white" />
            </button>
          </FadeInOnView>
        </div>

        {/* Image Section */}
        <div className="relative">
          <FadeInOnView>
            <img
              src={teacherPic2}
              alt="Smiling teacher"
              className="max-w-sm w-full rounded-lg object-cover"
            />

            {/* Decorative Icons */}
            <div className="absolute top-2 right-2 text-blue-600 text-xl animate-pulse">★</div>
            <div className="absolute bottom-8 left-4 text-blue-500 text-2xl">💙</div>
            <div className="absolute top-10 left-10 text-blue-400 text-xl">★</div>
            <div className="absolute bottom-2 right-8 text-blue-400 text-lg">★</div>
          </FadeInOnView>
        </div>

      </section>
      <div className="w-full h-[80px] bg-gradient-to-r from-white to-blue-400"></div>
      <section className="w-full bg-white py-10 px-4 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left Side: Image */}
        <div className="relative flex-shrink-0">
          <FadeInOnView>
            {/* Main image */}
            <img
              src={teacherPic}
              alt="Student"
              className="max-w-sm w-full rounded-lg object-cover"
            />

            {/* Decorative icons */}
            <div className="absolute top-0 -right-6 text-blue-500 text-2xl">★</div>
            <div className="absolute bottom-0 left-0 text-blue-500 text-xl">💙</div>
            <div className="absolute top-8 right-12 text-blue-500 text-xl">★</div>
          </FadeInOnView>
        </div>

        {/* Right Side: Text */}
        <div className="max-w-xl">
          <FadeInOnView delay={0.3}>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-quicksand">
              <span className="text-4xl font-extrabold text-gray-700">COURSES</span>{" "}
              <span className="text-gray-600 font-semibold">expanding in all skills</span>
              <div className="w-[180px] h-2 bg-[url('/underline-brush.png')] bg-contain bg-no-repeat mt-[-10px]" />
            </h2>
          </FadeInOnView>
          <FadeInOnView delay={0.6}>
            <p className="mt-4 text-gray-600 text-base leading-relaxed font-quicksand">
              <AnimatedText text="The courses expanding in all skills from Reading – Listening – Writing – Speaking, which is really helpful for students to practice Cambridge certificates" />
            </p>
          </FadeInOnView>
          <FadeInOnView delay={0.3}>
            <button
              onClick={() => window.location.href = "/course"}
              className="mt-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-full flex items-center gap-2 shadow-md transition">
              Explore now <FaSearch className="text-white" />
            </button>
          </FadeInOnView>
        </div>
      </section>
      <div className="w-full h-[80px] bg-gradient-to-r from-blue-400 to-white"></div>
      {/* COURSE SHOWCASE SECTION */}
      <section className="p-4 max-w-screen-xl mx-auto">
        <FadeInOnView delay={0.3}>
          <div className="text-xl font-semibold border-b mb-4 mt-10">Explore top templates</div>
          <div className="relative flex items-center justify-center">
            {/* Left Arrow */}
            <button
              className="absolute left-0 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-100 disabled:opacity-30"
              onClick={() => setStartIndex((prev) => Math.max(prev - 1, 0))}
              disabled={startIndex === 0}
            >
              <FaChevronLeft />
            </button>
            <div className="flex gap-4 justify-center">
              {visibleTemplates.map((item) => (
                <div key={item.minigameId} className="w-60 p-4 border rounded-xl shadow hover:shadow-lg transition bg-white">
                  <img src={`${baseImageUrl}${item.thumbnailImage.replace(/^\/+/g, "")}`} alt={item.templateName} className="h-35 w-full object-cover rounded mb-2" />
                  <div className="text-sm font-medium mb-1 truncate" title={item.minigameName}>{item.minigameName}</div>
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <span className="mr-2">👥 {item.participantsCount} users</span>
                    <span>📘 {item.templateName}</span>
                  </div>
                  <div className="flex items-center">
                    {[...Array(Math.floor(item.ratingScore))].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                    <span className="text-xs ml-1 text-gray-600">{item.ratingScore}/5</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Right Arrow */}
            <button
              className="absolute right-0 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-100 disabled:opacity-30"
              onClick={() => setStartIndex((prev) => Math.min(prev + 1, templates.length - 3))}
              disabled={startIndex >= templates.length - 3}
            >
              <FaChevronRight />
            </button>
          </div>
        </FadeInOnView>

        {/* <FadeInOnView delay={0.4}>
      <div className="text-xl font-semibold border-b mb-4 mt-10">Explore trending courses</div>
      <div className="relative flex items-center justify-center">
        <button
          className="absolute left-0 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-100 disabled:opacity-30"
          onClick={() => setCourseIndex((prev) => Math.max(prev - 1, 0))}
          disabled={courseIndex === 0}
        >
          <FaChevronLeft />
        </button>
        <div className="flex gap-4 justify-center">
          {visibleCourses.map((course) => (
          <div
            key={course.id}
            className="w-60 p-4 border rounded-xl shadow hover:shadow-lg transition bg-white"
          >
            <img
              src={course.image}
              alt={course.skill}
              className="h-35 w-full object-cover rounded mb-2"
            />
            <div className="text-sm font-medium mb-1">{course.title}</div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <span className="mr-2">👁️ {course.views} views</span>
              <span>🎧 {course.skill}</span>
            </div>
            <div className="flex items-center">
              {[...Array(Math.floor(course.rating))].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
              <span className="text-xs ml-1 text-gray-600">{course.rating}/5</span>
            </div>
          </div>
        ))}
      </div>
        <button
          className="absolute right-0 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-100 disabled:opacity-30"
          onClick={() => setCourseIndex((prev) => Math.min(prev + 1, courses.length - 3))}
          disabled={courseIndex >= courses.length - 3}
        >
          <FaChevronRight />
        </button>
      </div>
      </FadeInOnView> */}
      </section>

      {/* AI PROMO SECTION */}
      <section className="mt-10 bg-blue-50 p-6 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-6 mx-4">
        <FadeInOnView delay={0.5}>
          <div
            className="relative flex-shrink-0 mb-6 lg:mb-0 lg:mr-6">
            <img src={AiImage} alt="AI Agent" className="w-80 rounded-3xl" />
          </div>
        </FadeInOnView>
        <FadeInOnView delay={0.6}>
          <div className="max-w-4xl">
            <h2
              className="text-5xl font-bold text-blue-700 mb-6">
              Master the Speaking skill with <br />
              <span className="text-black">Grading and Pronunciation Checking AI Model</span>
            </h2>
            <p className="text-gray-600 text-2xl font-sans mb-4">
              <AnimatedText text="Enhance your speaking skills with an AI-powered agent that evaluates pronunciation, provides instant feedback. This intelligent system analyzes speech patterns, detects mispronunciations, and grades your performance, helping you improve fluency and accuracy efficiently." />
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 flex items-center gap-2">
              Explore now <FaSearch className="text-white" />
            </button>
          </div>
        </FadeInOnView>
      </section>
      <div className="w-full h-[80px] bg-gradient-to-r from-blue-400 to-white"></div>
      <section className="py-12 px-4 md:px-16 bg-white">
        <FadeInOnView delay={0.7}>
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/3 text-center md:text-left">
              <h2 className="text-gray-800 font-bold text-xl md:text-2xl mb-4">
                <AnimatedText text="What our valuable users say about us" />
              </h2>
            </div>

            <div className="md:w-2/3">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation={{
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                loop={true}
                className="w-full max-w-xl h-[300px] rounded-xl border-[3px] border-blue-400 p-6 bg-white"
              >
                {testimonials.map((t, i) => (
                  <SwiperSlide key={i}>
                    <div className="flex flex-col gap-4 relative mt-15 ml-3">
                      <div className="flex gap-1">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                      </div>
                      <p className="text-gray-600 italic text-sm">{`"${t.text}"`}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={BodyPic2}
                          alt={t.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-sm">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.role}</p>
                        </div>
                      </div>
                      <FaQuoteRight className="text-blue-500 text-4xl mr-3 absolute bottom-0 right-0" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </FadeInOnView>
      </section>
    </>
  )
}
export default Body;