import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import AboutUsPage from "../pages/AboutUsPage";
import ForgotPassword from "../pages/ForgotPassword";
import TemplatePage from "../pages/TemplatePage";
import VerifyCode from "../pages/VerifyCode";
import PricingPage from "../pages/PricingPage";
import PaymentPage from "../pages/PaymentPage";
import StudentPage from "../pages/Student/StudentPage";
import ProcessingPayment from "../pages/ProcessingPayment";


export const publicRoutes = [
    {path: "/", element: <HomePage />},
    {path: "/login", element: <LoginPage/>},
    {path: "/sign-up", element: <SignUpPage/>},
    {path: "/about-us", element: <AboutUsPage/>},
    {path: "/forgot-password", element: <ForgotPassword/>},
    {path: "/template", element : <TemplatePage/>},
    {path: "/verify-code",element: <VerifyCode/>},
    {path: "/pricing", element: <PricingPage/>},
    {path: "/payment", element: <PaymentPage/>},
    {path: "/student", element: <StudentPage/>},
    {path: "/processing-payment",element: <ProcessingPayment/>}
    
];