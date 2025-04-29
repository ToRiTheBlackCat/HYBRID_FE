import React, {useState} from "react";
import ParentInfoForm from "../components/SignUpForm/ParentInfoForm";
import StudentInfoForm from "../components/SignUpForm/StudentInfoForm";
import TeacherInfoForm from "../components/SignUpForm/TeacherInfoform";
import Header from "../components/HomePage/Header";
import Logo from "../assets/Logo1_noBg.png"

const SignUpPage : React.FC = () =>{
    const [role, setRole] = useState<'initial' | 'student' | 'teacher'>('initial');
    const [age, setAge] = useState('');
    const [submittedAge, setSubmittedAge] = useState<number | null>(null);

    const handleRoleSelection = (selectedRole: 'student' | 'teacher') => {
        if (selectedRole === 'student') {
          setRole('student');
        } else {
          setRole('teacher');
          // Nếu muốn redirect hoặc xử lý logic khác cho Teacher, làm tại đây
        }
      };
      const handleSubmitAge = () => {
        const numericAge = parseInt(age);
        if (!isNaN(numericAge)) {
          setSubmittedAge(numericAge);
        }
      };  
    return (
      <>
        <Header/>
        <div className="min-h-screen bg-[#4d6ec9] flex flex-col items-center justify-start">
          {/* Header */}
          
        {role === 'initial' && (
            <>
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-md mt-32 px-8 py-10 flex flex-col items-center gap-6 w-80">
            <img src={Logo} alt="logo" className="w-20 h-20" />
            {/* <h2 className="text-[#1e4c91] font-bold text-lg">HYBRID</h2> */}
            <p className="text-gray-500 text-lg">You are ?</p>
            <div className="flex gap-4">
              <button 
              onClick={() => handleRoleSelection('teacher')}
              className="bg-[#b4c9fa] hover:bg-[#a3bcf9] text-gray-800 font-medium px-5 py-2 rounded-lg shadow">
                Teacher
              </button>
              <button 
              onClick={() => handleRoleSelection('student')}
              className="bg-[#b4c9fa] hover:bg-[#a3bcf9] text-gray-800 font-medium px-5 py-2 rounded-lg shadow">
                Student
              </button>
            </div>
            </div>
            </>
        )}
        {role === 'student' && submittedAge === null && (
          <>
            <div className="bg-white rounded-2xl mt-32 px-8 py-10 flex flex-col items-center gap-0 w-80">
            <p className="text-gray-500 text-lg mb-3">How old are you?</p>
            <input
              type="number"
              placeholder="Enter your age"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={1}
              max={100}
              step={1}
            />
            <button type="submit" 
              onClick={handleSubmitAge}
              className="bg-violet-500 rounded-2xl px-4 py-2 mt-5 hover:bg-violet-700 transition" >Submit</button>
            </div>
          </>
        )}
          {role === "student" && submittedAge !== null && parseInt(age) < 12 && <ParentInfoForm/>}
          {role === "student" && submittedAge !== null && parseInt(age) >= 12 && <StudentInfoForm/>}
          {role === "teacher" && <TeacherInfoForm/>}
        </div>
        </>
      );
}
export default SignUpPage