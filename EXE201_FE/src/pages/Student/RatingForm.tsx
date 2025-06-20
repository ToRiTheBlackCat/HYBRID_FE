// RatingForm.tsx – version with onRated callback
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { rateMinigame } from "../../services/authService";
import { rateMinigameData } from "../../types";
import { toast } from "react-toastify";

interface RatingFormProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  minigameId: string;
  /** callback sau khi rate thành công */
  onRated?: (minigameId: string) => void;
}

const RatingForm: React.FC<RatingFormProps> = ({
  isOpen,
  onClose,
  studentId,
  minigameId,
  onRated,
}) => {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    const payload: rateMinigameData = {
      StudentId: studentId,
      MinigameId: minigameId,
      Score: score,
      Comment: comment.trim(),
    };

    const result = await rateMinigame(payload);
    if (result.isSuccess===true) {
      toast.success("Đánh giá thành công!");
      onRated?.(minigameId); // thông báo cho component cha
      onClose();
    } else {
      toast.error("Bạn đã đánh giá minigame này rồi");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
          <Dialog.Title className="text-xl font-bold text-center">Đánh giá minigame</Dialog.Title>

          <div>
            <label className="block text-sm font-medium">Điểm (1 - 5)</label>
            <input
              type="number"
              min={1}
              max={5}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full border rounded px-3 py-1 mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Bình luận</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">Hủy</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded">Gửi đánh giá</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default RatingForm;