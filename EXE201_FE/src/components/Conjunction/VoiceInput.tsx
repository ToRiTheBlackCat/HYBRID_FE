// components/VoiceInput.tsx
import React, { useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Mic } from "lucide-react";

interface VoiceInputProps {
  onResult: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult }) => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const handleStart = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: "en-US" });
  };

  useEffect(() => {
    if (!listening && transcript) {
      onResult(transcript.trim());
    }
  }, [listening, onResult, transcript]);

  if (!browserSupportsSpeechRecognition) {
    return <span className="text-red-500">🎤 Not supported</span>;
  }

  return (
    <button type="button" onClick={handleStart} className="p-1 hover:text-blue-600" title="Speak">
      <Mic size={18} />
    </button>
  );
};

export default VoiceInput;
