import React, { useState } from "react";
// import { Link } from "react-router-dom";
import AnimatedText from "../components/hooks/AnimatedText";
import FadeInOnView from "../components/hooks/FadeInOnView";

import Anagram from "../assets/TemplateLogo/Anagram.jpg";
import Completion from "../assets/TemplateLogo/Completion.jpg";
import Conjunction from "../assets/TemplateLogo/Conjunction.jpg";
import Crossword from "../assets/TemplateLogo/Crossword.jpg";
import DragDrop from "../assets/TemplateLogo/DragDrop.jpg";
import RandomCard from "../assets/TemplateLogo/RandomCard.jpg";
import Restoration from "../assets/TemplateLogo/Restoration.jpg";
import Pairing from "../assets/TemplateLogo/Pairing.jpg";
import FindWord from "../assets/TemplateLogo/FindWord.jpg";
import TrueFalse from "../assets/TemplateLogo/TrueFalse.jpg";
import FlashCard from "../assets/TemplateLogo/Flashcard.jpg";
import Reading from "../assets/TemplateLogo/Reading.jpg";
import SongPuzzle from "../assets/TemplateLogo/SongPuzzle.jpg";
import Spelling from "..//assets/TemplateLogo/Spelling.jpg";
import Quiz from "../assets/TemplateLogo/Quiz.jpg";
import Pronunciation from "../assets/TemplateLogo/Pronunciation.jpg";

import TemplateModal from "../components/common/TemplateModal";
import ConjunctionTemplate from "./Template/Conjunction";
import AnagramTemplate from "./Template/Anagram";
import QuizTemplate from "./Template/Quiz";
import RandomCardTemplate from "./Template/RandomCard";
import SpellingTemplate from "./Template/Spelling";
import FlashcardDesigner from "./Template/Flashcard";

type TemplateComponentProps = {
  courseId: string;
};

const templateComponents: { [key: string]: React.FC<TemplateComponentProps> } = {
    Conjunction: ConjunctionTemplate,
    Anagram: AnagramTemplate,
    Quiz: QuizTemplate,
    "Random Card": RandomCardTemplate,
    Spelling: SpellingTemplate,
    Flashcard: FlashcardDesigner,
}
interface TemplatePageProps {
    courseId?: string;
}

const TemplatePage: React.FC<TemplatePageProps> = ({courseId}) => {
  const [showMoreBasic, setShowMoreBasic] = useState(false);
  const [showMorePremium, setShowMorePremium] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<null | {
    title: string;
    image: string;
    url?: string;
  }>(null);

  const freeTemplates = [
    { title: "Conjunction", image: Conjunction, url: "/conjunction" },
    { title: "Anagram", image: Anagram, url: "/anagram" },
    { title: "Quiz", image: Quiz, url: "/quiz" },
    { title: "Random Card", image: RandomCard, url: "/random-card" },
    { title: "Spelling", image: Spelling, url: "/spelling" },
    { title: "Flashcard", image: FlashCard, url: "/flashcard" },
  ];

  const basicTemplates = [
    { title: "Completion", image: Completion, url: "/completion" },
    { title: "Pairing", image: Pairing, url: "/pairing" },
    { title: "Restoration", image: Restoration, url: "/restoration" },
    { title: "Find Word", image: FindWord, url: "/find-word" },
    { title: "True/False", image: TrueFalse, url: "/true-false" },
    { title: "Crossword", image: Crossword, url: "/crossword" },
  ];

  const premiumTemplates = [
    { title: "Drag & Drop", image: DragDrop },
    { title: "Song Puzzle", image: SongPuzzle },
    { title: "Reading", image: Reading },
    { title: "Completion", image: Completion },
    { title: "Quiz", image: Quiz },
    { title: "Pronunciation", image: Pronunciation },
  ];

  const handleSelectTemplate = (template: {
    title: string;
    image: string;
    url?: string;
  }) => {
    setSelectedTemplate(template);
  };

  return (
    <>
      <section className="bg-white text-center mt-20 mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-10">
          <AnimatedText text="How to use our" />{" "}
          <span className="text-blue-600 text-7xl font-bold relative inline-block">
            <AnimatedText text="Platform" />
            <span className="absolute -top-2 -right-6 text-blue-400 text-xl">✨</span>
          </span>
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-10 text-gray-700">
          <div>
            <h3 className="font-bold text-lg mb-2">
              <AnimatedText text="Step 1:" />
            </h3>
            <p className="text-sm">
              <AnimatedText text="Choose a template" />
              <br />
              <AnimatedText text="from our platform" />
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">
              <AnimatedText text="Step 2:" />
            </h3>
            <p className="text-sm">
              <AnimatedText text="Input your data" />
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">
              <AnimatedText text="Step 3:" />
            </h3>
            <p className="text-sm">
              <AnimatedText text="Post your activity" />
            </p>
          </div>
        </div>
      </section>

      <div className="w-full h-[80px] bg-gradient-to-r from-blue-400 to-white"></div>

      <FadeInOnView>
        <section className="py-12 px-4 md:px-16 bg-white text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-300 pb-2 w-fit mx-auto">
            Free templates
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 w-full gap-6 justify-items-center">
            {freeTemplates.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelectTemplate(item)}
                className="cursor-pointer flex items-center border rounded-2xl overflow-hidden w-[280px] h-[150px] max-w-sm hover:shadow-md transition"
              >
                <div className="w-[250px] h-[147px] rounded-lg overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                </div>
                <p className="text-gray-800 font-semibold">{item.title}</p>
              </div>
            ))}
          </div>
          <button
            className="mt-8 bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
            onClick={() => setShowMoreBasic(!showMoreBasic)}
          >
            {showMoreBasic ? "SHOW LESS" : "SEE MORE"}
          </button>
        </section>
      </FadeInOnView>

      {showMoreBasic && (
        <FadeInOnView>
          <section className="py-12 px-4 md:px-16 bg-white text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-300 pb-2 w-fit mx-auto">
              Basic templates
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 w-full gap-6 justify-items-center">
              {basicTemplates.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectTemplate(item)}
                  className="cursor-pointer flex items-center border rounded-2xl overflow-hidden w-[280px] h-[150px] max-w-sm hover:shadow-md transition"
                >
                  <div className="w-[250px] h-[147px] rounded-lg overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-gray-800 font-semibold">{item.title}</p>
                </div>
              ))}
            </div>
            <button
              className="mt-8 bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
              onClick={() => setShowMorePremium(!showMorePremium)}
            >
              {showMorePremium ? "SHOW LESS" : "SEE MORE"}
            </button>
          </section>
        </FadeInOnView>
      )}

      {showMorePremium && (
        <FadeInOnView>
          <section className="py-12 px-4 md:px-16 bg-white text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-300 pb-2 w-fit mx-auto">
              Premium templates
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 w-full gap-6 justify-items-center">
              {premiumTemplates.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectTemplate(item)}
                  className="cursor-pointer flex items-center border rounded-2xl overflow-hidden w-[280px] h-[150px] max-w-sm hover:shadow-md transition"
                >
                  <div className="w-[250px] h-[147px] rounded-lg overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-gray-800 font-semibold">{item.title}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeInOnView>
      )}

      {selectedTemplate && (
        <TemplateModal onClose={() => setSelectedTemplate(null)}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{selectedTemplate.title}</h2>
            {templateComponents[selectedTemplate.title] && (
              <div className="mt-4">
                {React.createElement(
                  templateComponents[selectedTemplate.title],
                  { courseId: courseId ?? "" }
                )}
              </div>
            )}
          </div>
        </TemplateModal>
      )}
    </>
  );
};

export default TemplatePage;
