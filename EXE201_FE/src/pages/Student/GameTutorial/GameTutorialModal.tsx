import React, { useState } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import Image1 from "../../../assets/CatLogo.jpg"
import Image2 from "../../../assets/Logo.jpg"
import Video from "../../../assets/user_manual.mkv.mp4";

interface Step {
  title: string;
  description: string;
  image?: string;
  videoUrl?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const steps: Step[] = [
  {
    title: "Bước 1: Giới thiệu",
    description: "Bạn cần kéo các từ vào đúng vị trí để hoàn thành câu.",
    image: Image1,
  },
  {
    title: "Bước 2: Luật chơi",
    description: "Mỗi câu đúng sẽ được cộng điểm, sai thì không bị trừ điểm.",
    image: Image2,
  },
  {
    title: "Xem video minh họa",
    description: "Video hướng dẫn chi tiết cách chơi.",
    videoUrl: Video, // hoặc video tải lên từ server
  },
];

const GameTutorialModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) return null;

  const step = steps[stepIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-xl p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4">{step.title}</h2>
        <p className="text-gray-700 mb-4">{step.description}</p>

        {step.image && (
          <img src={step.image} alt="Step" className="w-full h-56 object-contain mb-4" />
        )}

        {step.videoUrl && (
          <div className="mb-4">
            <iframe
              className="w-full h-56 rounded"
              src={step.videoUrl}
              title="Tutorial Video"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={stepIndex === 0}
            className="flex items-center px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            <ArrowLeft className="mr-1" /> Trước
          </button>

          {stepIndex < steps.length - 1 ? (
            <button
              onClick={() => setStepIndex((prev) => prev + 1)}
              className="flex items-center px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Tiếp <ArrowRight className="ml-1" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
            >
              Bắt đầu chơi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameTutorialModal;
