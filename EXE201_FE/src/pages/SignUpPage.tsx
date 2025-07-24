import React, { useState } from "react";
import ParentInfoForm from "../components/SignUpForm/ParentInfoForm";
import StudentInfoForm from "../components/SignUpForm/StudentInfoForm";
import TeacherInfoForm from "../components/SignUpForm/TeacherInfoform";
import Header from "../components/HomePage/Header";
import Logo from "../assets/Logo1_noBg.png";
import { SignUp, StudentSignUp, TeacherSignUp } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SignUpPage: React.FC = () => {
  const [role, setRole] = useState<'initial' | 'student' | 'teacher'>('initial');
  const [age, setAge] = useState('');
  const [submittedAge, setSubmittedAge] = useState<number | null>(null);
  const navigate = useNavigate();
  // const [userId, setUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    address: "",
    phone: "",
    yearOfBirth: 0,
    roleId: "1",
    tierId: "1",
  });

  const handleRoleSelection = (selectedRole: 'student' | 'teacher') => {
    if (selectedRole === 'student') {
      setRole('student');
      setFormData((prev) => ({ ...prev, roleId: "2" }));
    } else {
      setRole('teacher');
      setFormData((prev) => ({ ...prev, roleId: "3" }));
    }
  };

  const handleSubmitAge = () => {
    const numericAge = parseInt(age);
    if (!isNaN(numericAge)) {
      setSubmittedAge(numericAge);
      const currentYear = new Date().getFullYear();
      setFormData((prev) => ({
        ...prev,
        yearOfBirth: currentYear - numericAge,
      }));
    }
  };

  const handleFormSubmit = async (data: {
    email: string;
    password: string;
    fullName: string;
    address?: string;
    phone: string;
  }) => {
    const finalData = {
      ...formData,
      ...data,
      yearOfBirth: formData.yearOfBirth || 0,
    };

    try {
      // Step 1: Call SignUp to create the user
      const signUpResponse = await SignUp({
        email: finalData.email,
        password: finalData.password,
        roleId: finalData.roleId,
      });
      console.log("SignUp response:", signUpResponse);

      if (signUpResponse.isSuccess === true) {
        // toast.success("User created successfully");
        // setUserId(signUpResponse.userId); // Save userId for later use

        const roleSpecificData = {
          userId: signUpResponse.userId,
          fullName: finalData.fullName,
          address: finalData.address || "",
          phone: finalData.phone,
          yearOfBirth: finalData.yearOfBirth,
        };

        let roleResponse;
        console.log("Role-specific data:", roleSpecificData);
        if (role === "student") {
          roleResponse = await StudentSignUp(roleSpecificData);
        } else if (role === "teacher") {
          roleResponse = await TeacherSignUp(roleSpecificData);
        }

        if (roleResponse?.isSuccess === true) {
          toast.success("Đăng kí thành công");
          navigate("/login");
        } else {
          toast.error(roleResponse?.message || "Role-specific signup failed");
        }
      } else {
        toast.error(signUpResponse.message);
      }
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error("An error occurred during signup");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#4d6ec9] flex flex-col items-center justify-start">
        {role === 'initial' && (
          <div className="bg-white rounded-2xl shadow-md mt-32 px-8 py-10 flex flex-col items-center gap-6 w-80">
            <img src={Logo} alt="logo" className="w-20 h-20" />
            <p className="text-gray-500 text-lg">You are ?</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleRoleSelection('teacher')}
                className="bg-[#b4c9fa] hover:bg-[#a3bcf9] text-gray-800 font-medium px-5 py-2 rounded-lg shadow"
              >
                Teacher
              </button>
              <button
                onClick={() => handleRoleSelection('student')}
                className="bg-[#b4c9fa] hover:bg-[#a3bcf9] text-gray-800 font-medium px-5 py-2 rounded-lg shadow"
              >
                Student
              </button>
            </div>
          </div>
        )}
        {role === 'student' && submittedAge === null && (
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
            <button
              type="submit"
              onClick={handleSubmitAge}
              className="bg-violet-500 rounded-2xl px-4 py-2 mt-5 hover:bg-violet-700 transition"
            >
              Submit
            </button>
          </div>
        )}
        {role === "student" && submittedAge !== null && parseInt(age) < 12 && (
          <ParentInfoForm onSubmit={handleFormSubmit} />
        )}
        {role === "student" && submittedAge !== null && parseInt(age) >= 12 && (
          <StudentInfoForm onSubmit={handleFormSubmit} />
        )}
        {role === "teacher" && <TeacherInfoForm onSubmit={handleFormSubmit} />}
      </div>
    </>
  );
};

export default SignUpPage;