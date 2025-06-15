import React, { useState } from "react";
import { Trash, Image, Copy } from "lucide-react";
import { RandomCardItem } from "../../types/index";
import Header from "../../components/HomePage/Header";
import { createRandomCard } from "../../services/authService";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate } from "react-router-dom";

interface RandomCardProps {
    courseId?: string;
}

const RandomCard: React.FC<RandomCardProps> = ({ courseId }) => {
    const [activityName, setActivityName] = useState<string>("");
    const [duration, setDuration] = useState<number>(60);
    const [cards, setCards] = useState<RandomCardItem[]>([{ Text: "", Image: null }]);

    const teacherId = useSelector((state: RootState) => state.user.userId);
    const navigate = useNavigate();
    const [thumbnail, setThumbnail] = useState<File>();


    const handleKeywordChange = (index: number, value: string) => {
        setCards((prev) =>
            prev.map((card, i) => (i === index ? { ...card, Text: value } : card))
        );
    };
    const handleImageChange = (index: number, file: File | null) => {
        setCards((prev) =>
            prev.map((card, i) =>
                i === index ? { ...card, Image: file } : card
            )
        );
    };

    const handleAddMore = () => {
        setCards([...cards, { Text: "", Image: null }]);
    };

    const handleRemove = (index: number) => {
        setCards(cards.filter((_, i) => i !== index));
    };

    const handleFinish = async () => {
        if (!activityName.trim() || cards.length === 0) {
            alert("Please fill in the activity name and at least one card.");
            return;
        }

        try {
            const templateId = "TP4";

            const gameData = cards.map((card) => ({
                Text: card.Text,
                Image: card.Image || null,
            }));

            if (!thumbnail) {
                alert("Please select a thumbnail image.");
                return;
            }

            await createRandomCard({
                MinigameName: activityName,
                TeacherId: teacherId,
                TemplateId: templateId,
                Duration: duration,
                CourseId: courseId || "",
                ImageFile: thumbnail,
                GameData: gameData,
            });

            navigate("/teacher/activities");
        } catch (error) {
            console.error("Failed to create random card:", error);
            alert("Failed to create the game. Please try again.");
        }
    };

    return (
        <>
            <Header />
            <div className="w-[900px] mx-auto mt-25 p-6 border rounded-md shadow-md bg-white">
                <div>
                    <label className="font-bold text-lg">Activity name</label>
                    <input
                        className="w-full mt-2 p-2 border rounded"
                        value={activityName}
                        onChange={(e) => setActivityName(e.target.value)}
                        placeholder="Enter activity name"
                    />
                </div>

                <div className="mt-4">
                    <label className="font-bold text-lg">Duration (seconds)</label>
                    <input
                        type="number"
                        min={10}
                        max={300}
                        className="w-full mt-2 p-2 border rounded"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        placeholder="Enter duration in seconds"
                    />
                </div>
                <div className="mt-4">
                    <label className="font-bold text-lg">Thumbnail</label>
                    <div className="flex items-center gap-3 mt-2">
                        {thumbnail && (
                            <img
                                src={URL.createObjectURL(thumbnail)}
                                alt="Thumbnail"
                                className="w-20 h-20 object-cover rounded"
                            />
                        )}
                        <label
                            htmlFor="thumbnail-upload"
                            className="p-2 border rounded bg-gray-100 hover:bg-gray-300 cursor-pointer"
                        >
                            <Image size={20} />
                        </label>
                        <input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setThumbnail(file);
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-5 font-semibold border-b pb-2 mt-6">
                    <div className="col-span-2">Keyword</div>
                    <div className="col-span-2">Image</div>
                    <div className="text-center">Actions</div>
                </div>

                {cards.map((card, index) => (
                    <div key={index} className="grid grid-cols-5 items-center gap-2 mb-2 mt-3">
                        <input
                            className="col-span-2 p-2 border rounded"
                            value={card.Text}
                            onChange={(e) => handleKeywordChange(index, e.target.value)}
                            placeholder={`Keyword ${index + 1}`}
                        />
                        <div className="col-span-2 flex items-center gap-2">
                            {card.Image ? (
                                <img
                                    src={URL.createObjectURL(card.Image)}
                                    alt={`Image for ${card.Text}`}
                                    className="w-24 h-16 object-cover rounded"
                                />
                            ) : (
                                <>
                                <label
                                        htmlFor={`image-upload-${index}`}
                                        className="p-2 border rounded bg-gray-100 hover:bg-gray-300 cursor-pointer"
                                    >
                                        <Image size={16} />
                                    </label>
                                    <input
                                        id={`image-upload-${index}`}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                handleImageChange(index, file);
                                            }
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <div className="flex justify-center gap-2">
                            <button className="p-1 hover:text-blue-600">
                                <Copy size={16} />
                            </button>
                            <button
                                className="p-1 hover:bg-red-500"
                                onClick={() => handleRemove(index)}
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                <div className="flex justify-between mt-4">
                    <button
                        onClick={handleAddMore}
                        className="flex items-center px-3 py-2 text-sm bg-yellow-100 rounded hover:bg-yellow-200"
                    >
                        <span className="text-xl mr-1">+</span> Add more
                    </button>

                    <button
                        onClick={handleFinish}
                        className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500"
                    >
                        Finish
                    </button>
                </div>
            </div>
        </>
    );
};

export default RandomCard;
