import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import TemplatePage from './pages/TemplatePage';
import AboutUsPage from './pages/AboutUsPage';
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
      </Routes>
    </Router>
    </>
  )
}

export default App
