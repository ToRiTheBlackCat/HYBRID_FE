import React, { useRef, useState } from 'react';
import { FiMail, FiLock } from 'react-icons/fi';
import LoginImg from "../assets/LoginImg.jpg";
import Logo from "../assets/whitecat_logo2.jpg";
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { Login, LoginGoggle, StudentSignUp, TeacherSignUp, } from '../services/userService';
import { fetchUserProfile } from '../services/authService';
import { setUserRedux } from '../store/userSlice';
import { toast } from 'react-toastify';
import { GoogleLogin, CredentialResponse, GoogleOAuthProvider } from '@react-oauth/google';
import "react-toastify/dist/ReactToastify.css";
import { User } from '../types';
// import { jwtDecode } from "jwt-decode";

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAdditionalForm, setShowAdditionalForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [birthYear, setBirthYear] = useState<number>();
  const [userId, setUserId] = useState(''); // Lưu userId từ LoginGoggle
  const [userData, setUserData] = useState<User>();
  const roleRef = useRef('2');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState('Student');

  const handleGoogleLoginWithRole = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    try {
      const body = {
        token: credentialResponse.credential,
        roleId: roleRef.current,
      };
      console.log("Request", body)

      const userData = await LoginGoggle(body);
      console.log("Resposne ", userData)
      if (!userData || !userData.userId) {
        toast.error("Tài khoản đã chọn role khác trước đây. Vui lòng chọn role đúng");
        return;
      }

      const isTeacher = roleRef.current === "3";
      const profile = await fetchUserProfile(userData.userId, isTeacher);
      console.log(profile)

      const completeUserData = { ...userData, roleId: roleRef.current };
      // localStorage.setItem("refreshToken", completeUserData.accessToken); 
      dispatch(setUserRedux(completeUserData));
      Cookies.set("user", JSON.stringify(completeUserData), { expires: 7 });
      setUserId(userData.userId);
      setUserData(completeUserData);

      if (!profile) {
        toast.info("Vui lòng hoàn tất thông tin cá nhân");
        setShowAdditionalForm(true);
      } else {
        toast.success("Đăng nhập thành công");
        navigate(isTeacher ? "/" : "/student");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Lỗi khi đăng nhập bằng Google");
    }
  };


  const handleSaveAdditionalInfo = async () => {
    if (!fullName || !address || !phone || !birthYear) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      if (!userId) {
        toast.error("Không tìm thấy userId");
        return;
      }

      // Chuẩn bị dữ liệu cho StudentSignUp hoặc TeacherSignUp
      const additionalData = {
        userId,
        fullName,
        address,
        phone,
        yearOfBirth: birthYear,
      };

      // Gọi API phù hợp dựa trên role
      if (userData?.roleId === '2') {
        const result = await StudentSignUp(additionalData);
        if (result) {
          navigate("/student");
        }

      } else if (userData?.roleId === '3') {
        const result = await TeacherSignUp(additionalData);
        if (result) {
          navigate("/");
        }
      }

      toast.success("Thông tin đã được lưu");
    } catch (error) {
      console.error('Save additional info error:', error);
      toast.error("Lưu thông tin thất bại");
    }
  };

  const handleLoginClick = async () => {
    // setIsLoginGoogle(false)
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const userData = await Login(email, password);
      if (userData?.roleId === "1") {
        navigate("/admin")
      } else if (userData?.roleId === "2") {
        navigate("/student");
      }
      else if (userData?.roleId === "3") {
        navigate("/");
      }
      if (userData) {
        setUserData(userData)
        dispatch(setUserRedux(userData));
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });
        // localStorage.setItem("refreshToken", userData.refreshToken); 

        toast.success("Đăng nhập thành công");
      } else {
        toast.error("Đăng nhập thất bại");
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="625215731823-40khf1hvn3ola95ud9qcpkt5hpraq4eg.apps.googleusercontent.com">
      <div className="min-h-screen bg-gradient-to-br from-[#033f9f] via-[#1e4d8b] to-[#0f2557] flex flex-col relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <Link to="/" className="relative z-10 bg-white/95 backdrop-blur-sm py-6 px-8 mb-10 flex items-center shadow-lg border-b border-gray-200/50">
          <img src={Logo} alt="Logo" className="h-10 mr-3 transition-transform hover:scale-105" />
        </Link>

        {/* Login box or Additional Form */}
        <div className="flex-grow flex justify-center items-center relative z-10 p-4">
          {!showAdditionalForm ? (
            <div className="bg-gradient-to-r from-[#c7a7f8] via-[#a855f7] to-[#3b82f6] p-1 rounded-[40px] w-full max-w-4xl h-auto min-h-[400px] flex overflow-hidden shadow-2xl">
              {/* Left - image */}
              <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 m-6 rounded-3xl relative overflow-hidden">
                <img src={LoginImg} className="w-full h-full object-cover rounded-3xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
              </div>

              {/* Right - login form */}
              <div className="flex-1 bg-white m-6 rounded-3xl flex flex-col items-center justify-center px-8 py-6">
                <div className="w-full max-w-sm">
                  {/* Logo and title */}
                  <div className="text-center mb-8">
                    <img src={Logo} alt="Logo" className="h-20 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                  </div>

                  {/* Email input */}
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>

                  {/* Password input */}
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                  </div>

                  {/* Links */}
                  <div className="flex justify-between mb-6 text-sm">
                    <a href="/forgot-password" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                      Forgot Password?
                    </a>
                    <a href="/sign-up" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                      Create Account
                    </a>
                  </div>

                  {/* Login button */}
                  <button
                    type="button"
                    onClick={handleLoginClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    Sign In
                  </button>

                  {/* Divider */}
                  <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <span className="px-4 text-gray-500 text-sm bg-white">Or continue with</span>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>

                  {/* Social login */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowRoleDialog(true)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200 border border-gray-300 hover:border-gray-400"
                    >
                      🎭 Choose Role for Google Login
                    </button>

                    <div className="flex justify-center">
                      <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-xl overflow-hidden">
                        <GoogleLogin
                          useOneTap
                          onSuccess={handleGoogleLoginWithRole}
                          onError={() => console.log('Login Failed')}
                        />
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current role: {selectedRoleName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
                <p className="text-gray-600">Please fill in your details to continue</p>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter your address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Birth Year</label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter your birth year"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={roleRef.current}
                    disabled
                    onChange={(e) => (roleRef.current = e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                  >
                    <option value="2">Student</option>
                    <option value="3">Teacher</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAdditionalInfo}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  Complete Profile
                </button>
              </form>
            </div>
          )}

          {/* Role selection dialog */}
          {showRoleDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/20 transform transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Role</h2>
                  <p className="text-gray-600">Select your role to continue</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      roleRef.current = '2';
                      setSelectedRoleName('Student');
                      setShowRoleDialog(false);
                      toast.info("You selected: Student");
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    Student
                  </button>

                  <button
                    onClick={() => {
                      roleRef.current = '3';
                      setSelectedRoleName('Teacher');
                      setShowRoleDialog(false);
                      toast.info("You selected: Teacher");
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Teacher
                  </button>

                  <button
                    onClick={() => setShowRoleDialog(false)}
                    className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-xl font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;