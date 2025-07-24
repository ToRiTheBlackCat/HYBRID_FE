import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaImage, FaClock, FaPlus, FaCheck, FaEdit, FaBullseye } from "react-icons/fa";
import { createCompletion } from "../../../services/authService";
import { CompletionData, Completion } from "../../../types";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { toast } from "react-toastify";

interface CompletionProp {
  courseId: string;
}

const CompletionTemplate: React.FC<CompletionProp> = ({ courseId }) => {
  const [activityName, setActivityName] = useState("");
  const [sentences, setSentences] = useState<string[]>([""]);
  const [options, setOptions] = useState<string[][]>([[]]); // Options for each sentence
  const [selectedWords, setSelectedWords] = useState<string[][]>([[]]);
  const navigate = useNavigate();
  const teacherId = useSelector((state: RootState) => state.user.userId);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [correctIndexes, setCorrectIndexes] = useState<number[]>(
    sentences.map(() => 0)          // mặc định đáp án đúng là option đầu tiên
  );

  const handleActivityNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivityName(e.target.value);
  };

  const handleSentenceChange = (index: number, value: string) => {
    const newSentences = [...sentences];
    newSentences[index] = value;
    setSentences(newSentences);
  };

  const handleOptionsChange = (sentenceIndex: number, optionIndex: number, value: string) => {
    const newOptions = [...options];
    newOptions[sentenceIndex][optionIndex] = value;
    setOptions(newOptions);
  };

  const addOption = (sentenceIndex: number) => {
    const newOptions = [...options];
    newOptions[sentenceIndex] = [...(newOptions[sentenceIndex] || []), ""];
    setOptions(newOptions);
  };

  const deleteOption = (sentenceIndex: number, optionIndex: number) => {
    const newOptions = [...options];
    newOptions[sentenceIndex] = newOptions[sentenceIndex].filter((_, i) => i !== optionIndex);
    setOptions(newOptions);
    if (correctIndexes[sentenceIndex] === optionIndex) {
      handleCorrectChange(sentenceIndex, 0);
    }
  };

  const handleWordClick = (sentenceIndex: number, word: string) => {
    const newSelectedWords = [...selectedWords];
    const sentenceWords = newSelectedWords[sentenceIndex];
    if (sentenceWords.includes(word)) {
      newSelectedWords[sentenceIndex] = sentenceWords.filter((w) => w !== word);
    } else {
      newSelectedWords[sentenceIndex] = [...sentenceWords, word];
    }
    setSelectedWords(newSelectedWords);
  };

  const addSentence = () => {
    setSentences([...sentences, ""]);
    setCorrectIndexes([...correctIndexes, 0]);
    setOptions([...options, [""]]);
    setSelectedWords([...selectedWords, []]);
  };

  const deleteSentence = (index: number) => {
    if (sentences.length <= 1) return;
    const newSentences = sentences.filter((_, i) => i !== index);
    const newOptions = options.filter((_, i) => i !== index);
    const newSelectedWords = selectedWords.filter((_, i) => i !== index);
    setSentences(newSentences);
    const newCorrect = correctIndexes.filter((_, i) => i !== index);
    setCorrectIndexes(newCorrect);
    setOptions(newOptions);
    setSelectedWords(newSelectedWords);
  };
  
  const handleCorrectChange = (sentIdx: number, optIdx: number) => {
    const arr = [...correctIndexes];
    arr[sentIdx] = optIdx;
    setCorrectIndexes(arr);
  };

  const handleFinish = async () => {
    if (!activityName.trim()) {
      toast.error("Please enter an activity name.");
      return;
    }

    // build modified sentence (___) + options giống như bạn đã làm
    const filledSentences = sentences.filter((s) => s.trim() !== "");
    if (filledSentences.length === 0) {
      toast.error("Please enter at least one sentence.");
      return;
    }

    if (!selectedWords.some((w) => w.length > 0)) {
      toast.error("Please select at least one word to replace.");
      return;
    }

    /* ----- build CompletionData ----- */
    const gameData = sentences.map((sentence, idx) => {
      if (!sentence.trim()) return null;

      // 1) sentence with ___
      let blanked = sentence;
      selectedWords[idx].forEach((w) => {
        const re = new RegExp(`\\b${w}\\b`, "gi");
        blanked = blanked.replace(re, "___");
      });

      // 2) option list (loại rỗng, fallback Option 1/2)
      const opts = options[idx].filter((o) => o.trim() !== "");
      const finalOptions = opts.length > 0 ? opts : ["Option 1", "Option 2"];

      // 3) answerIndexes — ở đây mặc định đáp án đúng là POSITION 0
      // Nếu có UI chọn đáp án, thay thế cho phù hợp
      return {
        Sentence: blanked,
        Options: finalOptions,
        AnswerIndexes: [correctIndexes[idx] + 1],
      };
    }).filter(Boolean) as Completion[];

    const payload: CompletionData = {
      MinigameName: activityName,
      ImageFile: imageFile,
      TeacherId: teacherId,
      Duration: duration,
      TemplateId: "TP7",
      CourseId: courseId,
      GameData: gameData,
    };
    console.log("Payload to create completion:", payload);

    try {
      const result = await createCompletion(payload);
      if (result) {
        toast.success("🎉 Completion created successfully!");
        navigate("/teacher/activities");
      }
    } catch (err) {
      toast.error("❌ Error creating completion. Check console!");
      console.error(err);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <FaEdit className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Create Completion Activity</h1>
              <p className="text-gray-600">Design interactive fill-in-the-blank exercises</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaEdit className="text-blue-500" />
                Activity Name
              </label>
              <input
                type="text"
                value={activityName}
                onChange={handleActivityNameChange}
                placeholder="Enter activity name"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaClock className="text-green-500" />
                Duration
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  placeholder="Enter duration in seconds"
                  className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                <div className="text-sm text-gray-600 px-3 py-2 bg-gray-100 rounded-lg">
                  {formatTime(duration)}
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="mt-6 space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaImage className="text-purple-500" />
              Thumbnail Image
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              />
              {imageFile && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ {imageFile.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sentences Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Sentences & Options</h2>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {sentences.filter(s => s.trim()).length} sentence(s)
            </div>
          </div>

          {sentences.map((sentence, index) => (
            <div key={index} className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              {/* Sentence Input */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <label className="text-sm font-semibold text-gray-700">Sentence</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sentence}
                    onChange={(e) => handleSentenceChange(index, e.target.value)}
                    placeholder="Enter a sentence..."
                    className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                  <button 
                    onClick={() => deleteSentence(index)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    disabled={sentences.length <= 1}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Word Selection */}
              {sentence && (
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Select words to replace with blanks:
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-gray-200">
                    {sentence.split(/\s+/).filter((word) => word.length > 0).map((word, wordIndex) => (
                      <span
                        key={wordIndex}
                        onClick={() => handleWordClick(index, word)}
                        className={`cursor-pointer px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          selectedWords[index].includes(word)
                            ? "bg-blue-500 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FaBullseye className="text-orange-500" />
                  <label className="text-sm font-semibold text-gray-700">Answer Options</label>
                </div>
                
                {options[index].map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={correctIndexes[index] === optIndex}
                        onChange={() => handleCorrectChange(index, optIndex)}
                        className="w-4 h-4 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600">Correct</span>
                    </div>
                    
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionsChange(index, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                      className="flex-1 p-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all"
                    />
                    
                    <button 
                      onClick={() => deleteOption(index, optIndex)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => addOption(index)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                >
                  <FaPlus />
                  Add Option
                </button>
              </div>
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-gray-200">
            <button
              onClick={addSentence}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <FaPlus />
              Add Sentence
            </button>
            
            <button
              onClick={handleFinish}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <FaCheck />
              Create Activity
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {sentences.some(s => s.trim()) && (
          <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Preview</h3>
            <div className="space-y-4">
              {sentences.map((sentence, index) => {
                if (!sentence.trim()) return null;
                
                let preview = sentence;
                selectedWords[index].forEach((word) => {
                  const re = new RegExp(`\\b${word}\\b`, "gi");
                  preview = preview.replace(re, "___");
                });
                
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <div className="text-gray-800 mb-2">{preview}</div>
                    <div className="flex flex-wrap gap-2">
                      {options[index].filter(opt => opt.trim()).map((opt, optIndex) => (
                        <span
                          key={optIndex}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            correctIndexes[index] === optIndex
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {opt} {correctIndexes[index] === optIndex && "✓"}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletionTemplate;