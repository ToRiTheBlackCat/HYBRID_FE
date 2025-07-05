import React, { useState, useEffect } from "react";
import {RandomCardItem} from "../../types/index";
import { motion, AnimatePresence } from "framer-motion";
import cardBack from "../../assets/card-back.jpg";
import Header from "../../components/HomePage/Header";
import Footer from "../../components/HomePage/Footer";
import { fetchPlayMinigames } from "../../services/authService";
import { useParams } from "react-router-dom";
import { baseImageUrl } from "../../config/base";
import EditRandomCard from "../../pages/Teacher/Template/EditRandomCard" 
import RandomCardRaw from "../Teacher/RawMinigameInfo/RandomCard";

const RandomCardReview: React.FC = () => {
    const [deck, setDeck] = useState<RandomCardItem[]>([]);
    const [currentCard, setCurrentCard] = useState<RandomCardItem | null>(null);
    const [drawnCards, setDrawnCards] = useState<RandomCardItem[]>([]);
    const [drawnIndex, setDrawnIndex] = useState<number>(0);
    const [isSuffling, setIsShuffling] = useState(false);
    const [isUndoing, setIsUndoing] = useState(false);
    const { minigameId } = useParams();
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [activityName, setActivityName] = useState("");
    const [duration, setDuration] = useState<number>(0)
    const [originalDeck, setOriginalDeck] = useState<RandomCardItem[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);

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

    const normalizeUrl = (base: string, path: string): string => {
        return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!minigameId) return;
            const data = await fetchPlayMinigames(minigameId);
            const thumbnailUrl = data.thumbnailImage ? normalizeUrl(baseImageUrl, data.thumbnailImage) : null;
            setActivityName(data.minigameName);
            setDuration(data.duration);
            setThumbnailUrl(thumbnailUrl);

            if (data?.dataText) {
                const parser = new DOMParser();
                const xml = parser.parseFromString(data.dataText, "text/xml");
                const questions = await Promise.all(
                    Array.from(xml.getElementsByTagName("question")).map(async (q) => {
                        const text = q.getElementsByTagName("text")[0]?.textContent?.trim() || "";
                        const imageURL = q.getElementsByTagName("image")[0]?.textContent?.trim() || "";
                        const finalUrl = baseImageUrl + imageURL;
                        try {
                            const response = await fetch(finalUrl);
                            const blob = await response.blob();
                            const file = new File([blob], "image.jpg", { type: blob.type });
                            return { Text: text, Image: file } as RandomCardItem;
                        } catch (error) {
                            console.error("Image fetch failed", error);
                            return { Text: text, Image: null } as RandomCardItem;
                        }
                    })
                );
                setDeck(questions);
                setOriginalDeck(questions);
            }
        };
        fetchData();
    }, [minigameId]);

    return (
        <>
            <Header />

            {!isPlaying ? (
                <RandomCardRaw onStart={() => setIsPlaying(true)} />
            ) : (
                <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8">
                    <div className="max-w-6xl mx-auto px-4">
                        
                        {/* Header thông tin */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">{activityName}</h1>
                            <div className="flex justify-center items-center gap-4 text-gray-600">
                                <span className="bg-white px-4 py-2 rounded-full shadow-sm">
                                    🎯 {deck.length} cards remaining
                                </span>
                                <span className="bg-white px-4 py-2 rounded-full shadow-sm">
                                    🎴 {drawnCards.length} cards drawn
                                </span>
                            </div>
                        </div>

                        {/* Main game area */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                            <div className="flex justify-center items-center gap-16 min-h-[400px]">
                                
                                {/* Deck area */}
                                <div className="flex flex-col items-center gap-4">
                                    <h3 className="text-xl font-semibold text-gray-700">Deck</h3>
                                    <motion.div
                                        className="relative w-48 h-64 cursor-pointer group"
                                        onClick={handleDrawCard}
                                        animate={isSuffling ? { rotate: [0, 10, -10, 0] } : {}}
                                        transition={{ duration: 0.6 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        {deck.length > 0 ? (
                                            <>
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
                                                            className="absolute w-full h-full rounded-xl shadow-lg border-2 border-gray-200"
                                                            style={{ top: i * 3, left: i * 3, zIndex: i }}
                                                        />
                                                    );
                                                })}
                                                <div className="absolute inset-0 flex flex-col justify-center items-center text-white font-bold z-10">
                                                    <div className="text-lg">Draw Card</div>
                                                    <div className="text-sm opacity-75">Click to draw</div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                                                <div className="text-4xl mb-2">🎴</div>
                                                <div className="text-lg font-semibold">No Cards</div>
                                                <div className="text-sm">Shuffle to refill</div>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                {/* VS divider */}
                                <div className="flex flex-col items-center text-gray-400">
                                    <div className="w-px h-32 bg-gray-300"></div>
                                    <div className="bg-gray-100 rounded-full p-3 my-4">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="w-px h-32 bg-gray-300"></div>
                                </div>

                                {/* Current card area */}
                                <div className="flex flex-col items-center gap-4">
                                    <h3 className="text-xl font-semibold text-gray-700">Current Card</h3>
                                    <div className="w-48 h-64 flex items-center justify-center">
                                        <AnimatePresence>
                                            {currentCard ? (
                                                <motion.div
                                                    key={currentCard.Text}
                                                    initial={isUndoing ? { opacity: 1, x: 0 } : { opacity: 0, y: -20, scale: 0.8 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                                                    className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 border-4 border-blue-400 rounded-xl p-4 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden"
                                                >
                                                    {/* Decorative elements */}
                                                    <div className="absolute top-2 right-2 w-4 h-4 bg-blue-400 rounded-full"></div>
                                                    <div className="absolute bottom-2 left-2 w-4 h-4 bg-blue-400 rounded-full"></div>
                                                    
                                                    {currentCard.Image ? (
                                                        <img
                                                            src={URL.createObjectURL(currentCard.Image)}
                                                            alt={currentCard.Text}
                                                            className="h-32 mb-4 object-contain rounded-lg shadow-md"
                                                        />
                                                    ) : (
                                                        <div className="h-32 mb-4 flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg w-full">
                                                            <div className="text-center">
                                                                <div className="text-2xl mb-2">🖼️</div>
                                                                <div className="text-sm">No Image</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <p className="text-center font-bold text-lg text-gray-800 leading-tight">
                                                        {currentCard.Text}
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <div className="w-full h-full rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                                                    <div className="text-4xl mb-2">✨</div>
                                                    <div className="text-lg font-semibold">Draw a Card</div>
                                                    <div className="text-sm text-center">Click the deck to<br/>reveal a card</div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex justify-center gap-4 mb-8">
                            <motion.button
                                onClick={handleSuffleDeck}
                                disabled={isSuffling}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl shadow-lg text-white font-semibold flex items-center gap-2 transition-all duration-200"
                            >
                                <span className="text-lg">🔄</span>
                                {isSuffling ? "Shuffling..." : "Shuffle Deck"}
                            </motion.button>

                            <motion.button
                                onClick={handleUndo}
                                disabled={drawnCards.length === 0 || isUndoing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl shadow-lg text-white font-semibold flex items-center gap-2 transition-all duration-200"
                            >
                                <span className="text-lg">↩️</span>
                                {isUndoing ? "Undoing..." : "Undo"}
                            </motion.button>

                            <motion.button
                                onClick={handleDrawCard}
                                disabled={deck.length === 0}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl shadow-lg text-white font-semibold flex items-center gap-2 transition-all duration-200"
                            >
                                <span className="text-lg">🎯</span>
                                Draw Card
                            </motion.button>
                        </div>

                        {/* Edit component */}
                        <div className="flex justify-center">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <EditRandomCard
                                    key={originalDeck.length}
                                    initialActivityName={activityName}
                                    initialDuration={duration}
                                    initialRandomCard={deck.map((item) => ({
                                        Text: item.Text,
                                        Image: item.Image,
                                        ImageUrl: "",
                                    }))}
                                    initialThumbnailUrl={thumbnailUrl ?? ""}
                                    onSave={(newData) => {
                                        setActivityName(newData.activityName);
                                        setDuration(newData.duration);
                                        setThumbnailUrl(newData.thumbnailUrl);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}

export default RandomCardReview;