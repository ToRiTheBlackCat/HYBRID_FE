// import ConjunctionTemplate from '../pages/Template/Conjunction';
import ConjunctionReview from '../pages/Template/ConjunctionReview';
// import AnagramTemplate from '../pages/Template/Anagram';
// import AnagramReview from '../pages/Template/AnagramReview';
import CoursePage from '../pages/CoursePage';
// import Quiz from '../pages/Template/Quiz';
// import QuizReview from '../pages/Template/QuizReview';
// import RandomCard from '../pages/Template/RandomCard';
// import RandomCardReview from '../pages/Template/RandomCardReview';
// import Spelling from '../pages/Template/Spelling';
// import ProfilePage from '../pages/ProfilePage';
// import SpellingReview from '../pages/Template/SpellingReview';
// import CompletionTemplate from "../pages/Template/Basic/Conpletion";
// import CompletionReview from "../pages/Template/Basic/CompletionReview";
// import PairingScreen from "../pages/Template/Basic/Pairing";
// import PairingReview from "../pages/Template/Basic/PairingReview";
// import RestorationScreen from "../pages/Template/Basic/Restoration";
// import RestorationReview from "../pages/Template/Basic/RestorationReview";
// import FindWordsScreen from "../pages/Template/Basic/FindWords";
// import FindWordsReview from "../pages/Template/Basic/FindWordsReview";
// import TrueFalse from "../pages/Template/Basic/TrueFalse";
// import TrueFalseReview from "../pages/Template/Basic/TrueFalseReview";
// import CrosswordEditor from "../pages/Template/Basic/Crossword";
// import CrosswordReview from "../pages/Template/Basic/CrosswordReview";
import CourseDetail from '../pages/CourseDetail';
import TeacherCourseDetail from '../pages/Teacher/TeacherCourseDetail';
import TeacherActivities from '../pages/Teacher/TeacherActivities';
import PlayConjunction from '../pages/Student/Template/PlayConjunction';

export const privateRoutes = [
    // {path: "/conjunction", element: <ConjunctionTemplate/>},
    {path: "/teacher/conjunction-review/:minigameId", element: <ConjunctionReview/>},
    // {path: "/anagram", element: <AnagramTemplate/>},
    // {path: "/anagram-review", element: <AnagramReview/>},
    
    // {path: "/quiz", element: <Quiz/>},
    // {path: "/quiz-review", element: <QuizReview/>},
    // {path: "/random-card", element: <RandomCard/>},
    // {path: "/random-card-review", element: <RandomCardReview/>},
    // {path: "/spelling", element: <Spelling/>},
    // {path: "/profile", element: <ProfilePage/>},
    // {path: "/spelling-review", element: <SpellingReview/>},
    // {path: "/completion", element: <CompletionTemplate/>},
    // {path: "/completion-review", element: <CompletionReview/>},
    // {path: "/pairing", element: <PairingScreen/>},
    // {path: "/pairing-review", element: <PairingReview/>},
    // {path: "/restoration", element: <RestorationScreen/>},
    // {path: "/restoration-review", element: <RestorationReview/>},
    // {path: "/find-word", element: <FindWordsScreen/>},
    // {path: "/find-word-review", element: <FindWordsReview/>},
    // {path: "/true-false", element: <TrueFalse/>},
    // {path: "/true-false-review", element: <TrueFalseReview/>},
    // {path: "/crossword", element: <CrosswordEditor/>},
    // {path: "/crossword-review", element: <CrosswordReview/>},
    {path: "/course", element: <CoursePage/>},
    {path: "/student/course/:courseId", element: <CourseDetail/>},
    {path: "/teacher/course/:courseId", element: <TeacherCourseDetail/>},
    {path: "/teacher/activities", element: <TeacherActivities/>},
    {path: "/student/conjunction/:minigameId", element: <PlayConjunction/>},
]