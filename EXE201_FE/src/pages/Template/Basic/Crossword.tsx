import React, { useState } from 'react';
import { Trash2, ArrowUp, ArrowDown, Plus, Upload, Grid, Clock, Save, ImageIcon, Settings, HelpCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCrossword } from '../../../services/authService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { toast } from 'react-toastify';

interface Entry {
  answer: string;
  clue: string;
}

const CrosswordEditor: React.FC = () => {
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState<number>(60); // Thời lượng chơi (phút)
  const [dimensionSize, setDimensionSize] = useState<number>(10); // Kích thước bảng
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([{ answer: '', clue: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'entries'>('basic');
  const navigate = useNavigate();
  const teacherId = useSelector((state: RootState) => state.user.userId);
  const { courseId } = useParams<{ courseId: string }>()
  const safeCourseId = courseId ?? '';

  const handleChange = (index: number, field: keyof Entry, value: string) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const handleAdd = () => {
    setEntries([...entries, { answer: '', clue: '' }]);
  };

  const handleDelete = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const handleMove = (from: number, to: number) => {
    if (to < 0 || to >= entries.length) return;
    const updated = [...entries];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setEntries(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = async () => {
    // Validation
    if (!activityName.trim()) {
      toast.error('Vui lòng nhập tên hoạt động');
      return;
    }

    const validEntries = entries.filter(e => e.answer.trim() && e.clue.trim());
    if (validEntries.length === 0) {
      toast.error('Vui lòng thêm ít nhất một câu hỏi');
      return;
    }

    setIsLoading(true);
    
    try {
      const crosswordData = {
        MinigameName: activityName,
        TeacherId: teacherId,
        Duration: duration,
        CourseId: safeCourseId,
        ImageFile: imageFile ?? null,
        GameData: [
          {
            DimensionSize: dimensionSize,
            Words: validEntries.map((e) => e.answer.trim().toUpperCase()),
            Clues: validEntries.map((e) => e.clue.trim()),
          },
        ],
      };

      const res = await createCrossword(crosswordData);

      if (res) {
        toast.success('Tạo crossword thành công!');
        navigate('/teacher/activities');
      } else {
        toast.error('Tạo crossword thất bại');
      }
    } catch (error) {
      console.error('Error creating crossword:', error);
      toast.error('Có lỗi xảy ra khi tạo crossword');
    } finally {
      setIsLoading(false);
    }
  };

  const validEntriesCount = entries.filter(e => e.answer.trim() && e.clue.trim()).length;
  const totalEntries = entries.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <Grid className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tạo Crossword</h1>
          <p className="text-gray-600">Tạo trò chơi crossword tương tác cho học sinh</p>
        </div>

        {/* Progress indicator */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeTab === 'basic' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <Settings className="w-4 h-4" />
              </div>
              <div className="h-1 w-20 bg-gray-200 rounded">
                <div className={`h-full bg-blue-500 rounded transition-all duration-300 ${
                  activeTab === 'entries' ? 'w-full' : 'w-0'
                }`}></div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeTab === 'entries' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <Grid className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {validEntriesCount}/{totalEntries} câu hỏi hợp lệ
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('basic')}
                className={`flex-1 py-4 px-6 font-medium transition-colors ${
                  activeTab === 'basic'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  Cài đặt cơ bản
                </div>
              </button>
              <button
                onClick={() => setActiveTab('entries')}
                className={`flex-1 py-4 px-6 font-medium transition-colors ${
                  activeTab === 'entries'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Grid className="w-4 h-4" />
                  Câu hỏi & Gợi ý
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                    {validEntriesCount}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="p-8">
            {activeTab === 'basic' ? (
              <div className="space-y-8">
                {/* Activity name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên hoạt động *
                  </label>
                  <input
                    type="text"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors"
                    placeholder="Nhập tên cho crossword của bạn..."
                  />
                </div>

                {/* Settings grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Thời lượng (phút)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors"
                      min={1}
                      max={180}
                    />
                    <p className="text-xs text-gray-500">Thời gian học sinh có để hoàn thành</p>
                  </div>

                  {/* Dimension size */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Grid className="w-4 h-4 inline mr-1" />
                      Kích thước bảng
                    </label>
                    <input
                      type="number"
                      value={dimensionSize}
                      onChange={(e) => setDimensionSize(Number(e.target.value))}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 px-4 py-3 rounded-xl transition-colors"
                      min={5}
                      max={20}
                    />
                    <p className="text-xs text-gray-500">Kích thước lưới crossword ({dimensionSize}x{dimensionSize})</p>
                  </div>
                </div>

                {/* Image upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    <ImageIcon className="w-4 h-4 inline mr-1" />
                    Hình ảnh thumbnail
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Hình ảnh đã chọn</p>
                          <button
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Xóa hình ảnh
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-gray-600 mb-2">Tải lên hình ảnh thumbnail</p>
                          <p className="text-sm text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer mt-4"
                    >
                      <Upload className="w-4 h-4" />
                      Chọn hình ảnh
                    </label>
                  </div>
                </div>

                {/* Next button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveTab('entries')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
                  >
                    Tiếp theo: Thêm câu hỏi
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Hướng dẫn</h3>
                      <p className="text-sm text-blue-700">
                        Nhập từ cần tìm và gợi ý tương ứng. Từ sẽ được tự động chuyển thành chữ hoa.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Entries header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Danh sách câu hỏi ({validEntriesCount} hợp lệ)
                  </h3>
                  <button
                    onClick={handleAdd}
                    className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm câu hỏi
                  </button>
                </div>

                {/* Entries list */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {entries.map((entry, index) => (
                      <div 
                        key={index} 
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Từ cần tìm
                              </label>
                              <input
                                type="text"
                                value={entry.answer}
                                onChange={(e) => handleChange(index, 'answer', e.target.value)}
                                className="w-full border border-gray-300 focus:border-blue-500 px-3 py-2 rounded-lg text-sm transition-colors"
                                placeholder="Nhập từ..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Gợi ý
                              </label>
                              <input
                                type="text"
                                value={entry.clue}
                                onChange={(e) => handleChange(index, 'clue', e.target.value)}
                                className="w-full border border-gray-300 focus:border-blue-500 px-3 py-2 rounded-lg text-sm transition-colors"
                                placeholder="Nhập gợi ý..."
                              />
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 flex items-center gap-1">
                            <button
                              onClick={() => handleMove(index, index - 1)}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowUp className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleMove(index, index + 1)}
                              disabled={index === entries.length - 1}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowDown className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
                              disabled={entries.length === 1}
                              className="p-1 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Validation indicator */}
                        {entry.answer.trim() && entry.clue.trim() && (
                          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Câu hỏi hợp lệ
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/teacher/activities')}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy bỏ
              </button>
              
              <div className="flex gap-3">
                {activeTab === 'entries' && (
                  <button
                    onClick={() => setActiveTab('basic')}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Quay lại
                  </button>
                )}
                
                <button
                  onClick={handleFinish}
                  disabled={isLoading || !activityName.trim() || validEntriesCount === 0}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Tạo Crossword
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrosswordEditor;