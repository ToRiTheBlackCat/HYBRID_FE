import React, { useState } from "react";
import { Trash, Image, Copy } from "lucide-react";
import { RandomCardItem } from "../../types/index";
import {fetchImage} from "../../services/userService";
import Header from "../../components/HomePage/Header";

const RandomCard: React.FC = () => {
    const [activityName, setActivityName] = useState<string>("");
    const [cards, setCards] = useState<RandomCardItem[]>([{
        keyword: "",
        imageURL: "",
    }
    ]);

    const handleKeywordChange = (index: number, value: string) => {
        setCards((prev)=>
            prev.map((card, i) => 
                i == index ? {...card, keyword: value} : card
            )
        );
    };
    const handleAddMore = () => {
        setCards([...cards, { keyword: "", imageURL: "" }]);
    }
    const handleRemove = (index: number) => {
        setCards(cards.filter((_, i) => i !== index));
    }

    return (
        <>
        <Header/>
            <div className="w-[900px] mx-auto mt-25 p-6 border rounded-md shadow-md bg-white">
                <div>
                    <label className="font-bold text-lg">Activity name</label>
                </div>
                <input
                    className="w-full mt-2 p-2 border rounded"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="Enter activity name"
                />
                <div className="grid grid-cols-5 font-semibold border-b pb-2 mt-3">
                    <div className="col-span-2">Keyword</div>
                    <div className="col-span-2">Image</div>
                    <div className="text-center">Actions</div>  
                </div>
                {cards.map((card, index) => (
                    <div key={index} className="grid grid-cols-5 items-center gap-2 mb-2 mt-3">
                        <input
                            className="col-span-2 p-2 border rounded"
                            value={card.keyword}
                            onChange={(e) => handleKeywordChange(index, e.target.value)}
                            onBlur={() => fetchImage}
                            placeholder={`Keyword ${index + 1}`}
                        />
                        <div className="col-span-2 flex items-center gap-2">
                            {card.imageURL ? (
                                <img 
                                    src={card.imageURL}
                                    alt={`Image for ${card.keyword}`}
                                    className="w-full h-16 object-cover rounded"
                                />
                            ): (
                                <button 
                                    onClick={() => fetchImage}
                                    className="p-2 border rounded bg-gray-100 hover:bg-gray-300"
                                    >
                                        <Image size={16}/>
                                </button>
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
                                    <Trash size={16}/>
                            </button>
                        </div>
                    </div>
                ))}
                <div className="flex justify-between">
                    <button 
                        onClick={handleAddMore}
                        className="flex items-center px-3 py-2 text-sm bg-yellow-100 rounded hover:bg-yellow-200"
                    >
                        <span className="text-xl mr-1">+</span> Add more
                    </button>

                    <button 
                        onClick={() => window.location.href = "/random-card-review"}
                        className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500">
                        Finish
                    </button>
                </div>
            </div>
        </>
    )
}
export default RandomCard;