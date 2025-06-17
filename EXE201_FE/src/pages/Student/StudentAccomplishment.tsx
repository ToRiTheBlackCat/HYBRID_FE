import React, { useEffect, useState } from "react";
import { fetchAccomplishment } from "../../services/authService"; // ⬅️ đã có sẵn
import { baseImageUrl } from "../../config/base";
import Header from "../../components/HomePage/Header";
import { AccomplishmentData } from "../../types";

const fetchAllAccomplishments = () => fetchAccomplishment();


const StudentAccomplishment: React.FC = () => {
    const [list, setList] = useState<AccomplishmentData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await fetchAllAccomplishments();
            if (data) setList(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="text-center py-20">Loading...</div>;

    if (list.length === 0)
        return (
            <div className="text-center py-20 text-gray-600">
                Bạn chưa hoàn thành minigame nào.
            </div>
        );

    return (
        <>
            <Header />
            <section className="max-w-6xl mx-auto px-4 py-10 font-sans mt-20">
                <h2 className="text-2xl font-bold mb-8 text-center">
                    Minigame bạn đã hoàn thành
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {list.map((item) => (
                        <div
                            key={item.minigameId}
                            className="bg-white rounded-xl shadow group transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            {/* thumbnail */}
                            <img
                                src={`${baseImageUrl}${item.thumbnailImage}`}
                                alt={item.minigameName}
                                className="w-full h-40 object-cover rounded-t-xl"
                            />

                            {/* nội dung */}
                            <div className="p-4 space-y-1">
                                <p className="font-semibold text-lg">{item.minigameName}</p>

                                <p className="text-sm text-gray-600">
                                    Khóa học: <span className="font-medium">{item.courseName}</span>
                                </p>

                                <p className="text-sm text-gray-600">
                                    Template:{" "}
                                    <span className="font-medium">{item.templateName}</span>
                                </p>

                                <p className="text-sm">
                                    Điểm:{" "}
                                    <span className="font-bold text-yellow-600">{item.score}</span>
                                </p>

                                <p className="text-xs text-gray-500">
                                    Ngày làm:{" "}
                                    {new Date(item.takenDate).toLocaleString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default StudentAccomplishment;
