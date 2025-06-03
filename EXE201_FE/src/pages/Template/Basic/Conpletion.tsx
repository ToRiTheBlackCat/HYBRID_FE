import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLink, FaTrash } from "react-icons/fa";

const CompletionTemplate: React.FC = () => {
  const [activityName, setActivityName] = useState("");
  const [sentences, setSentences] = useState<string[]>(["", "", ""]);
  const [options, setOptions] = useState<string[][]>([[], [], []]); // Options for each sentence
  const [selectedWords, setSelectedWords] = useState<string[][]>([[], [], []]);
  const navigate = useNavigate();

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
    setOptions([...options, [""]]);
    setSelectedWords([...selectedWords, []]);
  };

  const deleteSentence = (index: number) => {
    if (sentences.length <= 1) return;
    const newSentences = sentences.filter((_, i) => i !== index);
    const newOptions = options.filter((_, i) => i !== index);
    const newSelectedWords = selectedWords.filter((_, i) => i !== index);
    setSentences(newSentences);
    setOptions(newOptions);
    setSelectedWords(newSelectedWords);
  };

  const handleFinish = () => {
    if (!activityName) {
      alert("Please enter an activity name.");
      return;
    }
    const filledSentences = sentences.filter((s) => s.trim() !== "");
    if (filledSentences.length === 0) {
      alert("Please enter at least one sentence.");
      return;
    }
    const anyWordsSelected = selectedWords.some((words) => words.length > 0);
    if (!anyWordsSelected) {
      alert("Please select at least one word to replace.");
      return;
    }

    const modifiedSentences = sentences.map((sentence, index) => {
      if (!sentence.trim()) return null;
      let modified = sentence;
      selectedWords[index].forEach((word) => {
        const regex = new RegExp(`\\b${word}\\b`, "gi");
        modified = modified.replace(regex, "___");
      });
      return modified;
    }).filter((s) => s !== null) as string[];

    const validOptions = options.map((opts, index) =>
      opts.filter((opt) => opt.trim() !== "").length > 0 ? opts.filter((opt) => opt.trim() !== "") : ["Option 1", "Option 2"]
    );

    const reviewData = {
      activityName,
      originalSentences: sentences.filter((s) => s.trim() !== ""),
      modifiedSentences,
      options: validOptions,
    };

    navigate("/completion-review", { state: reviewData });
  };

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
                    className={`cursor-pointer px-2 py-1 rounded ${
                      selectedWords[index].includes(word)
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
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionsChange(index, optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    className="w-full p-2 mb-2 border rounded mr-2"
                  />
                  <button
                    onClick={() => deleteOption(index, optIndex)}
                    className="p-2"
                  >
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