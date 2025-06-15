import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { editRandomCard } from "../../../services/authService";
import { Trash, Image } from "lucide-react";

type RandomCardEntry = {
  Text: string;
  Image?: File | null;
  ImageUrl: string;
};

type EditRandomCardProp = {
  initialActivityName: string;
  initialDuration: number;
  initialRandomCard: RandomCardEntry[];
  initialThumbnailUrl: string;
  onSave: (data: {
    activityName: string;
    duration: number;
    randomCard: RandomCardEntry;
    thumbnailUrl: string | null;
  }) => void;
};

const EditRandomCard: React.FC<EditRandomCardProp> = ({
  initialActivityName,
  initialDuration,
  initialRandomCard,
  initialThumbnailUrl,
  onSave,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activityName, setActivityName] = useState(initialActivityName);
  const [duration, setDuration] = useState(initialDuration);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [randomCard, setRandomCard] = useState<RandomCardEntry[]>(initialRandomCard);

  const teacherId = useSelector((state: RootState) => state.user.userId);
  const { minigameId } = useParams<{ minigameId: string }>();

  const handleCardChange = (index: number, field: keyof RandomCardEntry, value: unknown) => {
    const updated = [...randomCard];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setRandomCard(updated);
  };

  const handleAddCard = () => {
    setRandomCard([...randomCard, { Text: "", Image: null, ImageUrl: "" }]);
  };

  const handleRemoveCard = (index: number) => {
    setRandomCard(randomCard.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!minigameId || !teacherId) return;
    setIsLoading(true);

    try {
      await editRandomCard({
        MinigameId: minigameId,
        MinigameName: activityName,
        Duration: duration,
        TemplateId: "TP4",
        TeacherId: teacherId,
        ImageFile: thumbnail ?? undefined,
        ImageUrl: initialThumbnailUrl,
        GameData: randomCard,
      });

      onSave({
        activityName,
        duration,
        randomCard: randomCard[0],
        thumbnailUrl: initialThumbnailUrl,
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save RandomCard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-purple-400 hover:bg-purple-500 px-4 py-2 rounded shadow text-white font-semibold">
        Edit Random Card
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded max-w-4xl w-full">
            <Dialog.Title className="text-lg font-bold mb-4">Edit Random Card</Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-lg">Activity name</label>
                <input
                  className="w-full mt-2 p-2 border rounded"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Enter activity name"
                />
              </div>

              <div>
                <label className="font-bold text-lg">Duration (seconds)</label>
                <input
                  type="number"
                  className="w-full mt-2 p-2 border rounded"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  placeholder="Enter duration in seconds"
                />
              </div>

              <div>
                <label className="font-bold text-lg">Thumbnail</label>
                <div className="flex items-center gap-3 mt-2">
                  {thumbnail && (
                    <img
                      src={URL.createObjectURL(thumbnail)}
                      alt="Thumbnail"
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <label
                    htmlFor="thumbnail-upload"
                    className="p-2 border rounded bg-gray-100 hover:bg-gray-300 cursor-pointer"
                  >
                    <Image size={20} />
                  </label>
                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setThumbnail(file);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 font-semibold border-b pb-2 mt-6">
                <div className="col-span-2">Keyword</div>
                <div className="col-span-2">Image</div>
                <div className="text-center">Actions</div>
              </div>

              {randomCard.map((card, index) => (
                <div key={index} className="grid grid-cols-5 items-center gap-2 mb-2 mt-3">
                  <input
                    className="col-span-2 p-2 border rounded"
                    value={card.Text}
                    onChange={(e) => handleCardChange(index, "Text", e.target.value)}
                    placeholder={`Keyword ${index + 1}`}
                  />

                  <div className="col-span-2 flex items-center gap-2">
                    {card.ImageUrl || card.Image ? (
                      <img
                        src={card.Image ? URL.createObjectURL(card.Image) : card.ImageUrl}
                        alt={`Image for ${card.Text}`}
                        className="w-24 h-16 object-cover rounded"
                      />
                    ) : (
                      <>
                        <label
                          htmlFor={`image-upload-${index}`}
                          className="p-2 border rounded bg-gray-100 hover:bg-gray-300 cursor-pointer"
                        >
                          <Image size={16} />
                        </label>
                        <input
                          id={`image-upload-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleCardChange(index, "Image", file);
                            }
                          }}
                        />
                      </>
                    )}
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleRemoveCard(index)}
                      className="p-1 hover:bg-red-500 text-red-600"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between mt-4">
                <button
                  onClick={handleAddCard}
                  className="flex items-center px-3 py-2 text-sm bg-yellow-100 rounded hover:bg-yellow-200"
                >
                  <span className="text-xl mr-1">+</span> Add more
                </button>

                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </button>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default EditRandomCard;
