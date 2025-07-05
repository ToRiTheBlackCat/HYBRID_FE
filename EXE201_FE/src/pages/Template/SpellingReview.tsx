import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FiVolume2, FiPlay, FiPause, FiRotateCcw, FiCheck, FiClock } from "react-icons/fi";
import { useParams } from "react-router-dom";

import Header from "../../components/HomePage/Header";
import EditSpelling from "../Teacher/Template/EditSpelling";
import { fetchPlayMinigames } from "../../services/authService";
import { baseImageUrl } from "../../config/base";
import SpellingRaw from "../Teacher/RawMinigameInfo/Spelling";

interface Question {              // dùng cho gameplay
  word: string;
  imagePath: string;
}
interface SpellingItem {          // dùng cho EditSpelling
  Word: string;
  Image: File | null;
  ImageUrl: string;
}

const SpellingReview: React.FC = () => {
  /* ───────── params / refs ───────── */
  const { minigameId } = useParams<{ minigameId: string }>();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ───────── gameplay state ───────── */
  const [questions, setQuestions] = useState<Question[]>([]);
  const [curIdx, setCurIdx] = useState(0);
  const [letters, setLetters] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<number>(0);
  const [paused, setPaused] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  /* ───────── edit dialog state ───────── */
  const [editItems, setEditItems] = useState<SpellingItem[]>([]);
  const [activityName, setActivityName] = useState("Spelling Review");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  /* ───────── helpers ───────── */
  const normalize = (base: string, path: string) => {
    const url = `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
    return `${url}?t=${Date.now()}`;
  };

  const speakWord = (w: string) => {
    const ut = new SpeechSynthesisUtterance(w);
    ut.lang = "en-US";
    window.speechSynthesis.speak(ut);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /* ───────── fetch data ───────── */
  useEffect(() => {
    const load = async () => {
      if (!minigameId) return;
      try {
        const res = await fetchPlayMinigames(minigameId);
        if (!res) return;

        setActivityName(res.minigameName ?? "Spelling Review");
        setThumbnailUrl(res.thumbnailImage ? normalize(baseImageUrl, res.thumbnailImage) : "");
        setRemaining(res.duration ?? 0);

        const xml = new DOMParser().parseFromString(res.dataText, "text/xml");
        const qs: Question[] = [];
        const edits: SpellingItem[] = [];

        for (const q of Array.from(xml.getElementsByTagName("question"))) {
          const word = q.getElementsByTagName("word")[0]?.textContent?.trim().toUpperCase() ?? "";
          const img = q.getElementsByTagName("image")[0]?.textContent?.trim() ?? "";

          qs.push({ word, imagePath: img });

          if (img) {
            try {
              const resp = await fetch(normalize(baseImageUrl, img));
              const blob = await resp.blob();
              const file = new File([blob], "image.jpg", { type: blob.type });
              edits.push({
                Word: word,
                Image: file,
                ImageUrl: normalize(baseImageUrl, img),
              });
            } catch {
              edits.push({ Word: word, Image: null, ImageUrl: "" });
            }
          } else {
            edits.push({ Word: word, Image: null, ImageUrl: "" });
          }
        }

        setQuestions(qs);
        setEditItems(edits);
        setLetters(Array(qs[0].word.length).fill(""));
      } catch (e) {
        toast.error("Failed to load minigame");
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [minigameId]);

  /* ───────── countdown ───────── */
  useEffect(() => {
    if (paused || remaining <= 0) return;
    const t = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [paused, remaining]);

  /* ───────── gameplay handlers ───────── */
  const curQ = questions[curIdx];
  const onType = (i: number, v: string) => {
    if (paused || !/^[A-Za-z]?$/.test(v)) return;
    const up = [...letters];
    up[i] = v.toUpperCase();
    setLetters(up);
    if (v && i < letters.length - 1) inputRefs.current[i + 1]?.focus();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempts(prev => prev + 1);
    
    if (letters.join("") === curQ.word) {
      setScore(prev => prev + 1);
      toast.success("🎉 Correct!");
      
      if (curIdx < questions.length - 1) {
        setTimeout(() => {
          const next = curIdx + 1;
          setCurIdx(next);
          setLetters(Array(questions[next].word.length).fill(""));
        }, 1000);
      } else {
        toast.success("🏆 Congratulations! You've completed all questions!");
      }
    } else {
      toast.error("❌ Incorrect! Try again.");
    }
  };

  const resetCurrentWord = () => {
    setLetters(Array(curQ.word.length).fill(""));
    inputRefs.current[0]?.focus();
  };

  /* ───────── UI ───────── */
  if (loading)
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading your spelling challenge...</p>
          </div>
        </div>
      </>
    );

  return (
    <>
      <Header />
      {!isPlaying ? (
        <SpellingRaw onStart={() => setIsPlaying(true)} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 mt-20">
          <div className="max-w-4xl mx-auto">
            {/* Header Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{score}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{curIdx + 1}/{questions.length}</div>
                    <div className="text-sm text-gray-600">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{attempts}</div>
                    <div className="text-sm text-gray-600">Attempts</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    remaining <= 30 ? 'bg-red-100 text-red-700' : 
                    remaining <= 60 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    <FiClock className="w-4 h-4" />
                    <span className="font-semibold">{formatTime(remaining)}</span>
                  </div>
                  
                  <button
                    onClick={() => setPaused((p) => !p)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                      paused 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    }`}
                  >
                    {paused ? <FiPlay className="w-4 h-4" /> : <FiPause className="w-4 h-4" />}
                    {paused ? 'Resume' : 'Pause'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Game Area */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{activityName}</h1>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
              </div>

              {/* Image/Audio Section */}
              <div className="flex justify-center mb-8">
                {curQ.imagePath ? (
                  <div className="relative group">
                    <img
                      src={normalize(baseImageUrl, curQ.imagePath)}
                      alt="spelling challenge"
                      className="w-48 h-48 object-cover rounded-2xl shadow-lg transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-2xl transition-colors"></div>
                  </div>
                ) : (
                  <button 
                    onClick={() => speakWord(curQ.word)} 
                    className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center group"
                  >
                    <FiVolume2 className="w-16 h-16 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>

              {/* Input Section */}
              <form onSubmit={onSubmit} className="space-y-8">
                <div className="flex justify-center">
                  <div className="flex gap-3 p-4 bg-gray-50 rounded-2xl">
                    {letters.map((ch, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        value={ch}
                        onChange={(e) => onType(i, e.target.value)}
                        className="w-14 h-14 text-center uppercase border-2 text-2xl font-bold rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white shadow-sm"
                        maxLength={1}
                        disabled={paused || remaining === 0}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={paused || remaining === 0}
                  >
                    <FiCheck className="w-5 h-5" />
                    Check Answer
                  </button>
                  
                  <button
                    type="button"
                    onClick={resetCurrentWord}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={paused || remaining === 0}
                  >
                    <FiRotateCcw className="w-5 h-5" />
                    Clear
                  </button>
                </div>

                {/* Time's Up Message */}
                {remaining === 0 && (
                  <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-4xl mb-2">⏰</div>
                    <p className="text-red-700 font-semibold text-lg">Time's up!</p>
                    <p className="text-red-600 mt-2">
                      You scored {score} out of {attempts} attempts
                    </p>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((curIdx + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </form>
            </div>
          </div>

          {/* Edit Dialog */}
          <EditSpelling
            initialActivityName={activityName}
            initialDuration={remaining}
            initialQuestions={editItems}
            initialThumbnailUrl={thumbnailUrl}
            onSave={(newData) => { 
              setActivityName(newData.activityName);
              setRemaining(newData.duration);
              setThumbnailUrl(newData.thumbnailUrl ?? "");
            }}
          />
        </div>
      )}
    </>
  );
};

export default SpellingReview;