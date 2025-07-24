import React, { useState } from "react";
import { Trash, Image, Copy, Plus, Upload, X } from "lucide-react";
import { RandomCardItem } from "../../types/index";
// import Header from "../../components/HomePage/Header";
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
    const removeThumbnail = () => {
        setThumbnail(undefined);
    };
    const removeCardImage = (index: number) => {
        const newCards = [...cards];
        newCards[index].Image = null;
        setCards(newCards);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
            <div className="max-w-4xl mx-auto p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Activity</h1>
                    <p className="text-gray-600">Design your interactive learning activity</p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                        <h2 className="text-xl font-semibold text-white">Activity Details</h2>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        {/* Activity Name */}
                        <div className="space-y-3">
                            <label className="block text-lg font-semibold text-gray-700">
                                Activity Name
                            </label>
                            <input
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700"
                                value={activityName}
                                onChange={(e) => setActivityName(e.target.value)}
                                placeholder="Enter a descriptive activity name"
                            />
                        </div>

                        {/* Duration */}
                        <div className="space-y-3">
                            <label className="block text-lg font-semibold text-gray-700">
                                Duration (seconds)
                            </label>
                            <input
                                type="number"
                                min={10}
                                max={300}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                placeholder="Duration between 10-300 seconds"
                            />
                        </div>

                        {/* Thumbnail */}
                        <div className="space-y-3">
                            <label className="block text-lg font-semibold text-gray-700">
                                Activity Thumbnail
                            </label>
                            <div className="flex items-center gap-4">
                                {thumbnail ? (
                                    <div className="relative group">
                                        <img
                                            src={URL.createObjectURL(thumbnail)}
                                            alt="Thumbnail"
                                            className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
                                        />
                                        <button
                                            onClick={removeThumbnail}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="thumbnail-upload"
                                        className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                                    >
                                        <Upload size={24} className="text-gray-400 group-hover:text-blue-500" />
                                    </label>
                                )}
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
                                <div className="text-sm text-gray-500">
                                    <p className="font-medium">Upload thumbnail image</p>
                                    <p>JPG, PNG up to 5MB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cards Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-8">
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
                        <h2 className="text-xl font-semibold text-white">Activity Cards</h2>
                    </div>
                    
                    <div className="p-8">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-4 pb-4 mb-6 border-b-2 border-gray-100">
                            <div className="col-span-4 text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                Keyword
                            </div>
                            <div className="col-span-5 text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                Image
                            </div>
                            <div className="col-span-3 text-sm font-semibold text-gray-600 uppercase tracking-wide text-center">
                                Actions
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="space-y-4">
                            {cards.map((card, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                                    <div className="col-span-4">
                                        <input
                                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-700"
                                            value={card.Text}
                                            onChange={(e) => handleKeywordChange(index, e.target.value)}
                                            placeholder={`Keyword ${index + 1}`}
                                        />
                                    </div>
                                    
                                    <div className="col-span-5">
                                        {card.Image ? (
                                            <div className="relative group">
                                                <img
                                                    src={URL.createObjectURL(card.Image)}
                                                    alt={`Image for ${card.Text}`}
                                                    className="w-20 h-16 object-cover rounded-lg border-2 border-gray-200"
                                                />
                                                <button
                                                    onClick={() => removeCardImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ) : (
                                            <label
                                                htmlFor={`image-upload-${index}`}
                                                className="flex items-center justify-center w-20 h-16 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                                            >
                                                <Image size={16} className="text-gray-400 group-hover:text-blue-500" />
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
                                            </label>
                                        )}
                                    </div>

                                    <div className="col-span-3 flex justify-center gap-2">
                                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200">
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                                            onClick={() => handleRemove(index)}
                                            disabled={cards.length === 1}
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleAddMore}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl hover:from-yellow-500 hover:to-orange-500 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <Plus size={20} />
                                Add More Card
                            </button>

                            <button
                                onClick={handleFinish}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                            >
                                Complete Activity
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RandomCard;
