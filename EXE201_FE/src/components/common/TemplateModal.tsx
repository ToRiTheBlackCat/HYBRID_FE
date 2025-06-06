import React from "react";
// import TemplatePage from "../../pages/TemplatePage";

interface TemplateModalProps {
    onClose: () => void;
    children?: React.ReactNode;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ onClose, children }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-auto">
            <div className="bg-white w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg relative p-4">
                <button
                className="absolute top-3 right-4 text-gray-600 hover:text-red-500 text-2xl"
                onClick={onClose}
                >
                &times;
                </button>
                {children}
            </div>
        </div>
    );
};
export default TemplateModal;