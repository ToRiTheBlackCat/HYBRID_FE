
import React, { useState, useEffect } from "react";
import KeywordDragDrop from "../../../components/Anagram/DragDrop";
import Header from "../../../components/HomePage/Header";
import { fetchPlayMinigames, submitAccomplishment } from "../../../services/authService";
import { useParams } from "react-router-dom";
import { Accomplishment } from "../../../types";

const shuffleArray = (array: string[]) => {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

const parseXmlWords = (xml: string): string[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const wordElements = xmlDoc.getElementsByTagName("word");
    const words: string[] = [];
    for (let i = 0; i < wordElements.length; i++) {
        words.push(wordElements[i].textContent || "");
    }
    return words;
};

const PlayAnagram: React.FC = () => {
    const { minigameId } = useParams<{ minigameId: string }>();
    const [words, setWords] = useState<string[]>([]);
    const [duration, setDuration] = useState(60);
    const [timer, setTimer] = useState(60);
    const [isPaused, setIsPaused] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
    const [droppedLetters, setDroppedLetters] = useState<{ [index: number]: string | null }>({});
    const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
    const [finished, setFinished] = useState(false);
    const [resetCounter, setResetCounter] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    useEffect(() => {
        if (minigameId) {
            fetchPlayMinigames(minigameId).then((res) => {
                const parsedWords = parseXmlWords(res.dataText);
                setWords(parsedWords);
                setDuration(res.duration || 60);
                setTimer(res.duration || 60);
            });
        }
    }, [minigameId]);

    useEffect(() => {
        if (words.length > 0 && currentIndex < words.length) {
            const currentWord = words[currentIndex];
            const shuffled = shuffleArray(currentWord.split(""));
            setShuffledLetters(shuffled);
            setDroppedLetters(Object.fromEntries(Array(currentWord.length).fill(null).map((_, idx) => [idx, null])));
            setFeedback(null);
        }
    }, [words, currentIndex]);

    useEffect(() => {
        if (!isPaused && timer > 0 && !finished) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isPaused, timer, finished]);

    const handleDrop = (targetIndex: number, keyword: string) => {
        const updated = { ...droppedLetters, [targetIndex]: keyword };
        setDroppedLetters(updated);

        const assembled = Object.values(updated).join("");
        const currentWord = words[currentIndex];

        if (assembled.length === currentWord.length) {
            if (assembled === currentWord) {
                if (feedback !== "correct") setCorrectCount((p) => p + 1);
                setFeedback("correct");
            } else {
                setFeedback("incorrect");
            }
        } else {
            setFeedback(null);
        }
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleFinish = async () => {
        setFinished(true);
        setIsPaused(true)
        /* Tính toán thông số */
        const percent = Math.round((correctCount / words.length) * 100);
        const durationUsed = duration - timer;

        const payload: Accomplishment = {
            MinigameId: minigameId ?? "",   // chắc chắn khác undefined
            Percent: percent,
            DurationInSecond: durationUsed,
            TakenDate: new Date(),          // sẽ tự chuyển thành ISO khi stringify
        };

        // Gọi API
        const res = await submitAccomplishment(payload);
        if (res) console.log("Đã lưu điểm thành công:", res);
    };

    const handleRetry = () => {
        setDroppedLetters({});
        setCurrentIndex(0);
        setFinished(false);
        setTimer(duration);
        setIsPaused(false);
        setResetCounter(prev => prev + 1);
        setFeedback(null);
    };

    const togglePause = () => {
        setIsPaused((prev) => !prev);
    };

    if (words.length === 0) {
        return <div className="text-center mt-10 text-gray-600">Không tìm thấy từ cho hoạt động này.</div>;
    }

    const currentWord = words[currentIndex];

    return (
        <>
            <Header />
            <div className="border rounded-lg p-6 w-full max-w-3xl mx-auto mt-20 bg-pink-50">
                <div className="flex justify-between mb-4 text-lg font-medium">
                    <div>⏰ Thời gian còn lại: {timer}s</div>
                    <button onClick={togglePause} className="bg-gray-400 px-3 py-1 rounded text-white">
                        {isPaused ? "Resume" : "Pause"}
                    </button>
                </div>

                <div className="text-center text-2xl mb-6 font-semibold tracking-wide">
                    {currentWord.split("").map((letter, idx) => (
                        <span key={idx} className="inline-block mx-2 font-mono">
                            {letter}
                        </span>
                    ))}
                </div>

                <div className="flex justify-center gap-2 mb-6">
                    {currentWord.split("").map((_, idx) => (
                        <div
                            key={idx}
                            className="w-10 h-10 border border-black rounded flex items-center justify-center text-xl bg-white"
                        >
                            {droppedLetters[idx] || ""}
                        </div>
                    ))}
                </div>

                <KeywordDragDrop
                    keywords={shuffledLetters}
                    targets={currentWord.split("")}
                    droppedKeywords={droppedLetters}
                    onDrop={handleDrop}
                    direction="horizontal"
                    paused={isPaused}              // boolean: true khi nhấn "Finish", false khi bắt đầu lại
                    resetTrigger={resetCounter}
                />

                {feedback === "correct" && (
                    <div className="text-green-600 text-center text-lg font-semibold mt-4">✅ Chính xác!</div>
                )}
                {feedback === "incorrect" && (
                    <div className="text-red-600 text-center text-lg font-semibold mt-4">❌ Sai rồi!</div>
                )}

                <div className="flex justify-center items-center gap-4 mt-8 text-lg font-medium">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                    >
                        ←
                    </button>
                    <span>
                        {currentIndex + 1} / {words.length}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === words.length - 1}
                        className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                    >
                        →
                    </button>
                </div>

                <div className="flex justify-center gap-6 mt-6">
                    {!finished ? (
                        <button onClick={handleFinish} className="bg-blue-500 text-white px-4 py-2 rounded">
                            Finish
                        </button>
                    ) : (
                        <button onClick={handleRetry} className="bg-yellow-500 text-white px-4 py-2 rounded">
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};
export default PlayAnagram