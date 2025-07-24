import React, { useState, useEffect, useCallback } from "react";
import { Minigame, RandomCardItem } from "../../../types/index";
import { motion, AnimatePresence } from "framer-motion";
import cardBack from "../../../assets/card-back.jpg";
import Header from "../../../components/HomePage/Header";
import Footer from "../../../components/HomePage/Footer";
import { fetchPlayMinigames, submitAccomplishment, fetchCourseMinigame } from "../../../services/authService";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { baseImageUrl } from "../../../config/base";
import { Accomplishment } from "../../../types/index";
import { toast } from "react-toastify";
import { getLocalISOTime } from "../../../services/userService";

const normalize = (base: string, path: string) =>
    `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}?t=${Date.now()}`;

const PAGE_SIZE = 50;

// Map templateId → route segment; keep in sync with router
const paths: Record<string, string> = {
    TP1: "conjunction",
    TP2: "quiz",
    TP3: "anagram",
    TP4: "random-card",
    TP5: "spelling",
    TP6: "flashcard",
    TP7: "completion",
    TP8: "pairing",
    TP9: "restoration",
    TP10: "find-word",
    TP11: "true-false",
    TP12: "crossword",
};

const PlayRandomCard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const courseIdFromState: string | undefined = (location.state as { courseId?: string })?.courseId;
    const [courseMinigames, setCourseMinigames] = useState<Minigame[]>([]);
    const [deck, setDeck] = useState<RandomCardItem[]>([]);
    const [currentCard, setCurrentCard] = useState<RandomCardItem | null>(null);
    const [drawnCards, setDrawnCards] = useState<RandomCardItem[]>([]);
    const [drawnIndex, setDrawnIndex] = useState<number>(0);
    const [isSuffling, setIsShuffling] = useState(false);
    const [isUndoing, setIsUndoing] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { minigameId } = useParams();

    const handleDrawCard = () => {
        if (deck.length == 0) return;
        const index = deck.length - 1;
        const selected = deck[index];
        setDrawnIndex(index);
        setCurrentCard(selected);
        setDrawnCards(prev => [...prev, selected]);
        setTimeout(() => {
            setDeck(prev => prev.filter((_, i) => i !== index));
            setDrawnIndex(0);
        }, 500);
    };

    const handleSuffleDeck = () => {
        setIsShuffling(true);
        setTimeout(() => {
            const combine = [...deck, ...drawnCards];
            const shuffledDeck = combine.sort(() => Math.random() - 0.5);
            setDeck(shuffledDeck);
            setDrawnCards([]);
            setCurrentCard(null);
            setIsShuffling(false);
        }, 600);
    };

    const handleUndo = () => {
        if (drawnCards.length === 0) return;
        setIsUndoing(true);
        setTimeout(() => {
            const lastCard = drawnCards[drawnCards.length - 1];
            setDrawnCards(prev => prev.slice(0, -1));
            setDeck(prev => [lastCard, ...prev]);
            setCurrentCard(null);
            setIsUndoing(false);
        }, 400);
    };

    const handleSubmit = useCallback(async () => {
        if (!minigameId || drawnCards.length === 0) return;

        const percent = Math.round((drawnCards.length / (drawnCards.length + deck.length)) * 100);
        const payload: Accomplishment = {
            MinigameId: minigameId,
            Percent: percent,
            DurationInSecond: 0,
            TakenDate: getLocalISOTime(),
        } as unknown as Accomplishment;

        try {
            await submitAccomplishment(payload);
            toast.success(`✅ You completed ${percent}% of the deck!`);
        } catch (err) {
            console.error("submitAccomplishment error:", err);
            toast.error("❌ Failed to submit accomplishment.");
        }
    }, [minigameId, drawnCards.length, deck.length]);

    useEffect(() => {
        const fetchData = async () => {
            if (!minigameId) return;
            const data = await fetchPlayMinigames(minigameId);
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
            }
        };
        fetchData();
    }, [minigameId]);

    useEffect(() => {
        if (!courseIdFromState) return;
        const load = async () => {
            try {
                const res = await fetchCourseMinigame(courseIdFromState, {
                    PageNum: 1,
                    PageSize: PAGE_SIZE,
                });
                setCourseMinigames(res?.minigames ?? []);
            } catch (err) {
                console.error("Error loading course minigames", err);
            }
        };
        load();
    }, [courseIdFromState]);

    const totalCards = deck.length + drawnCards.length;
    const progressPercentage = totalCards > 0 ? Math.round((drawnCards.length / totalCards) * 100) : 0;

    return (
        <>
            <Header />
            <div className="min-h-screen mt-20 bg-gradient-to-br from-purple-50 to-pink-100 relative">
                {/* Sidebar */}
                {courseMinigames.length > 0 && (
                    <>
                        {/* Mobile sidebar toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="fixed top-24 right-4 z-50 bg-white p-2 rounded-full shadow-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Sidebar overlay */}
                        {sidebarOpen && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                                onClick={() => setSidebarOpen(false)}
                            />
                        )}

                        {/* Sidebar */}
                        <aside className={`fixed top-24 right-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] z-40 transition-transform duration-300 ${
                            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}>
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <span className="text-xl">🎮</span>
                                    Other Games
                                </h3>
                                <p className="text-sm opacity-90">{courseMinigames.length} games available</p>
                            </div>
                            <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
                                {courseMinigames.map((mg) => {
                                    const isActive = mg.minigameId === minigameId;
                                    const path = paths[mg.templateId];
                                    return (
                                        <button
                                            key={mg.minigameId}
                                            onClick={() => {
                                                navigate(`/student/${path}/${mg.minigameId}`, {
                                                    state: { courseId: courseIdFromState },
                                                });
                                                setSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                                                isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                            }`}
                                            disabled={isActive}
                                        >
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={normalize(baseImageUrl, mg.thumbnailImage)}
                                                    alt={mg.minigameName}
                                                    className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-medium text-sm truncate ${isActive ? "text-blue-700" : "text-gray-900"}`}>
                                                    {mg.minigameName}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{mg.templateName}</p>
                                            </div>
                                            {isActive && (
                                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>
                    </>
                )}

                {/* Main content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* Progress bar */}
                        <div className="mb-8">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800">Random Card Game</h2>
                                    <div className="flex items-center gap-4">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                            {deck.length} cards left
                                        </span>
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                            {drawnCards.length} drawn
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <motion.div
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-2 text-center">
                                    Progress: {progressPercentage}% completed
                                </p>
                            </div>
                        </div>

                        {/* Game area */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                            <div className="flex justify-center items-center gap-16 min-h-[450px]">
                                
                                {/* Deck area */}
                                <div className="flex flex-col items-center gap-6">
                                    <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                                        <span className="text-2xl">🎴</span>
                                        Card Deck
                                    </h3>
                                    <motion.div
                                        className="relative w-52 h-72 cursor-pointer group"
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
                                                                y: isDrawing ? -50 : 0,
                                                                scale: isDrawing ? 1.2 : 1,
                                                            }}
                                                            transition={{ duration: 0.5 }}
                                                            className="absolute w-full h-full rounded-xl shadow-lg border-2 border-gray-200"
                                                            style={{ top: i * 3, left: i * 3, zIndex: i }}
                                                        />
                                                    );
                                                })}
                                                <div className="absolute inset-0 flex flex-col justify-center items-center text-white font-bold z-10 group-hover:scale-110 transition-transform">
                                                    <div className="text-3xl mb-2">🎯</div>
                                                    <div className="text-xl">Draw Card</div>
                                                    <div className="text-sm opacity-75">Click to draw</div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                                <div className="text-5xl mb-4">🎴</div>
                                                <div className="text-xl font-bold">Empty Deck</div>
                                                <div className="text-sm">Shuffle to refill</div>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Arrow divider */}
                                <div className="flex flex-col items-center text-gray-400">
                                    <div className="w-px h-40 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 my-4 shadow-lg">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="w-px h-40 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                                </div>

                                {/* Current card area */}
                                <div className="flex flex-col items-center gap-6">
                                    <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                                        <span className="text-2xl">✨</span>
                                        Current Card
                                    </h3>
                                    <div className="w-52 h-72 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            {currentCard ? (
                                                <motion.div
                                                    key={currentCard.Text}
                                                    initial={isUndoing ? { opacity: 1, x: 0 } : { opacity: 0, y: -30, scale: 0.8 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    transition={{ duration: 0.6, type: "spring", stiffness: 300 }}
                                                    className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-blue-400 rounded-xl p-4 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden"
                                                >
                                                    {/* Decorative elements */}
                                                    <div className="absolute top-3 right-3 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                                                    <div className="absolute bottom-3 left-3 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
                                                    
                                                    {currentCard.Image ? (
                                                        <img
                                                            src={URL.createObjectURL(currentCard.Image)}
                                                            alt={currentCard.Text}
                                                            className="h-36 mb-4 object-contain rounded-lg shadow-md"
                                                        />
                                                    ) : (
                                                        <div className="h-36 mb-4 flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg w-full">
                                                            <div className="text-center">
                                                                <div className="text-3xl mb-2">🖼️</div>
                                                                <div className="text-sm">No Image</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <p className="text-center font-bold text-lg text-gray-800 leading-tight">
                                                        {currentCard.Text}
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <div className="w-full h-full rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                                    <div className="text-5xl mb-4">🎯</div>
                                                    <div className="text-xl font-bold">Ready to Draw</div>
                                                    <div className="text-sm text-center">Click the deck to<br/>reveal your card</div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex justify-center gap-4 flex-wrap">
                            <motion.button
                                onClick={handleSuffleDeck}
                                disabled={isSuffling}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-lg text-white font-bold flex items-center gap-3 transition-all duration-200"
                            >
                                <span className="text-xl">🔄</span>
                                {isSuffling ? "Shuffling..." : "Shuffle Deck"}
                            </motion.button>

                            <motion.button
                                onClick={handleUndo}
                                disabled={drawnCards.length === 0 || isUndoing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-lg text-white font-bold flex items-center gap-3 transition-all duration-200"
                            >
                                <span className="text-xl">↩️</span>
                                {isUndoing ? "Undoing..." : "Undo"}
                            </motion.button>

                            <motion.button
                                onClick={handleDrawCard}
                                disabled={deck.length === 0}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-lg text-white font-bold flex items-center gap-3 transition-all duration-200"
                            >
                                <span className="text-xl">🎯</span>
                                Draw Card
                            </motion.button>

                            <motion.button
                                onClick={handleSubmit}
                                disabled={drawnCards.length === 0}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl shadow-lg text-white font-bold flex items-center gap-3 transition-all duration-200"
                            >
                                <span className="text-xl">🏆</span>
                                Finish Game
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PlayRandomCard;