import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import TemplatePage from './pages/TemplatePage';
import AboutUsPage from './pages/AboutUsPage';
import ForgotPassword from './pages/ForgotPassword';
import ConjunctionTemplate from './pages/Template/Conjunction';
import ConjunctionReview from './pages/Template/ConjunctionReview';
import AnagramTemplate from './pages/Template/Anagram';
import AnagramReview from './pages/Template/AnagramReview';
import CoursePage from './pages/CoursePage';
import Quiz from './pages/Template/Quiz';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/sign-up' element={<SignUpPage/>}/>
        <Route path='/template' element={<TemplatePage/>}/>
        <Route path='/about-us' element={<AboutUsPage/>}/>
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/conjunction' element={<ConjunctionTemplate/>}/>
        <Route path='/conjunction-preview' element={<ConjunctionReview/>}/>
        <Route path='/anagram' element={<AnagramTemplate/>}/>
        <Route path='/anagram-review' element={<AnagramReview/>}/>
        <Route path='/course' element={<CoursePage/>}/>
        <Route path='/quiz' element={<Quiz/>}/>
        {/* Add more routes for other templates here */}
      </Routes>
    </Router>
    </>
  )
}

export default App
