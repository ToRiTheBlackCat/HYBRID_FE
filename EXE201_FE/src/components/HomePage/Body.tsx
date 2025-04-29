import { useState } from "react";
import React from "react";
import teacherPic from "../../assets/teacherPic.jpg";
import teacherPic2 from "../../assets/teacherPic2.jpg";
import AiImage from "../../assets/AIImg.jpg";
import Anagram from "../../assets/TemplateLogo/Anagram.jpg";
import Completion from "../../assets/TemplateLogo/Completion.jpg";
import Conjunction from "../../assets/TemplateLogo/Conjunction.jpg";
import Crossword from "../../assets/TemplateLogo/Crossword.jpg";
import DragDrop from "../../assets/TemplateLogo/DragDrop.jpg";

import FlashCard from "../../assets/TemplateLogo/Flashcard.jpg";
import Reading from "../../assets/TemplateLogo/Reading.jpg";
import SongPuzzle from "../../assets/TemplateLogo/SongPuzzle.jpg";
import Spelling from "../../assets/TemplateLogo/Spelling.jpg";
import Quiz from "../../assets/TemplateLogo/Quiz.jpg";
import { FaSearch,FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Body: React.FC = () => {

  const templates = [
    { id: 1, title: "Template 1", views: 230, skill: "Anagram", rating: 4.5, image: Anagram },
    { id: 2, title: "Template 2", views: 150, skill: "Completion", rating: 4.2, image: Completion },
    { id: 3, title: "Template 3", views: 180, skill: "Conjunction", rating: 4.8, image: Conjunction },
    { id: 4, title: "Template 4", views: 100, skill: "Crossword", rating: 4.0, image: Crossword },
    { id: 5, title: "Template 5", views: 300, skill: "Drag&Drop", rating: 4.7, image: DragDrop },
  ];
  const courses = [
    { id: 1, title: "Course 1", views: 320, skill: "Flashcard", rating: 4.0, image: FlashCard },
    { id: 2, title: "Course 2", views: 250, skill: "Reading", rating: 4.3, image: Reading },
    { id: 3, title: "Course 3", views: 180, skill: "SongPuzzle", rating: 4.1, image: SongPuzzle },
    { id: 4, title: "Course 4", views: 400, skill: "Spelling", rating: 4.6, image: Spelling },
    { id: 5, title: "Course 5", views: 210, skill: "Quiz", rating: 4.2, image: Quiz },
  ];
  
  
  const [startIndex, setStartIndex] = useState(0);
  const [courseIndex, setCourseIndex] = useState(0);
  const visibleTemplates = templates.slice(startIndex, startIndex + 3);
  const visibleCourses = courses.slice(courseIndex, courseIndex + 3);
    return(
        <>
        <section className="w-full bg-white py-10 px-4 pt-20 flex flex-col lg:flex-row items-center justify-between gap-8">
      {/* Text Section */}
      <div className="max-w-xl">
        <h2 className="text-2xl md:text-3xl font-quicksand font-semibold text-gray-800 ">
          Explore our variety of{" "}
          <span className="text-blue-600 font-bold">TEMPLATES</span>
          <span className="inline-block ml-1 animate-bounce text-blue-500">✨</span>
        </h2>
        <p className="mt-4 text-gray-600 font-quicksand text-base leading-relaxed">
          Our platform provide diverse templates with the most suitable price and help minimize preparation time for teachers.
        </p>
        <button className="mt-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-full flex items-center gap-2 shadow-md transition">
          Explore now <FaSearch className="text-white" />
        </button>
      </div>

      {/* Image Section */}
      <div className="relative">
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
      </div>
      
    </section>
    <div className="w-full h-[80px] bg-gradient-to-r from-white to-blue-400"></div>
    <section className="w-full bg-white py-10 px-4 flex flex-col lg:flex-row items-center justify-between gap-10">
      {/* Left Side: Image */}
      <div className="relative flex-shrink-0">

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
      </div>

      {/* Right Side: Text */}
      <div className="max-w-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-quicksand">
          <span className="text-4xl font-extrabold text-gray-700">COURSES</span>{" "}
          <span className="text-gray-600 font-semibold">expanding in all skills</span>
          <div className="w-[180px] h-2 bg-[url('/underline-brush.png')] bg-contain bg-no-repeat mt-[-10px]" />
        </h2>

        <p className="mt-4 text-gray-600 text-base leading-relaxed font-quicksand">
          The courses expanding in all skills from Reading – Listening – Writing – Speaking, 
          which is really helpful for students to practice Cambridge certificates
        </p>

        <button className="mt-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-full flex items-center gap-2 shadow-md transition">
          Explore now <FaSearch className="text-white" />
        </button>
      </div>
    </section>
    <div className="w-full h-[80px] bg-gradient-to-r from-blue-400 to-white"></div>
        {/* COURSE SHOWCASE SECTION */}
    <section className="p-4 max-w-screen-xl mx-auto">
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
        <div
          key={item.id}
          className="w-60 p-4 border rounded-xl shadow hover:shadow-lg transition bg-white"
        >
          <img
            src={item.image}
            alt={item.skill}
            className="h-35 w-full object-cover rounded mb-2"
          />
          <div className="text-sm font-medium mb-1">{item.title}</div>
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <span className="mr-2">👁️ {item.views} views</span>
            <span>📘 {item.skill}</span>
          </div>
          <div className="flex items-center">
            {[...Array(Math.floor(item.rating))].map((_, i) => (
              <span key={i} className="text-yellow-400">★</span>
            ))}
            <span className="text-xs ml-1 text-gray-600">{item.rating}/5</span>
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

      <div className="text-xl font-semibold border-b mb-4 mt-10">Explore trending courses</div>
      <div className="relative flex items-center justify-center">
            {/* Left Arrow */}
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
          {/* Right Arrow */}
        <button
          className="absolute right-0 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-100 disabled:opacity-30"
          onClick={() => setCourseIndex((prev) => Math.min(prev + 1, courses.length - 3))}
          disabled={courseIndex >= courses.length - 3}
        >
          <FaChevronRight />
        </button>
      </div>
    </section>

    {/* AI PROMO SECTION */}
    <section className="mt-10 bg-blue-50 p-6 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-6 mx-4">
      <div>
        <img src={AiImage} alt="AI Agent" className="w-80 rounded-3xl" />
      </div>
      <div className="max-w-4xl">
        <h2 className="text-5xl font-bold text-blue-700 mb-6">
          Master the Speaking skill with <br />
          <span className="text-black">Grading and Pronunciation Checking AI Model</span>
        </h2>
        <p className="text-gray-600 text-2xl font-sans mb-4">
          Enhance your speaking skills with an AI-powered agent that evaluates pronunciation, provides
          instant feedback. This intelligent system analyzes speech patterns, detects mispronunciations,
          and grades your performance, helping you improve fluency and accuracy efficiently.
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 flex items-center gap-2">
          Explore now <FaSearch className="text-white" />
        </button>
      </div>
      
    </section>
    </>
    )
}
export default Body;