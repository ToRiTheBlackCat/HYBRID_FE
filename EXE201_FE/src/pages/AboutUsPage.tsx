import React, {useEffect} from "react";
import FadeInOnView from "../hooks/FadeInOnView";
import AnimatedText from "../hooks/AnimatedText";
import Header from "../components/HomePage/Header";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';
import ThanhHang from "../assets/TeamMembers/ThanhHang.jpg";
import Dat from "../assets/TeamMembers/Dat.jpg";
import Tuan from "../assets/TeamMembers/Tuan.jpg";
import Tri from "../assets/TeamMembers/Tri.jpg";

const FeatureSection = ({ title, description, imgSrc, index }: { 
    title: string; 
    description: string | { student: string; teacher: string } | string[]; 
    imgSrc: string; 
    index: number; 
  }) => {
    const reverse = index % 2 !== 0;
    const sectionId = `feature-${index}`;
    const teamMembers = [
        {name: "Huỳnh Thị Thành Hằng", role: "AI Specialist", imgSrc: ThanhHang},
        {name: "Võ Tiến Đạt", role: "Data Scientist", imgSrc: Dat},
        {name: "Châu Anh Tuấn", role: "Software Engineer", imgSrc: Tuan},
        {name: "Nguyễn Huỳnh Minh Trí", role: "Tech Lead", imgSrc: Tri},
        {name: "Tạ Đức Thắng", role: "Software Engineer", imgSrc: "https://randomuser.me/api/portraits"},
    ]
    return (
        <>
        <FadeInOnView>
        <div
          id={sectionId}
          className={`relative lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-24 lg:px-8 mb-10 ml-20 ${
            reverse ? "lg:grid-flow-col-dense lg:col-start-2" : ""
          }`}
        >
          {!reverse && (
            <div className="mx-auto max-w-xl px-6 lg:mx-0 lg:max-w-none lg:py-16 lg:px-0">
              <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
              {typeof description === "string" ? (
                <p className="mt-4 text-lg text-gray-300">{description}</p>  
              ) : Array.isArray(description) ? (
                <ul className="mt-4 space-y-4 list-disc list-inside text-gray-300">
                  {description.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>              
              ) : (
                <>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold text-white">For Students</h3>
                    <p className="text-gray-300">{description.student}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold text-white">For Teachers</h3>
                    <p className="text-gray-300">{description.teacher}</p>
                  </div>
                </>
              )
              }
              
            </div>
          )}
    
          <div className="mt-12 sm:mt-16 lg:mt-0">
            {title === "Meet the Team" ? (
                    <Swiper
                    modules={[Autoplay]}
                    autoplay={{ delay: 3000 }}
                    loop
                    spaceBetween={20}
                    slidesPerView={1}
                    className="rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5"
                    >
                    {teamMembers.map((src, idx) => (
                        <SwiperSlide key={idx}>
                            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl">
                                <img
                                    src={src.imgSrc}
                                    alt={src.name}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 shadow-md"
                                />
                                <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">
                                    {src.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-300">{src.role}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                    </Swiper>
                ) : (
                    <img
                    loading="lazy"
                    className="w-full rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5"
                    src={imgSrc}
                    alt={title}
                    />
                )}
          </div>
    
          {reverse && (
            <div className="mx-auto max-w-xl px-6 lg:mx-0 lg:max-w-none lg:py-16 lg:px-0">
              <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
              {typeof description === "string" ? (
                <p className="mt-4 text-lg text-gray-300">{description}</p>  
              ) : Array.isArray(description) ? (
                <ul className="mt-4 space-y-4 list-disc list-inside text-gray-300">
                  {description.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>              
              ) : (
                <>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold text-white">For Students</h3>
                    <p className="text-gray-300">{description.student}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold text-white">For Teachers</h3>
                    <p className="text-gray-300">{description.teacher}</p>
                  </div>
                </>
              )
              }
            </div>
          )}
        </div>
        </FadeInOnView>
        </>
      );
    };
const AboutUsPage: React.FC = () => {
    const features = [
        { title: "Our Mission", description: "HYBRID aims to provide more engaging, handpicked English lesson content at economical pricing and a user-friendly interface to English learners and teachers.", imgSrc: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc" },
        { title: "What is Hybrid?", description: "HYBRID is a multifunctional English website that provides lessons for students at the level Starters - Movers - Flyers and teaching resources for ESL teachers.", imgSrc: "https://images.unsplash.com/photo-1531297484001-80022131f5a1" },
        { title: "Why choose Hybrid", description: [
          "With HYBRID, we have chances to learn from our very picky customers, who are teachers and learners in the technological era.",
          "HYBRID brings to you an archive of grammatical and vocabulary lessons, a bunch of interactive games and much more content for teachers and learners to explore.",
          "Experience HYBRID now and embark on this exciting journey together!"
        ], imgSrc: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f" },
        { title: "How it work?", description: {
          student: "For Students: Many English lessons at level Starters - Movers - Flyers are designed in creative ways that can help improve students’ engagement throughout the English self-study process.",
          teacher: "For Teachers: Various English teaching resources including vocabulary by topics, grammatical summary and interactive games/quizzes (which can be modified), are provided to support ESL teachers in creating in-class activities.",
        }, imgSrc: "https://images.unsplash.com/photo-1556761175-129418cb2dfe" },
        { title: "Meet the Team", description: "Our passionate and experienced team works tirelessly to bring the best English learing and teaching experience to students and tutors worldwide.", imgSrc: "" },
      ];
      return (
        <>
        <Header/>
        <div className="relative overflow-hidden bg-gray-900 pt-16 pb-32 mt-6">
            <div className="text-center px-6 mb-5">
                <h1 className="text-5xl font-extrabold text-white">
                    <AnimatedText text="About Future Aim & Hybrid"/></h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
                    <AnimatedText text="Hybrid - Study and Teach At Once."/>
                </p>
            </div>

            {features.map((feature, index) => (
                <FeatureSection key={index} index={index} {...feature} />
            ))}
        </div>
        </>
      )
}
export default AboutUsPage;