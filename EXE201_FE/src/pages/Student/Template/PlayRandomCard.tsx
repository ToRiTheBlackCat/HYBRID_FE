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
            TakenDate: new Date(),
        };

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

    return (
        <>
            <Header />
            <div className="w-[900px] mt-25 mb-55 mx-auto flex flex-col items-center gap-6">
                {courseMinigames.length > 0 && (
                    <aside className="absolute top-24 right-4 w-60 bg-white border rounded-lg shadow-md overflow-auto max-h-[80vh]">
                        <h3 className="font-bold text-center py-2 border-b">Other games</h3>
                        {courseMinigames.map((mg) => {
                            const isActive = mg.minigameId === minigameId;
                            const path = paths[mg.templateId];
                            return (
                                <button
                                    key={mg.minigameId}
                                    onClick={() =>
                                        navigate(`/student/${path}/${mg.minigameId}`, {
                                            state: { courseId: courseIdFromState },
                                        })
                                    }
                                    className={`w-full flex items-center gap-2 text-left px-3 py-2 text-sm hover:bg-blue-50 ${isActive ? "bg-blue-100 font-semibold" : ""
                                        }`}
                                    disabled={isActive}
                                >
                                    <img
                                        src={normalize(baseImageUrl, mg.thumbnailImage)}
                                        alt={mg.minigameName}
                                        className="w-10 h-10 object-cover rounded"
                                    />
                                    <div className="flex flex-col">
                                        <span className="line-clamp-2">{mg.minigameName}</span>
                                        <span className="line-clamp-2 text-gray-500 text-xs">{mg.templateName}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </aside>
                )}
                <div className="flex border bg-green-300 p-8 rounded-md justify-center items-center gap-10 w-full">
                    <motion.div
                        className="relative w-40 h-56 cursor-pointer "
                        onClick={handleDrawCard}
                        animate={isSuffling ? { rotate: [0, 10, -10, 0] } : {}}
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
                                key={currentCard.Text}
                                initial={isUndoing ? { opacity: 1, x: 0 } : { opacity: 0, y: -20 }}
                                animate={isUndoing ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                exit={{ opacity: 0 }}
                                className="w-40 h-56 bg-white border-4 border-red-400 rounded-md p-3 shadow-lg flex flex-col items-center justify-center"
                            >
                                {currentCard.Image ? (
                                    <img
                                        src={URL.createObjectURL(currentCard.Image)}
                                        alt={currentCard.Text}
                                        className="h-24 mb-2 object-contain"
                                    />
                                ) : (
                                    <div className="h-24 mb-2 flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <p className="text-center font-semibold text-lg">{currentCard.Text}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex gap-6">
                    <motion.button
                        onClick={handleSuffleDeck}
                        whileTap={{ scale: 0.9, rotate: -10 }}
                        className="bg-yellow-300 hover:bg-yellow-500 px-4 py-2 rounded shadow text-black font-semibold">
                        Shuffle
                    </motion.button>
                    <motion.button
                        onClick={handleUndo}
                        whileTap={{ scale: 1.1, x: -10 }}
                        className="bg-gray-300 hover:bg-gray-500 px-4 py-2 rounded shadow text-white font-semibold">
                        Undo
                    </motion.button>
                    <motion.button
                        onClick={handleDrawCard}
                        whileTap={{ scale: 1.1 }}
                        className="bg-blue-400 hover:bg-blue-600 px-4 py-2 rounded shadow text-white font-semibold">
                        Draw
                    </motion.button>
                    <motion.button
                        onClick={handleSubmit}
                        whileTap={{ scale: 1.05 }}
                        className="bg-green-400 hover:bg-green-600 px-4 py-2 rounded shadow text-white font-semibold">
                        Finish
                    </motion.button>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PlayRandomCard;
