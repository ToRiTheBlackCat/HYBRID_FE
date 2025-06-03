import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import AboutUsPage from "../pages/AboutUsPage";
import ForgotPassword from "../pages/ForgotPassword";
import TemplatePage from "../pages/TemplatePage";
import VerifyCode from "../pages/VerifyCode";
import PricingPage from "../pages/PricingPage";
import FlashcardDesigner from "../pages/Template/Flashcard";
import FlashcardReview from "../pages/Template/FLashcardReview";
import PaymentPage from "../pages/PaymentPage";
import CompletionTemplate from "../pages/Template/Basic/Conpletion";
import CompletionReview from "../pages/Template/Basic/CompletionReview";
import PairingScreen from "../pages/Template/Basic/Pairing";
import PairingReview from "../pages/Template/Basic/PairingReview";
import RestorationScreen from "../pages/Template/Basic/Restoration";
import RestorationReview from "../pages/Template/Basic/RestorationReview";
import FindWordsScreen from "../pages/Template/Basic/FindWords";
import FindWordsReview from "../pages/Template/Basic/FindWordsReview";
import TrueFalse from "../pages/Template/Basic/TrueFalse";
import TrueFalseReview from "../pages/Template/Basic/TrueFalseReview";
import CrosswordEditor from "../pages/Template/Basic/Crossword";
import CrosswordReview from "../pages/Template/Basic/CrosswordReview";

export const publicRoutes = [
    {path: "/", element: <HomePage />},
    {path: "/login", element: <LoginPage/>},
    {path: "/sign-up", element: <SignUpPage/>},
    {path: "/about-us", element: <AboutUsPage/>},
    {path: "/forgot-password", element: <ForgotPassword/>},
    {path: "/template", element : <TemplatePage/>},
    {path: "/verify-code",element: <VerifyCode/>},
    {path: "/pricing", element: <PricingPage/>},
    {path: "/flashcard", element: <FlashcardDesigner/>},
    {path: "/flashcard-review", element: <FlashcardReview/>},
    {path: "/payment", element: <PaymentPage/>},
    {path: "/completion", element: <CompletionTemplate/>},
    {path: "/completion-review", element: <CompletionReview/>},
    {path: "/pairing", element: <PairingScreen/>},
    {path: "/pairing-review", element: <PairingReview/>},
    {path: "/restoration", element: <RestorationScreen/>},
    {path: "/restoration-review", element: <RestorationReview/>},
    {path: "/find-word", element: <FindWordsScreen/>},
    {path: "/find-word-review", element: <FindWordsReview/>},
    {path: "/true-false", element: <TrueFalse/>},
    {path: "/true-false-review", element: <TrueFalseReview/>},
    {path: "/crossword", element: <CrosswordEditor/>},
    {path: "/crossword-review", element: <CrosswordReview/>}
];