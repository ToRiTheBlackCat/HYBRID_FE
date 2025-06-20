import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLink, FaTrash } from "react-icons/fa";
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
      alert("Please enter an activity name.");
      return;
    }


    // build modified sentence (___) + options giống như bạn đã làm
    const filledSentences = sentences.filter((s) => s.trim() !== "");
    if (filledSentences.length === 0) {
      alert("Please enter at least one sentence.");
      return;
    }

    if (!selectedWords.some((w) => w.length > 0)) {
      alert("Please select at least one word to replace.");
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

    try {
      const result = await createCompletion(payload);
      if (result) {
        toast.success("Tạo completion thành công!");
        navigate("/teacher/activities");
      }
    } catch (err) {
      toast.error("Có lỗi khi tạo completion. Kiểm tra console!");
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Activity name</h2>
        <input
          type="text"
          value={activityName}
          onChange={handleActivityNameChange}
          placeholder="Enter activity name"
          className="w-full p-2 mb-4 border rounded bg-gray-100"
        />
        <label className="block font-semibold mb-1">Thumbnail</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded mb-4"
        />
        <h2 className="text-lg font-bold mb-4">Duration (seconds)</h2>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          placeholder="Enter duration in seconds"
          className="w-full p-2 mb-4 border rounded bg-gray-100"
        />
        <h2 className="text-lg font-bold mb-4">Sentence</h2>
        {sentences.map((sentence, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center">
              <span className="mr-2">{index + 1}.</span>
              <input
                type="text"
                value={sentence}
                onChange={(e) => handleSentenceChange(index, e.target.value)}
                placeholder="Enter a sentence..."
                className="flex-1 p-2 border rounded mr-2"
              />
              <button className="p-2">
                <FaLink className="text-gray-500" />
              </button>
              <button onClick={() => deleteSentence(index)} className="p-2">
                <FaTrash className="text-gray-500" />
              </button>
            </div>
            {sentence && (
              <div className="flex flex-wrap gap-2 mt-2 ml-6">
                {sentence.split(/\s+/).filter((word) => word.length > 0).map((word, wordIndex) => (
                  <span
                    key={wordIndex}
                    onClick={() => handleWordClick(index, word)}
                    className={`cursor-pointer px-2 py-1 rounded ${selectedWords[index].includes(word)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                      }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 ml-6">
              <p className="font-semibold mb-2">Options:</p>
              {options[index].map((opt, optIndex) => (
                <div key={optIndex} className="flex items-center mb-2">
                  {/* radio chọn đáp án đúng */}
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={correctIndexes[index] === optIndex}
                    onChange={() => handleCorrectChange(index, optIndex)}
                    className="mr-2"
                  />

                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionsChange(index, optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    className="flex-1 p-2 border rounded mr-2"
                  />

                  <button onClick={() => deleteOption(index, optIndex)} className="p-2">
                    <FaTrash className="text-gray-500" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addOption(index)}
                className="bg-blue-200 text-black px-2 py-1 rounded hover:bg-blue-300 mt-1"
              >
                Add Option
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-between mt-4">
          <button
            onClick={addSentence}
            className="flex items-center bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
          >
            <span className="mr-2">+</span> Add more
          </button>
          <button
            onClick={handleFinish}
            className="bg-green-400 text-black px-4 py-2 rounded hover:bg-green-500"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionTemplate;