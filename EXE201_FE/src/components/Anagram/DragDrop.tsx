import React, { useEffect, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";

interface KeywordDragDropProps {
  keywords: string[];
  targets: string[];
  onDrop: (targetIndex: number, keyword: string) => void;
  droppedKeywords: { [index: number]: string | null };
  direction?: "horizontal";
  paused?: boolean;
  resetTrigger?: number;
}

// Đếm số lần xuất hiện của mỗi chữ cái
const countLetters = (letters: string[]): { [key: string]: number } => {
  return letters.reduce((acc, letter) => {
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
};

// DraggableKeyword
const DraggableKeyword = ({ id, disabled }: { id: string; disabled: boolean }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    padding: "8px 16px",
    backgroundColor: disabled ? "#d3d3d3" : "#c4f5ff",
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "grab",
    margin: "4px",
    fontWeight: "bold",
    fontSize: "18px",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {id}
    </div>
  );
};

// DroppableArea
const DroppableArea = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const style: React.CSSProperties = {
    border: "2px dashed #999",
    backgroundColor: isOver ? "#f0fff0" : "#fff",
    minHeight: "48px",
    width: "48px",
    padding: "8px",
    borderRadius: "8px",
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

// Main Component
const KeywordDragDrop: React.FC<KeywordDragDropProps> = ({
  keywords,
  targets,
  onDrop,
  droppedKeywords,
  direction = "horizontal",
  paused = false,
  resetTrigger,
}) => {
  const [usedCounts, setUsedCounts] = useState<{ [key: string]: number }>({});

  const letterCounts = countLetters(keywords);
  const uniqueKeywords = Array.from(new Set(keywords));

  // Update used counts whenever droppedKeywords changes
  // Cập nhật khi droppedKeywords thay đổi
useEffect(() => {
  const updatedCounts = Object.values(droppedKeywords).reduce((acc, letter) => {
    if (letter) {
      acc[letter] = (acc[letter] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });
  setUsedCounts(updatedCounts);
}, [droppedKeywords]);

// Reset khi resetTrigger thay đổi
useEffect(() => {
  setUsedCounts({});
}, [resetTrigger]);


  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    if (paused) return;
    const { over, active } = event;
    if (over) {
      const targetIndex = parseInt(over.id as string);
      const keyword = active.id as string;
      const currentUsedCount = usedCounts[keyword] || 0;
      const maxAllowed = letterCounts[keyword] || 0;

      if (currentUsedCount < maxAllowed) {
        onDrop(targetIndex, keyword);
      }
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {/* Drag items */}
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        {uniqueKeywords.map((word) => {
          const isDisabled =
            (usedCounts[word] || 0) >= (letterCounts[word] || 0) || paused;
          return (
            <DraggableKeyword key={word} id={word} disabled={isDisabled} />
          );
        })}
      </div>

      {/* Drop areas */}
      <div
        className={`flex ${
          direction === "horizontal" ? "flex-row" : "flex-col"
        } justify-center gap-4`}
      >
        {targets.map((_, index) => (
          <DroppableArea key={index} id={index.toString()}>
            {droppedKeywords[index] || ""}
          </DroppableArea>
        ))}
      </div>
    </DndContext>
  );
};

export default KeywordDragDrop;
