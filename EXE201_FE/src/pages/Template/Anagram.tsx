import React, { useState } from "react";
import { Copy, Trash } from "lucide-react";
// import Header from "../../components/HomePage/Header";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { createAnagram } from "../../services/authService";
import { Anagram } from "../../types/index";

interface AnagramEntry {
  word: string;
}
interface AnagramTemplateProps {
  courseId?: string;  
}

const AnagramTemplate: React.FC<AnagramTemplateProps> = ({courseId}) => {

  const [activityName, setActivityNameLocal] = useState("");
  const [entries, setEntries] = useState<AnagramEntry[]>([{ word: "" }]);
  const navigate = useNavigate();
  const teacherId = useSelector((state: RootState) => state.user.userId);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(60);

  const handleChange = (index: number, value: string) => {
    const updated = [...entries];
    updated[index].word = value;
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...entries, { word: "" }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const duplicateEntry = (index: number) => {
    const newEntry = { ...entries[index] };
    setEntries([
      ...entries.slice(0, index + 1),
      newEntry,
      ...entries.slice(index + 1),
    ]);
  };

  const handleFinish = async () => {
    if (!activityName || entries.some((e) => !e.word)) {
      alert("Please complete all fields");
      return;
    }

    // const words = entries.map((e) => e.word.trim());
    const anagramData: Anagram = {
      MinigameName: activityName,
      ImageFile: imageFile,
      TeacherId: teacherId,
      Duration: duration,
      TemplateId: "TP3", 
      CourseId: courseId || "",
      GameData: entries.map((e) => ({ words: [e.word.trim()] })),
    };
    console.log("Anagram data to be sent:", anagramData);

    const result = await createAnagram(anagramData);

    if (result) {
      navigate("/teacher/activities");
    } else {
      alert("Failed to create anagram activity");
    }
  };

  return (
    <>
      {/* <Header /> */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <h1 className="text-3xl font-bold text-center flex items-center justify-center gap-3">
                <span className="text-4xl">📝</span>
                Tạo hoạt động mới
              </h1>
              <p className="text-center text-blue-100 mt-2">Thiết lập tên và từ vựng cho game của bạn</p>
            </div>

            <div className="p-8">
              {/* Activity Name Section */}
              <div className="mb-8">
                <label className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  Tên hoạt động
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Nhập tên hoạt động..."
                    value={activityName}
                    onChange={(e) => setActivityNameLocal(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <span className="text-sm">{activityName.length}/50</span>
                  </div>
                </div>
              </div>

              {/* Words Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    Danh sách từ vựng
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm font-medium">
                      {entries.length} từ
                    </span>
                  </label>
                </div>

                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto pr-2">
                  {entries.map((entry, index) => (
                    <div key={index} className="group bg-gray-50 hover:bg-white rounded-xl p-4 border-2 border-transparent hover:border-gray-200 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        
                        <div className="flex-grow">
                          <input
                            type="text"
                            className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                            placeholder={`Từ thứ ${index + 1}...`}
                            value={entry.word}
                            onChange={(e) => handleChange(index, e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => duplicateEntry(index)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200 hover:scale-105 transform"
                            title="Nhân bản"
                          >
                            <Copy size={18} />
                          </button>
                          <button 
                            onClick={() => removeEntry(index)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 hover:scale-105 transform"
                            title="Xóa"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addEntry}
                  className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-3 rounded-xl font-medium text-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">➕</span>
                  Thêm từ mới
                </button>
              </div>

              {/* Settings Section */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-xl">🖼️</span>
                    Hình ảnh (tùy chọn)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      id="image-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setImageFile(file);
                      }}
                    />
                    <label 
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-500 font-medium">Tải lên hình ảnh</p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF (Max 5MB)</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-xl">⏱️</span>
                    Thời gian (giây)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-xl text-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                      min={10}
                      max={300}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      placeholder="60"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                      giây
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tối thiểu: 10 giây</span>
                    <span>Tối đa: 300 giây</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium text-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">💾</span>
                  Lưu nháp
                </button>
                
                <button
                  onClick={handleFinish}
                  className="flex-1 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🚀</span>
                  Hoàn thành & Bắt đầu
                </button>
              </div>

              {/* Info Footer */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl">💡</span>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Mẹo tạo hoạt động hiệu quả:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-600">
                      <li>Sử dụng từ vựng phù hợp với độ tuổi</li>
                      <li>Thêm ít nhất 5-10 từ để tạo trải nghiệm tốt</li>
                      <li>Đặt thời gian hợp lý cho từng câu hỏi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AnagramTemplate;
