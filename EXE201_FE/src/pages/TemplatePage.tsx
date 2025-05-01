import Anagram from "../assets/TemplateLogo/Anagram.jpg";
import Completion from "../assets/TemplateLogo/Completion.jpg";
import Conjunction from "../assets/TemplateLogo/Conjunction.jpg";
import Crossword from "../assets/TemplateLogo/Crossword.jpg";
import DragDrop from "../assets/TemplateLogo/DragDrop.jpg";
import RandomCard from "../assets/TemplateLogo/RandomCard.jpg";
import Restoration from "../assets/TemplateLogo/Restoration.jpg";
import Pairing from "../assets/TemplateLogo/Pairing.jpg";
import FindWord from "../assets/TemplateLogo/FindWord.jpg";
import TrueFalse from "../assets/TemplateLogo/TrueFalse.jpg";
import FlashCard from "../assets/TemplateLogo/Flashcard.jpg";
import Reading from "../assets/TemplateLogo/Reading.jpg";
import SongPuzzle from "../assets/TemplateLogo/SongPuzzle.jpg";
import Spelling from "..//assets/TemplateLogo/Spelling.jpg";
import Quiz from "../assets/TemplateLogo/Quiz.jpg";
import Pronunciation from "../assets/TemplateLogo/Pronunciation.jpg";

import Header from "../components/HomePage/Header";
import React, {useState} from "react";

const TemplatePage: React.FC = () => {
    const [showMoreBasic, setShowMoreBasic] = useState(false);
    const [showMorePremium, setShowMorePremium] = useState(false);
    const freeTemplates = [
        { title: "Conjunction", image: Conjunction },
        { title: "Anagram", image: Anagram },
        { title: "Quiz", image: Quiz },
        { title: "Random Card", image: RandomCard },
        { title: "Spelling", image: Spelling},
        { title: "Flashcard", image: FlashCard },
      ];
    const basicTemplates = [
        {title: "Completion", image: Completion },
        {title: "Pairing", image: Pairing },
        {title: "Restoration", image: Restoration },
        {title: "Find Word", image: FindWord },
        {title: "True/False", image: TrueFalse },
        {title: "Crossword", image: Crossword },
    ] 
    const premiumTemplates = [
        {title: "Drag & Drop", image: DragDrop },
        {title: "Song Puzzle", image: SongPuzzle},
        {title: "Reading", image: Reading },
        {title: "Completion", image: Completion },
        {title: "Quiz", image: Quiz },
        {title: "Pronunciation", image: Pronunciation },
    ]

    return (
        <>
        <Header/>
            <section className="bg-white text-center mt-20 mb-10">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-10">
                    How to use our <span className="text-blue-600 text-7xl font-bold relative inline-block">
                    Platform
                    <span className="absolute -top-2 -right-6 text-blue-400 text-xl">✨</span>
                    </span>
                </h2>
                <div className="flex flex-col md:flex-row justify-center gap-10 text-gray-700">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Step 1:</h3>
                        <p className="text-sm">Choose a template<br />from our platform</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Step 2:</h3>
                        <p className="text-sm">Input your data</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Step 3:</h3>
                        <p className="text-sm">Post your activity</p>
                    </div>
                </div>
            </section>
            <div className="w-full h-[80px] bg-gradient-to-r from-blue-400 to-white"></div>
            <section className="py-12 px-4 md:px-16 bg-white text-center">
                <h2 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-300 pb-2 w-fit mx-auto">
                    Free templates
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 w-full gap-6 justify-items-center">
                    {freeTemplates.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center border rounded-2xl overflow-hidden w-[350px] h-[150px] max-w-sm hover:shadow-md transition"
                    >
                        <div className="w-[250px] h-[147px] rounded-lg overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                        <p className="text-gray-800 font-semibold">{item.title}</p>
                    </div>
                    ))}
                </div>    
                <button
                    className="mt-8 bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
                    onClick={() => setShowMoreBasic(!showMoreBasic)}
                >
                    {showMoreBasic ? "SHOW LESS" : "SEE MORE"}
                </button>
            </section>
            {showMoreBasic && (
                <section className="py-12 px-4 md:px-16 bg-white text-center">
                <h2 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-300 pb-2 w-fit mx-auto">
                    Basic templates
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 w-full gap-6 justify-items-center">
                    {basicTemplates.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center border rounded-2xl overflow-hidden w-[350px] h-[150px] max-w-sm hover:shadow-md transition"
                    >
                        <div className="w-[250px] h-[147px] rounded-lg overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                        <p className="text-gray-800 font-semibold">{item.title}</p>
                    </div>
                    ))}
                </div>    
                <button
                    className="mt-8 bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
                    onClick={() => setShowMorePremium(!showMorePremium)}
                >
                    {showMorePremium ? "SHOW LESS" : "SEE MORE"}
                </button>
            </section>
            )}
            {showMorePremium && (
                <section className="py-12 px-4 md:px-16 bg-white text-center">
                <h2 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-300 pb-2 w-fit mx-auto">
                    Premium templates
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 w-full gap-6 justify-items-center">
                    {premiumTemplates.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center border rounded-2xl overflow-hidden w-[350px] h-[150px] max-w-sm hover:shadow-md transition"
                    >
                        <div className="w-[250px] h-[147px] rounded-lg overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                        </div>
                        <p className="text-gray-800 font-semibold">{item.title}</p>
                    </div>
                    ))}
                </div>    
                {/* <button
                    className="mt-8 bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
                    onClick={() => setShowMorePremium(!showMorePremium)}
                >
                    {showMorePremium ? "SHOW LESS" : "SEE MORE"}
                </button> */}
            </section>
            )}

        </>
    )
}
export default TemplatePage;