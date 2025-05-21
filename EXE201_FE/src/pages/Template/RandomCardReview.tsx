import React, { useState } from "react";
import {RandomCardItem} from "../../types/index";
import { motion, AnimatePresence } from "framer-motion";
import cardBack from "../../assets/card-back.jpg";
import Header from "../../components/HomePage/Header";
import Footer from "../../components/HomePage/Footer";

const initailCards: RandomCardItem[] = [
    { keyword: "Snake", imageURL: "https://example.com/snake.jpg" },
    { keyword: "Dog", imageURL: "https://example.com/dog.jpg" },
    { keyword: "Cat", imageURL: "https://example.com/cat.jpg" },
    { keyword: "Fish", imageURL: "https://example.com/fish.jpg" },
    { keyword: "Bird", imageURL: "https://example.com/bird.jpg" },
    { keyword: "Elephant", imageURL: "https://example.com/elephant.jpg" },
    { keyword: "Lion", imageURL: "https://example.com/lion.jpg" },
    { keyword: "Tiger", imageURL: "https://example.com/tiger.jpg" },
]

const RandomCardReview: React.FC = () => {
    const [deck, setDeck] = useState<RandomCardItem[]>(initailCards);
    const [currentCard, setCurrentCard] = useState<RandomCardItem | null>(null);
    const [drawnCards, setDrawnCards] = useState<RandomCardItem[]>([]);
    const [drawnIndex, setDrawnIndex] = useState<number>(0);
    const [isSuffling, setIsShuffling] = useState(false);
    const [isUndoing, setIsUndoing] = useState(false);

    const handleDrawCard = () => {
        if(deck.length == 0)
            return;
        const index = deck.length - 1;
        const selected = deck[index];
        setDrawnIndex(index);
        setCurrentCard(selected);
        setDrawnCards(prev => [...prev, selected]); 
        setTimeout(() => {
            setDeck(prev => prev.filter((_, i) => i !== index));
            setDrawnIndex(0)
        }, 500);
    }

    const handleSuffleDeck = () => {
        setIsShuffling(true);
        setTimeout(() => {
            const combine = [...deck, ...drawnCards];
            const shuffledDeck = combine.sort(() => Math.random() - 0.5);
            setDeck(shuffledDeck);
            setDrawnCards([]);
            setCurrentCard(null);
            setIsShuffling(false);
        },600);

    }

    const handleUndo = () => {
        if(drawnCards.length === 0)
            return;
        setIsUndoing(true);
        setTimeout(() => {
            const lastCard = drawnCards[drawnCards.length - 1];
            setDrawnCards(prev => prev.slice(0, -1));
            setDeck(prev => [lastCard, ...prev]);
            setCurrentCard(null);
            setIsUndoing(false);
        }, 400);
    }

    return (
        <>
        <Header/>
        <div className="w-[900px] mt-25 mb-55 mx-auto flex flex-col items-center gap-6">
            <div className="flex border bg-green-300 p-8 rounded-md justify-center items-center gap-10 w-full">
                <motion.div 
                    className="relative w-40 h-56 cursor-pointer " 
                    onClick={handleDrawCard}
                    animate= {isSuffling ? { rotate: [0 ,10, -10, 0] } : {}}
                    transition={{ duration: 0.6 }}>
                    {deck.slice(-5).map((_, i, arr) => {
                        const globalIndex = deck.length - arr.length + i;
                        const isDrawing = globalIndex === drawnIndex;
                        return (
                            <motion.img
                            key={globalIndex}
                            src={cardBack}
                            initial={{ opacity: 1, y: 0 }}
                            animate={{
                                opacity: isDrawing ? 0 : 1,
                                y: isDrawing ? -40 : 0,
                                scale: isDrawing ? 1.2 : 1,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute w-full h-full rounded-md shadow-lg"
                            style={{ top: i * 2, left: i * 2, zIndex: i }}
                            />
                        );
                    })}
                    <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center text-white font-bold">
                        Draw
                    </div>
                </motion.div>

                <AnimatePresence>
                    {currentCard && (
                        <motion.div
                           key={currentCard.keyword}
                           initial ={isUndoing ? {opacity: 1, x: 0} : {opacity: 0, y: -20}}
                           animate ={isUndoing ? {opacity: 1, y: 0} : {opacity: 1, y: 0}}
                           transition={{ duration: 0.5 }}
                           exit={{ opacity: 0 }}
                           className="w-40 h-56 bg-white border-4 border-red-400 rounded-md p-3 shadow-lg flex flex-col items-center justify-center"
                        >
                            <img src={currentCard.imageURL} alt={currentCard.keyword} className="h-24 mb-2 object-contain" />
                            <p className="text-center font-semibold text-lg">{currentCard.keyword}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="flex gap-6">
                <motion.button
                    onClick={handleSuffleDeck}
                    whileTap={{scale: 0.9, rotate: -10}}
                    className="bg-yellow-300 hover:bg-yellow-500 px-4 py-2 rounded shadow text-black font-semibold">
                        Shuffle
                </motion.button>
                <motion.button
                    onClick={handleUndo}
                    whileTap={{scale: 1.1, x: -10}}
                    className="bg-gray-300 hover:bg-gray-500 px-4 py-2 rounded shadow text-white font-semibold">
                        Undo
                </motion.button>
                <motion.button
                    onClick={handleDrawCard}
                    whileTap={{scale: 1.1}}
                    className="bg-blue-400 hover:bg-blue-600 px-4 py-2 rounded shadow text-white font-semibold">
                        Draw
                </motion.button>

            </div>
        </div>
        <Footer/>
        </>
    )
}
export default RandomCardReview; 