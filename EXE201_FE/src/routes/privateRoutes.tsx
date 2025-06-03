import ConjunctionTemplate from '../pages/Template/Conjunction';
import ConjunctionReview from '../pages/Template/ConjunctionReview';
import AnagramTemplate from '../pages/Template/Anagram';
import AnagramReview from '../pages/Template/AnagramReview';
import CoursePage from '../pages/CoursePage';
import Quiz from '../pages/Template/Quiz';
import QuizReview from '../pages/Template/QuizReview';
import RandomCard from '../pages/Template/RandomCard';
import RandomCardReview from '../pages/Template/RandomCardReview';
import Spelling from '../pages/Template/Spelling';
import ProfilePage from '../pages/ProfilePage';
import SpellingReview from '../pages/Template/SpellingReview';

export const privateRoutes = [
    {path: "/conjunction", element: <ConjunctionTemplate/>},
    {path: "/conjunction-review", element: <ConjunctionReview/>},
    {path: "/anagram", element: <AnagramTemplate/>},
    {path: "/anagram-review", element: <AnagramReview/>},
    {path: "/course", element: <CoursePage/>},
    {path: "/quiz", element: <Quiz/>},
    {path: "/quiz-review", element: <QuizReview/>},
    {path: "/random-card", element: <RandomCard/>},
    {path: "/random-card-review", element: <RandomCardReview/>},
    {path: "/spelling", element: <Spelling/>},
    {path: "/profile", element: <ProfilePage/>},
    {path: "/spelling-review", element: <SpellingReview/>},
]