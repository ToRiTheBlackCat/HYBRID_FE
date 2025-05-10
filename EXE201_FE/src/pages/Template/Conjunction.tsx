import React, { useState } from "react";
import { Plus, Trash2, Copy, Image as ImageIcon } from "lucide-react";
import Header from "../../components/HomePage/Header";
import VoiceInput from "../../components/Conjunction/VoiceInput";
import { Entry } from "../../types/index";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setActivityName, setEntries } from "../../store/slice";

const ConjunctionTemplate: React.FC = () => {
  const [localActivityName, setLocalActivityName] = useState("");
  const [localEntries, setLocalEntries] = useState<Entry[]>([{ keyword: "", meaning: "" }]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (index: number, field: keyof Entry, value: string) => {
    const updated = [...localEntries];
    updated[index][field] = value;
    setLocalEntries(updated);
  };

  const addEntry = () => {
    setLocalEntries([...localEntries, { keyword: "", meaning: "" }]);
  };

  const removeEntry = (index: number) => {
    const updated = localEntries.filter((_, i) => i !== index);
    setLocalEntries(updated);
  };

  const duplicateEntry = (index: number) => {
    const newEntry = { ...localEntries[index] };
    setLocalEntries([...localEntries.slice(0, index + 1), newEntry, ...localEntries.slice(index + 1)]);
  };

  const handleFinish = () => {
    if(localActivityName && localEntries.every(e => e.keyword && e.meaning)) {
      dispatch(setActivityName(localActivityName));
      dispatch(setEntries(localEntries));
      navigate("/conjunction-preview");
    }else{
      alert("Please fill in all fields");
    }
  };

  return (
    <>
    <Header/>
    <div className="max-w-3xl mx-auto p-6 space-y-4 mt-20 border rounded-lg shadow-lg bg-white">
      <button className="bg-green-200 text-black px-4 py-1 rounded-full">Back</button>
      <h1 className="text-2xl font-bold">Activity name</h1>
      <input
        type="text"
        className="w-full border border-gray-300 p-2 rounded"
        placeholder="Enter activity name"
        value={localActivityName}
        onChange={(e) => setLocalActivityName(e.target.value)}
      />

      <div className="space-y-4">
        {localEntries.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-5">{index + 1}.</span>

            {/* Keyword */}
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-1/3"
              placeholder="Keyword"
              value={entry.keyword}
              onChange={(e) => handleChange(index, "keyword", e.target.value)}
            />
            <div className="flex gap-1">
                <VoiceInput onResult={(value) => handleChange(index, "keyword", value)} />
                <button className="p-1">
                    <ImageIcon size={18} />
                </button>
            </div>

            {/* Meaning */}
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-1/3"
              placeholder="Meaning"
              value={entry.meaning}
              onChange={(e) => handleChange(index, "meaning", e.target.value)}
            />

            <button className="p-1" onClick={() => duplicateEntry(index)}>
              <Copy size={18} />
            </button>
            <button className="p-1" onClick={() => removeEntry(index)}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addEntry}
        className="flex items-center gap-2 bg-yellow-100 text-black px-4 py-2 rounded mt-2"
      >
        <Plus size={18} /> Add more
      </button>

      <div className="flex justify-end">
        <button
          onClick={handleFinish}
          className="bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded"
        >
          Finish
        </button>
      </div>
    </div>
    </>
  );
};

export default ConjunctionTemplate;
