import React from "react";

interface CourseCardProps {
  courseName: string;
  levelName: string;
  thumbnail?: string;
  onClick?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  courseName,
  levelName,
  thumbnail = "/placeholder-image.jpg",
  onClick,
}) => (
  <div
    onClick={onClick}
    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl text-center 
               cursor-pointer transform transition-all duration-500 ease-in-out
               hover:scale-105 hover:-translate-y-3 border border-gray-100
               overflow-hidden relative"
  >
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-300/10 to-cyan-300/10 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

    {/* Image container */}
    <div className="relative overflow-hidden">
      <img
        src={encodeURI(thumbnail)}
        alt={`${courseName} thumbnail`}
        className="w-full h-48 object-cover transition-transform duration-500 
                   group-hover:scale-110"
      />
      <div className="absolute top-3 right-3 z-20">
        <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white 
                        px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          {levelName}
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="p-6 relative z-20">
      <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 
                     group-hover:text-blue-600 transition-colors duration-300">
        {courseName}
      </h3>
      <div className="flex items-center justify-center mt-4">
        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white 
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

export default CourseCard;