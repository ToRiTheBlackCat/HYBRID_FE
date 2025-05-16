import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "../../node_modules/swiper/swiper.css";
import "../../node_modules/swiper/swiper-bundle.css";
import Img from "../assets/teacherPic.jpg";
import BG from "../assets/mentor.jpg";
import Header from "../components/HomePage/Header";

const CoursePage: React.FC = () => {
    const courses = Array.from({ length: 10 }, (_, i) => ({
    title: `Course ${i + 1}`,
    author: `Author ${i + 1}`,
    classes: 12,
    students: 150,
    rating: 5,
    image: Img,
}));

  const CourseCard = ({
    title,
    author,
    classes,
    students,
    rating,
    image,
  }: {
    title: string;
    author: string;
    classes: number;
    students: number;
    rating: number;
    image: string;
  }) => (
    <div className="bg-pink-50 p-4 rounded-xl shadow-md text-center w-[200px]">
      <img src={image} alt="course" className="w-full h-[120px] object-cover rounded-md mb-2" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">{author}</p>
      <div className="text-yellow-500 my-1">{"★".repeat(rating)}</div>
      <div className="text-xs text-gray-500">
        {classes} classes - {students} students
      </div>
    </div>
  );

  return (
    <>
      <Header />
    <div className="font-sans">
      {/* SearchBar section */}
      <div
        className="relative bg-cover bg-center h-[650px] flex items-center justify-center"
        style={{
          backgroundImage: `url(${BG})`,
        }}
      >
        <div className="absolute top-1/4 text-white text-xl font-semibold">text</div>
        <div className="absolute top-1/3 text-white text-3xl font-bold">text</div>
        <div className="flex bg-white rounded-md overflow-hidden mt-40 shadow-md">
          <select className="px-4 py-2 border-r border-gray-300 text-gray-600">
            <option>Level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
          </select>
          <input type="text" placeholder="Keyword" className="px-4 py-2 outline-none" />
          <button className="bg-red-500 text-white px-6 py-2">Search</button>
        </div>
      </div>

      {/* Popular courses section */}
      <div className="py-10 px-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Popular courses</h2>
            <div className="max-w-2xl mx-auto">
                <Swiper
                modules={[Autoplay]}
                spaceBetween={20}
                slidesPerView={3}
                autoplay={{ delay: 1000}}
                loop={true}
                >
                {courses.map((course, index) => (
                    <SwiperSlide key={index}>
                        <CourseCard {...course} />
                    </SwiperSlide>
                ))}
                </Swiper>
            </div>
        </div>
    </div>
    </>
  );
};
export default CoursePage;
