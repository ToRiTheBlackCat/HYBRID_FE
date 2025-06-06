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
import StudentPage from "../pages/Student/StudentPage";


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
    {path: "/student", element: <StudentPage/>}
    
];