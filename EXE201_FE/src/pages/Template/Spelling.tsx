import React, {useState} from "react";
import { SpellingItem } from "../../types/common";
import { useNavigate } from "react-router-dom";
import Header from "../../components/HomePage/Header";

const Spelling: React.FC = () => {
    const [activityName, setActivityName] = useState<string>("");
    const [mode, setMode] = useState<"none" | "voice" | "qa">("none");
    const [inputWord, setInputWord] = useState(['']);
    const [items, setItems] = useState<SpellingItem[]>([{}]);
    const navigate = useNavigate();

    const handleChange = (index: number, field: keyof SpellingItem, value: string) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    }

    const handleAddMore = () => {
        setItems([...items, {}]);
    }

    const handleRemove = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    }

    const handleRemoveWord = (index: number) => {
        setInputWord(inputWord.filter((_, i) => i !== index));
    }

    const handleFinish = () => {
        navigate("/spelling-review");
    }

    const handleInputChange = (index: number, value: string) => {
        const newInputWord = [...inputWord];
        newInputWord[index] = value;
        setInputWord(newInputWord);
    }

    const handleAddWord = () => {
        setInputWord([...inputWord, ""]);
    }

    return(
        <>
        <Header/>
            <div className="w-[900px] mx-auto mt-25 p-6 border rounded-md shadow-md bg-white">
                <h2 className="text-2xl font-bold mb-4">Spelling Activity</h2>
                <input
                    className="w-full mt-2 p-2 border rounded mb-4"
                    type="text"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="Enter activity name"
                />
                <div className="mb-6 flex gap-6">
                    <label>
                        <input
                            type="radio"
                            name="mode"
                            value="voice"
                            checked={mode === "voice"}
                            onChange={() => setMode("voice")}/>
                        <span className="ml-2">Use Voice</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="mode"
                            value="qa"
                            checked={mode === "qa"}
                            onChange={() => setMode("qa")}
                        />
                        <span className="ml-2">Use QA</span>
                    </label>
                </div>
                {mode === "voice" && (
                <div className="space-y-2">
                    {inputWord.map((value, index) => (
                    <div key={index} className="flex items-center mb-2">
                        <p className="mb-2 font-semibold mr-5">{index + 1}</p>
                        <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        placeholder={`Word ${index + 1}`}
                        className="w-full p-2 border rounded mr-2 mb-2"
                        />
                        {inputWord.length > 1 && (
                        <button
                            type="button"
                            onClick={() => handleRemoveWord(index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            🗑
                        </button>
                        )}
                    </div>
                    ))}
                </div>
                )}


                {mode === "qa" && items.map((item, index) => (
                    <div key={index} className="border p-4 mb-4 rounded relative">
                        <p className="mb-2 font-semibold">Question {index + 1}</p>
                        <label className="mr-3 ">
                            Question
                        </label>
                        <input
                            type="text"
                            placeholder="Question"
                            value={item.question}
                            onChange={(e) => handleChange(index, "question", e.target.value)}
                            className="w-fit mb-2 mr-5 p-2 border"/>
                        <label className="mr-3">
                            Answer
                        </label>
                        <input
                            type="text"
                            placeholder="Answer"
                            value={item.answer}
                            onChange={(e) => handleChange(index, "answer", e.target.value)}
                            className="w-fit mb-2 p-2 border"/>
                        {items.length > 1 && (
                            <button
                                onClick={() => handleRemove(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                🗑
                            </button>    
                        )}          
                    </div>    
                ))}
                <div className="flex justify-between">
                    <button
                        onClick={mode === "voice" ? handleAddWord : handleAddMore}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            + Add more
                    </button>
                    <button
                        onClick={handleFinish}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                            Finish  
                    </button>
                </div>
            </div>
        </>
    )
}
export default Spelling;