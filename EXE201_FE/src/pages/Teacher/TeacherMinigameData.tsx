/* TeacherMinigameData.tsx
   Hiển thị danh sách học sinh đã chơi một minigame cụ thể */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchStudentAccomplishment } from "../../services/authService";
import Header from "../../components/HomePage/Header";

/* Kiểu dữ liệu bản ghi trả về */
interface StudentAccomplishment {
  studentId: string;
  studentName: string;
  minigameId: string;
  score: number;
  duration: number;   // giây
  takenDate: string;  // ISO string
}

const TeacherMinigameData: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const [data, setData] = useState<StudentAccomplishment[]>([]);
  const [loading, setLoading] = useState(true);

  /* ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!minigameId) return;

    const load = async () => {
      const res = await fetchStudentAccomplishment(minigameId, false); // false = lấy tất cả HS
      console.log("Result", res);
      if (res) setData(res);
      setLoading(false);
    };
    load();
  }, [minigameId]);

  /* ──────────────────────────────────────────────────────────── */
  const formatDuration = (sec: number) =>
    `${Math.floor(sec / 60)
      .toString()
      .padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ──────────────────────────────────────────────────────────── */
  if (!minigameId) return <p className="text-center mt-10">❗ URL thiếu minigameId.</p>;
  if (loading) return <p className="text-center mt-10">Đang tải dữ liệu...</p>;

  if (data.length === 0)
    return (
      <p className="text-center mt-10 text-gray-600">
        Chưa có học sinh nào chơi minigame này.
      </p>
    );

  /* ──────────────────────────────────────────────────────────── */
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto mt-25 px-4 font-sans ">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Danh sách học sinh – Minigame <span className="text-indigo-600">{minigameId}</span>
        </h1>

        <div className="overflow-auto rounded-lg shadow">
          <table className="min-w-full bg-white divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Học sinh</th>
                <th className="px-4 py-2 text-center">Điểm</th>
                <th className="px-4 py-2 text-center">Thời gian&nbsp;(mm:ss)</th>
                <th className="px-4 py-2 text-center">Ngày chơi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, idx) => (
                <tr key={row.studentId} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2 font-medium">{row.studentName}</td>
                  <td className="px-4 py-2 text-center font-semibold text-blue-700">
                    {row.score}
                  </td>
                  <td className="px-4 py-2 text-center">{formatDuration(row.duration)}</td>
                  <td className="px-4 py-2 text-center">{formatDate(row.takenDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TeacherMinigameData;
