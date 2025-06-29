import React, { useState } from 'react';
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
import { Dialog } from '@headlessui/react';
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
  const [birthYear, setBirthYear] = useState('');
  // const [role, setRole] = useState('2'); // Mặc định là "student" với giá trị 2
  const [userId, setUserId] = useState(''); // Lưu userId từ LoginGoggle
  const [pendingToken, setPendingToken] = useState<string | null>(null);   // token từ Google
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [isLoginGoogle, setIsLoginGoogle] = useState<boolean>(false);
  const [userData, setUserData] = useState<User>();

  const handleGoogleLogin = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    // Lưu token để dùng sau, mở modal chọn vai trò
    setPendingToken(credentialResponse.credential);
    setRoleModalOpen(true);
    setIsLoginGoogle(true)
  };

  const loginWithGoogle = async (roleId: "2" | "3") => {

    if (!pendingToken) return;
    setRoleModalOpen(false);
    try {
      const body = {
        token: pendingToken,
        roleId: roleId
      }
      const initialUserData = await LoginGoggle(body);
      
      const isTeacher = roleId === "3";
      console.log(initialUserData);
      if (initialUserData && initialUserData.userId) {
        dispatch(setUserRedux(initialUserData));

        Cookies.set('user', JSON.stringify(initialUserData), { expires: 7 });
        setUserId(initialUserData.userId); // Lưu userId
        if (!roleId) {
          setShowAdditionalForm(true); // Hiển thị form bổ sung
        }
        else {
          const checkProfile = await fetchUserProfile(initialUserData.userId, isTeacher);
          if (!checkProfile) {
            setShowAdditionalForm(true)
          } else {
            initialUserData.roleId = roleId;
            console.log(initialUserData);
            dispatch(setUserRedux(initialUserData));
            if (roleId === "3") {
              navigate("/")
            } else if (roleId === "2") {
              navigate("/student")
            }
          }
        }
      } else {
        toast.error("Đăng nhập thất bại hoặc không tìm thấy userId");
      }
    } catch (error) {
      console.error('Login error:', error);
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
        yearOfBirth: parseInt(birthYear),
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
      navigate("/");
    } catch (error) {
      console.error('Save additional info error:', error);
      toast.error("Lưu thông tin thất bại");
    }
  };

  const handleSelectRole = async (roleId: "2" | "3") => {
    setRoleModalOpen(false);
    if (userData) {
      // console.log(userData);
      setUserId(userData.userId);
      userData.roleId = roleId;
      dispatch(setUserRedux(userData));
      console.log("UserData", userData);
      const isTeacher = roleId === "3";
      const checkProfile = await fetchUserProfile(userData.userId, isTeacher);
      if (!checkProfile) {
        setShowAdditionalForm(true)
      } else {
        // userData.roleId = roleId;
        // dispatch(setUserRedux(userData));
        // // console.log("UserData", userData);
        if (roleId === "3") {
          navigate("/")
        } else if (roleId === "2") {
          navigate("/student")
        }
      }
    }
  }

  const handleLoginClick = async () => {
    setIsLoginGoogle(false)
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const userData = await Login(email, password);
      if(userData?.roleId==="1"){
        setRoleModalOpen(false);
        navigate("/admin")
      }
      if (userData) {
        setUserData(userData)

        dispatch(setUserRedux(userData));
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });

        toast.success("Đăng nhập thành công");
        setRoleModalOpen(true);
      } else {
        toast.error("Đăng nhập thất bại");
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId="625215731823-40khf1hvn3ola95ud9qcpkt5hpraq4eg.apps.googleusercontent.com">
      <div className="min-h-screen bg-[#033f9f] flex flex-col">
        {/* Header */}
        <Link to="/" className="bg-white py-4 px-8 mb-10 flex items-center shadow-md">
          <img src={Logo} alt="Logo" className="h-8 mr-2" />
        </Link>

        {/* Login box or Additional Form */}
        <div className="flex-grow flex justify-center items-center">
          {!showAdditionalForm ? (
            <div className="bg-gradient-to-r from-[#c7a7f8] to-blue-500 p-0.5 rounded-[30px] w-[800px] h-[450px] flex overflow-hidden">
              {/* Left - image */}
              <img src={LoginImg} className="flex-1 bg-gray-200 m-6 rounded-xl" />

              {/* Right - login form */}
              <div className="flex-1 bg-white m-6 rounded-xl flex flex-col items-center justify-center px-6">
                <img src={Logo} alt="Logo" className="h-16 mb-2" />

                {/* Email input */}
                <div className="w-full flex items-center border-b border-gray-300 py-2 mb-4">
                  <FiMail className="text-gray-400 mr-2 text-lg" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 focus:outline-none text-sm"
                  />
                </div>

                {/* Password input */}
                <div className="w-full flex items-center border-b border-gray-300 py-2 mb-2">
                  <FiLock className="text-gray-400 mr-2 text-lg" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 focus:outline-none text-sm"
                  />
                </div>

                {/* Links */}
                <div className="flex justify-between w-full text-sm mb-4 text-blue-600">
                  <a href="/forgot-password" className="hover:underline">Forgot Password?</a>
                  <a href="/sign-up" className="hover:underline">Not have account yet?</a>
                </div>

                {/* Login button */}
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="bg-[#3d6fc2] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
                >
                  Login
                </button>

                <div className="my-4 text-gray-500 text-sm">Or Login with</div>

                {/* Social login */}
                <div className="flex gap-4">
                  <div className="bg-white shadow hover:shadow-md transition">
                    <GoogleLogin
                      useOneTap
                      onSuccess={handleGoogleLogin}
                      onError={() => console.log('Login Failed')}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-md w-[400px]">
              <h2 className="text-2xl font-bold mb-4 text-center">Complete Your Profile</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Birth Year</label>
                <input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                />
              </div>
              {/* <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 p-2 w-full border rounded"
                >
                  <option value="2">Student</option>
                  <option value="3">Teacher</option>
                </select>
              </div> */}
              <button
                onClick={handleSaveAdditionalInfo}
                className="w-full bg-[#3d6fc2] text-white p-2 rounded-full hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
      <Dialog open={roleModalOpen} onClose={() => setRoleModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg max-w-sm w-full p-6 space-y-4 text-center">
            <Dialog.Title className="text-xl font-bold">You are…</Dialog.Title>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => isLoginGoogle ? loginWithGoogle("2") : handleSelectRole("2")}      // Student = 2
                className="py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                👩‍🎓 Student
              </button>
              <button
                onClick={() => isLoginGoogle ? loginWithGoogle("3") : handleSelectRole("3")}      // Teacher = 3
                className="py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
              >
                👨‍🏫 Teacher
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;