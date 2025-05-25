import React from "react";
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
import { Line, Doughnut } from "react-chartjs-2";

// Đăng ký các components của Chart.js
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
  // Data cho biểu đồ đường
  const lineChartData = {
    labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7"],
    datasets: [
      {
        label: "Người dùng hoạt động",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgb(59, 130, 246)",
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: "Cuộc trò chuyện mới",
        data: [28, 48, 40, 19, 86, 27, 90],
        fill: true,
        backgroundColor: "rgba(236, 72, 153, 0.1)",
        borderColor: "rgb(236, 72, 153)",
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  // Data cho biểu đồ tròn
  const doughnutData = {
    labels: ["Hài lòng", "Bình thường", "Không hài lòng"],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: [
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  // Options chung cho charts
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

  // Options riêng cho Line Chart
  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
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
          <p className="text-3xl font-semibold mt-2">1,234</p>
          <span className="text-green-500 text-sm">
            ↑ 12% so với tháng trước
          </span>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Cuộc trò chuyện</h3>
          <p className="text-3xl font-semibold mt-2">5,678</p>
          <span className="text-green-500 text-sm">
            ↑ 8% so với tháng trước
          </span>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Người dùng mới</h3>
          <p className="text-3xl font-semibold mt-2">145</p>
          <span className="text-green-500 text-sm">
            ↑ 4% so với tháng trước
          </span>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">Tỷ lệ hài lòng</h3>
          <p className="text-3xl font-semibold mt-2">92%</p>
          <span className="text-green-500 text-sm">
            ↑ 2% so với tháng trước
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Thống kê hoạt động
          </h2>
          <div className="p-4 h-[300px]">
            <Line
              data={lineChartData}
              options={lineOptions}
              className="!w-full !h-full"
            />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Phản hồi người dùng
          </h2>
          <div className="p-4 aspect-square max-h-[300px] mx-auto">
            <Doughnut
              data={doughnutData}
              options={chartOptions}
              className="!w-full !h-full"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Hoạt động gần đây</h2>
        <div className="space-y-4">
          {/* Activity Items */}
          <div className="flex items-center p-4 border-b">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              👤
            </div>
            <div>
              <p className="font-medium">Người dùng mới đăng ký</p>
              <p className="text-sm text-gray-500">2 phút trước</p>
            </div>
          </div>
          {/* Add more activity items as needed */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
