import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageModalProps {
  imageUrls: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  imageUrls,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => {
    const imageUrl = imageUrls[currentIndex];
  return (
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative max-w-3xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white text-3xl font-bold z-10"
            >
              ✖
            </button>
            {currentIndex > 0 && (
              <button
                onClick={onPrev}
                className="absolute top-1/2 left-[-40px] transform -translate-y-1/2 text-white text-3xl z-10"
              >
                ←
              </button>
            )}

            {/* Next button */}
            {currentIndex < imageUrls.length - 1 && (
              <button
                onClick={onNext}
                className="absolute ml-5 top-1/2 right-[-40px] transform -translate-y-1/2 text-white text-3xl z-10"
              >
                →
              </button>
            )}
            <img
              src={imageUrl}
              alt="Zoomed"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
