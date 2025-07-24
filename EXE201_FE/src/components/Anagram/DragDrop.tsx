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

const countLetters = (letters: string[]): { [key: string]: number } => {
  return letters.reduce((acc, letter) => {
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
};

const DraggableKeyword = ({ id, disabled, count, maxCount }: { 
  id: string; 
  disabled: boolean;
  count: number;
  maxCount: number;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.8 : 1,
    transition: isDragging ? 'none' : 'all 0.2s ease',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className={`
        relative px-6 py-3 rounded-xl font-bold text-lg select-none
        shadow-lg border-2 transition-all duration-200
        ${disabled 
          ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed' 
          : 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white border-blue-300 cursor-grab hover:from-blue-500 hover:to-cyan-500 hover:shadow-xl hover:scale-105 active:cursor-grabbing'
        }
      `}
    >
      <span className="relative z-10">{id}</span>
      {maxCount > 1 && (
        <div className={`
          absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
          text-xs font-bold border-2 
          ${disabled 
            ? 'bg-gray-400 border-gray-300 text-gray-600' 
            : 'bg-orange-500 border-white text-white'
          }
        `}>
          {maxCount - count}
        </div>
      )}
      {!disabled && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300 transform -skew-x-12"></div>
      )}
    </div>
  );
};

const DroppableArea = ({
  id,
  children,
  isEmpty,
}: {
  id: string;
  children: React.ReactNode;
  isEmpty: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef} 
      className={`
        relative w-16 h-16 rounded-xl border-3 transition-all duration-300
        flex items-center justify-center text-xl font-bold
        ${isEmpty 
          ? isOver 
            ? 'border-green-400 bg-green-50 shadow-lg scale-110' 
            : 'border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          : isOver
            ? 'border-yellow-400 bg-yellow-50 shadow-lg scale-110'
            : 'border-solid border-green-400 bg-green-100 shadow-md'
        }
      `}
    >
      {children && (
        <div className={`
          w-full h-full rounded-lg flex items-center justify-center
          font-bold text-lg text-green-700
          ${isEmpty ? '' : 'bg-gradient-to-br from-green-400 to-emerald-400 text-white shadow-inner'}
        `}>
          {children}
        </div>
      )}
      {isEmpty && (
        <div className={`
          absolute inset-2 rounded-lg border-2 border-dashed transition-all duration-200
          ${isOver ? 'border-green-400 bg-green-100' : 'border-gray-300'}
        `}>
          {isOver && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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

  useEffect(() => {
    const updatedCounts = Object.values(droppedKeywords).reduce((acc, letter) => {
      if (letter) {
        acc[letter] = (acc[letter] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });
    setUsedCounts(updatedCounts);
  }, [droppedKeywords]);

  useEffect(() => {
    setUsedCounts({});
  }, [resetTrigger]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (paused) return;
    const { over, active } = event;
    if (over) {
      const targetIndex = parseInt(over.id as string);
      const keyword = active.id as string;
      const currentUsedCount = usedCounts[keyword] || 0;
      const maxAllowed = letterCounts[keyword] || 0;

      if (currentUsedCount < maxAllowed && !droppedKeywords[targetIndex]) {
        onDrop(targetIndex, keyword);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center">
            {uniqueKeywords.map((word) => {
              const currentCount = usedCounts[word] || 0;
              const maxCount = letterCounts[word] || 0;
              const isDisabled = currentCount >= maxCount || paused;

              return (
                <DraggableKeyword 
                  key={word} 
                  id={word} 
                  disabled={isDisabled}
                  count={currentCount}
                  maxCount={maxCount}
                />
              );
            })}
          </div>
        </div>

        <div
          className={`
            flex justify-center gap-3 flex-wrap
            ${direction === "horizontal" ? "flex-row" : "flex-col items-center"}
          `}
        >
          {targets.map((_, index) => {
            const isEmpty = !droppedKeywords[index];
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <DroppableArea 
                  id={index.toString()}
                  isEmpty={isEmpty}
                >
                  {droppedKeywords[index] || ""}
                </DroppableArea>
                <span className="text-xs text-gray-400 font-medium">
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">
              {Object.values(droppedKeywords).filter(Boolean).length} / {targets.length} hoàn thành
            </span>
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default KeywordDragDrop;
