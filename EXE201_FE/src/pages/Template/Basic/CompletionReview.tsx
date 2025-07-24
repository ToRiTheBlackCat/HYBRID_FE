import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPlayMinigames } from "../../../services/authService";
import EditCompletion from "../../Teacher/Template/EditCompletion";   // <– đã import sẵn
import { baseImageUrl } from "../../../config/base";
import CompletionRaw from "../../Teacher/RawMinigameInfo/Completion";
import Header from "../../../components/HomePage/Header";

/* ───────── helpers ───────── */
type QuestionParsed = { modifiedSentence: string; options: string[]; correctIndex: number };

function parseDataText(xml: string): QuestionParsed[] {
  const dom = new DOMParser().parseFromString(xml, "application/xml");
  return Array.from(dom.getElementsByTagName("question")).map((q) => ({
    modifiedSentence: q.getElementsByTagName("sentence")[0]?.textContent ?? "",
    options: Array.from(q.getElementsByTagName("options")).map((o) => o.textContent ?? ""),
    correctIndex:
      (parseInt(q.getElementsByTagName("answers")[0]?.textContent ?? "1", 10) || 1) - 1,

  }));
}

/* ───────── component ───────── */
const CompletionReview: React.FC = () => {
  const { minigameId } = useParams<{ minigameId: string }>();
  const navigate = useNavigate();

  /* -------- state -------- */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [activityName, setActivityName] = useState("");
  const [questions, setQuestions] = useState<QuestionParsed[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);


  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [paused, setPaused] = useState(true);

  const [duration, setDuration] = useState<number>(0);            // ★ NEW
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null); // ★ NEW

  /* -------- fetch data -------- */
  useEffect(() => {
    if (!minigameId) {
      setError("Không tìm thấy minigameId trên URL");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await fetchPlayMinigames(minigameId);

        setActivityName(data.minigameName ?? "");
        const fullThumb = data.thumbnailImage ? baseImageUrl + data.thumbnailImage : null;
        setThumbnailUrl(fullThumb);               // ★ NEW

        const parsed = parseDataText(data.dataText ?? "");
        setQuestions(parsed);
        setAnswers(new Array(parsed.length).fill(-1));

        const d = Number(data.duration) || 120;
        setDuration(d);                                             // ★ NEW
        setTimeLeft(d);

        setError(null);
      } catch (e) {
        console.error(e);
        setError("Không thể tải dữ liệu minigame.");
      } finally {
        setLoading(false);
      }
    })();
  }, [minigameId]);

  /* -------- timer -------- */
  useEffect(() => {
    if (loading || submitted || paused) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [loading, submitted, paused]);

  /* -------- answer / submit -------- */
  const handleAnswer = (optIdx: number) => {
    if (paused || submitted) return;

    const isCorrect = optIdx === questions[current].correctIndex;
    setFeedback(isCorrect ? "✅ Đúng rồi!" : "❌ Sai mất rồi!");

    // Lưu lựa chọn
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optIdx;
      return next;
    });

    // Xoá feedback sau 1.5 giây
    setTimeout(() => setFeedback(null), 1500);
  };


  const handleSubmit = () => {
    if (submitted) return;
    const pts = answers.reduce(
      (acc, a, i) => acc + (a === questions[i].correctIndex ? 1 : 0),
      0
    );
    setScore(pts);
    setSubmitted(true);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* --------★ Callback khi giáo viên ấn "Finish" trong EditCompletion -------- */
  const handleSaveEdit = ({
    activityName: newName,
    duration: newDur,
    entries,
  }: {
    activityName: string;
    duration: number;
    entries: { sentence: string; options: string[]; answerIndex: number }[];
    thumbnail: File | null;
  }) => {
    // cập nhật tiêu đề & thời gian
    setActivityName(newName);
    setDuration(newDur);
    setTimeLeft(newDur);

    // dựng lại questions & reset trạng thái
    const rebuilt = entries.map((e) => ({
      modifiedSentence: e.sentence,
      options: e.options,
      correctIndex: e.answerIndex,
    }));
    setQuestions(rebuilt);
    setAnswers(new Array(rebuilt.length).fill(-1));
    setCurrent(0);
    setSubmitted(false);
    setScore(null);
  };

  /* -------- UI -------- */
  if (loading) return <div className="p-4">Đang tải minigame...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  /* -- kết quả -- */
  if (submitted && score !== null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-bold mb-4">Kết quả của bạn</h2>
          <p className="text-3xl font-semibold mb-4">
            {score} / {questions.length}
          </p>
          <button
            onClick={() => navigate(0)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Chơi lại
          </button>
        </div>
      </div>
    );

  const q = questions[current];

  return (
    <>
      <Header />
      {!isPlaying ? (
        <CompletionRaw onStart={() => setIsPlaying(true)} />
      ) : (
        <div className="min-h-screen mt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
            {/* ---------- header ---------- */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-800">{activityName}</h2>

                {/* ★ Nút EditCompletion chỉ dành cho giáo viên */}
                <EditCompletion
                  initialActivityName={activityName}
                  initialDuration={duration}
                  initialEntries={questions.map((q) => ({
                    sentence: q.modifiedSentence,
                    options: q.options,
                    answerIndex: q.correctIndex,
                  }))}
                  initialThumbnailUrl={thumbnailUrl}
                  onSave={handleSaveEdit}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl font-mono text-lg shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>

            {/* ---------- progress ---------- */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Câu {current + 1} / {questions.length}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round(((current + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* ---------- sentence ---------- */}
            <div className="p-6 border-2 border-dashed border-amber-300 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 text-gray-800 mb-6 shadow-inner">
              <div className="text-lg leading-relaxed">
                {q.modifiedSentence.split("___").map((part, i, arr) => (
                  <span key={i} className="inline-block">
                    {part}
                    {i < arr.length - 1 && (
                      <span className="inline-block bg-amber-200 px-3 py-1 mx-2 rounded-lg font-semibold text-amber-800 shadow-sm animate-pulse">
                        ___
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* ---------- options ---------- */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {q.options.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-xl text-left font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-md ${
                    answers[current] === idx 
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg ring-2 ring-green-300" 
                      : "bg-white hover:bg-orange-50 border-2 border-orange-200 hover:border-orange-300 text-gray-700"
                  }`}
                  disabled={paused}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      answers[current] === idx 
                        ? "bg-white text-green-500" 
                        : "bg-orange-100 text-orange-500"
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {word}
                  </div>
                </button>
              ))}
            </div>

            {/* ---------- feedback ---------- */}
            {feedback && (
              <div className={`text-center font-semibold p-4 rounded-xl mb-6 transition-all duration-300 ${
                feedback.includes("Đúng") 
                  ? "bg-green-100 text-green-700 border border-green-200" 
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {feedback.includes("Đúng") ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {feedback}
                </div>
              </div>
            )}

            {/* ---------- navigation ---------- */}
            <div className="flex justify-between mb-6">
              <button
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Câu trước
              </button>

              <button
                onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                disabled={current === questions.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                Câu tiếp
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* ---------- footer ---------- */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate(0)}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-xl transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Thoát
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setPaused((p) => !p)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    paused 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "bg-amber-400 hover:bg-amber-500 text-gray-800"
                  }`}
                >
                  {paused ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  {paused ? "Tiếp tục" : "Tạm dừng"}
                </button>
                
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                  disabled={answers.includes(-1) || paused}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CompletionReview;
