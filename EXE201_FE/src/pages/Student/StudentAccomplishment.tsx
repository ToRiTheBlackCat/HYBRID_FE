import React, { useEffect, useState } from "react";
import { fetchAccomplishment, fetchMinigameRating } from "../../services/authService";
import { baseImageUrl } from "../../config/base";
import Header from "../../components/HomePage/Header";
import { AccomplishmentData } from "../../types";
import RatingForm from "./RatingForm";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";


const StudentAccomplishment: React.FC = () => {
    const [list, setList] = useState<AccomplishmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMinigame, setSelectedMinigame] = useState<AccomplishmentData | null>(null);
    const [ratedIds, setRatedIds] = useState<string[]>([]);

    const studentId = useSelector((state: RootState) => state.user.userId);

    useEffect(() => {
        if (!studentId) return;
        (async () => {
            const data = await fetchAccomplishment();
            if (!data) return setLoading(false);
            setList(data);

            // lấy rating của từng minigame, kiểm tra xem user đã rate chưa
            const ratingLists = await Promise.all(
                data.map((m: { minigameId: string; }) => fetchMinigameRating(m.minigameId))
            );

            const done = data
                .map((m: { minigameId: string }, idx: number) => {
                    const arr = ratingLists[idx] as { studentId: string }[] ?? [];
                    return arr.some((r) => r.studentId === studentId) ? m.minigameId : null;
                })

                .filter(Boolean) as string[];

            setRatedIds(done);
            setLoading(false);
        })();
    }, [studentId]);

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
                    {list.map((item) => {
                        const hasRated = ratedIds.includes(item.minigameId);

                        return (
                            <div
                                key={item.minigameId}
                                className="bg-white rounded-xl shadow group transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                                onClick={() => !hasRated && setSelectedMinigame(item)}
                            >
                                <img
                                    src={`${baseImageUrl}${item.thumbnailImage}`}
                                    alt={item.minigameName}
                                    className="w-full h-40 object-cover rounded-t-xl"
                                />

                                <div className="p-4 space-y-1">
                                    <p className="font-semibold text-lg">{item.minigameName}</p>
                                    <p className="text-sm text-gray-600">
                                        Khóa học: <span className="font-medium">{item.courseName}</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Template: <span className="font-medium">{item.templateName}</span>
                                    </p>
                                    <p className="text-sm">
                                        Điểm: <span className="font-bold text-yellow-600">{item.score}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Ngày làm: {new Date(item.takenDate).toLocaleString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                    {hasRated && (
                                        <p className="text-xs text-green-600 font-medium">Đã đánh giá</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {selectedMinigame && (
                <RatingForm
                    isOpen={!!selectedMinigame}
                    onClose={() => setSelectedMinigame(null)}
                    studentId={studentId}
                    minigameId={selectedMinigame.minigameId}
                    onRated={(id) => {
                        setRatedIds((prev) => [...prev, id]);
                    }}
                />
            )}
        </>
    );
};

export default StudentAccomplishment;
