import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import KeywordDragDrop from "../../components/Conjunction/DragDrop";
import { useState } from "react";

const ConjunctionReview: React.FC = () => {
    const activityName = useSelector((state: RootState) => state.conjunction.activityName);
    const entries = useSelector((state: RootState) => state.conjunction.entries);
    const keywords = entries.map((e) => e.keyword);
    const meanings = entries.map((e) => e.meaning);
    const [dropped, setDropped] = useState<{ [index: number]: string | null }>({});

    const handleDrop = (targetIndex: number, keyword: string) => {
        setDropped((prev) => ({ ...prev, [targetIndex]: keyword }));
    };

    return (
        <>
            <div className="max-w-3xl mx-auto p-6 space-y-4 mt-20 border rounded-lg shadow-lg bg-white">
                <h1 className="text-2xl font-bold mb-4">Activity Review</h1>
                <h2 className="text-xl font-semibold text-blue-700">Activity Name: {activityName}</h2>

                <div className="max-w-3xl mx-auto p-6 mt-20 border rounded-lg shadow bg-white">
                    <h2 className="text-xl font-bold mb-4">Match the keywords</h2>

                    <KeywordDragDrop
                        keywords={keywords}
                        targets={meanings}
                        onDrop={handleDrop}
                        droppedKeywords={dropped}
                    />
                </div>
            </div>
        </>
    );
}
export default ConjunctionReview;