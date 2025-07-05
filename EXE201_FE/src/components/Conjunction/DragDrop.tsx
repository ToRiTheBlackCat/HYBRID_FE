
import React from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";

// Enhanced KeywordDragDrop Component
interface KeywordDragDropProps {
  keywords: string[];
  targets: string[];
  onDrop: (targetIndex: number, keyword: string) => void;
  droppedKeywords: { [index: number]: string | null };
  disabled?: boolean;
}

const DraggableKeyword = ({ id, disabled }: { id: string; disabled?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...(disabled ? {} : listeners)} 
      {...(disabled ? {} : attributes)}
      className={`
        inline-block px-4 py-2 m-1 rounded-lg font-medium text-sm
        transition-all duration-200 select-none
        ${disabled 
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60' 
          : isDragging
            ? 'bg-blue-600 text-white shadow-2xl scale-105 cursor-grabbing'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105 cursor-grab active:scale-95'
        }
      `}
    >
      {id}
    </div>
  );
};

const DroppableArea = ({
  id,
  children,
  isCorrect,
}: {
  id: string;
  children: React.ReactNode;
  isCorrect?: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef}
      className={`
        border-2 border-dashed rounded-xl p-4 min-h-16 flex items-center justify-center
        transition-all duration-300 text-center font-medium
        ${isOver 
          ? 'border-blue-400 bg-blue-50 scale-105' 
          : isCorrect 
            ? 'border-green-400 bg-green-50 text-green-700'
            : children !== "Drop keyword here"
              ? 'border-purple-400 bg-purple-50 text-purple-700'
              : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400 hover:bg-gray-100'
        }
      `}
    >
      {children === "Drop keyword here" ? (
        <span className="text-sm italic">Drop keyword here</span>
      ) : (
        <span className="px-3 py-1 bg-white rounded-lg shadow-sm border">
          {children}
        </span>
      )}
    </div>
  );
};

const KeywordDragDrop: React.FC<KeywordDragDropProps> = ({
  keywords,
  targets,
  onDrop,
  droppedKeywords,
  disabled = false,
}) => {
  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return;

    const { over, active } = event;
    if (over) {
      const targetIndex = parseInt(over.id as string);
      onDrop(targetIndex, active.id as string);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {/* Keywords Pool */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          <h4 className="text-lg font-semibold text-gray-700">Available Keywords</h4>
        </div>
        <div className="p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-gray-200 shadow-inner">
          <div className="flex flex-wrap gap-2 justify-center">
            {keywords.map((word) => (
              <DraggableKeyword key={word} id={word} disabled={disabled} />
            ))}
          </div>
        </div>
      </div>

      {/* Drop Targets */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <h4 className="text-lg font-semibold text-gray-700">Match Definitions</h4>
        </div>
        
        {targets.map((target, index) => (
          <div key={index} className="group">
            <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-800 mb-3 leading-relaxed">
                    {target}
                  </div>
                  <DroppableArea 
                    id={index.toString()}
                    isCorrect={droppedKeywords[index] !== null && droppedKeywords[index] !== undefined}
                  >
                    {droppedKeywords[index] || "Drop keyword here"}
                  </DroppableArea>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span className="font-medium">Progress</span>
          <span className="font-bold">
            {Object.values(droppedKeywords).filter(Boolean).length} / {targets.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${(Object.values(droppedKeywords).filter(Boolean).length / targets.length) * 100}%` 
            }}
          ></div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">
          {Object.values(droppedKeywords).filter(Boolean).length === targets.length 
            ? "🎉 All matches complete!" 
            : `${targets.length - Object.values(droppedKeywords).filter(Boolean).length} more to go`
          }
        </div>
      </div>
    </DndContext>
  );
};

export default KeywordDragDrop;