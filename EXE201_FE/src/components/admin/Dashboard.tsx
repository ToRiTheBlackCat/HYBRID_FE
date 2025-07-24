/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { adminAnalyzeCourses, adminAnalyzeMinigames, adminAnalyzeUsers } from "../../services/authService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

// Đăng ký ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const [courseData, setCourseData] = useState<any>(null);
  const [minigameData, setMinigameData] = useState<Record<string, number>>({});
  const [userStats, setUserStats] = useState<{
    numberOfStudents: number;
    numbersOfTeacher: number;
  }>({ numberOfStudents: 0, numbersOfTeacher: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await adminAnalyzeCourses();
        const minigameRes = await adminAnalyzeMinigames();
        const userRes = await adminAnalyzeUsers();
        setCourseData(courseRes);
        setMinigameData(minigameRes);
        setUserStats({
          numberOfStudents: userRes.numberOfStudents || 0,
          numbersOfTeacher: userRes.numbersOfTeacher || 0,
        });
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu dashboard:", err);
      }
    };
    fetchData();
  }, []);

  // Biểu đồ tròn: Courses
  const doughnutData = {
    labels: ["Starters", "Movers", "Flyers"],
    datasets: [
      {
        data: [
          courseData?.numberOfStartersCourse || 0,
          courseData?.numberOfMoversCourse || 0,
          courseData?.numberOfFlyersCourse || 0,
        ],
        backgroundColor: [
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
          "rgb(59, 130, 246)",
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Biểu đồ cột: Minigames
  const barChartData = {
    labels: Object.keys(minigameData),
    datasets: [
      {
        label: "Lượt chơi Minigame",
        data: Object.values(minigameData),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Tổng người dùng</h3>
          <p className="text-3xl font-semibold mt-2">
            {userStats.numberOfStudents + userStats.numbersOfTeacher}
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Học sinh</h3>
          <p className="text-3xl font-semibold mt-2">{userStats.numberOfStudents}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Gia sư</h3>
          <p className="text-3xl font-semibold mt-2">{userStats.numbersOfTeacher}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Tỷ lệ hài lòng</h3>
          <p className="text-3xl font-semibold mt-2">92%</p>
          <span className="text-green-500 text-sm">↑ 2% so với tháng trước</span>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Biểu đồ tròn - Course Levels */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Phân bố Khóa học</h2>
          <div className="p-4 aspect-square max-h-[300px] mx-auto">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>

        {/* Biểu đồ cột - Minigame Types */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Lượt chơi Minigame theo loại</h2>
          <div className="p-4 h-[300px]">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Hoạt động gần đây</h2>
        <div className="space-y-4">
          <div className="flex items-center p-4 border-b">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">👤</div>
            <div>
              <p className="font-medium">Người dùng mới đăng ký</p>
              <p className="text-sm text-gray-500">2 phút trước</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
