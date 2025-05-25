import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { FiMail, FiLock } from 'react-icons/fi';
import LoginImg from "../assets/LoginImg.jpg";
import Logo from "../assets/whitecat_logo2.jpg"
import { Link } from 'react-router-dom';
import { setUserRedux } from '../store/userSlice';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import {Login} from '../services/userService';
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';


const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const naigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  }); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try{
      const userData = await Login(formData.email, formData.password);
      if(userData){
        dispatch(setUserRedux(userData));
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });
        toast.success("Đăng nhập thành công");
        naigate("/");
      }else{
        toast.error("Đăng nhập thất bại");
      }
    }catch (error) {
      console.error('Login error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-[#033f9f] flex flex-col">
      {/* Header */}
      <Link to="/" className="bg-white py-4 px-8 mb-10 flex items-center shadow-md">
        <img src={Logo} alt="Logo" className="h-8 mr-2" />
        {/* <span className="text-xl font-bold text-[#3d6fc2]">HYBRID</span> */}
      </Link>

      {/* Login box */}
      <form onSubmit={handleSubmit}>
        <div className="flex-grow flex justify-center items-center">
          <div className="bg-gradient-to-r from-[#c7a7f8] to-blue-500 p-0.5 rounded-[30px] w-[800px] h-[450px] flex overflow-hidden">
            {/* Left - image placeholder */}
            {/* <div className="flex-1 bg-gray-200 m-6 rounded-xl" /> */}
            <img src={LoginImg} className="flex-1 bg-gray-200 m-6 rounded-xl"/>

            {/* Right - login form */}
            <div className="flex-1 bg-white m-6 rounded-xl flex flex-col items-center justify-center px-6">
              <img src={Logo} alt="Logo" className="h-16 mb-2" />
              {/* <h1 className="text-2xl font-bold text-[#3d6fc2] mb-6">HYBRID</h1> */}

              <div className="w-full flex items-center border-b border-gray-300 py-2 mb-4">
                <FiMail className="text-gray-400 mr-2 text-lg" />
                <input
                  name='email'
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-1 focus:outline-none text-sm"
                />
              </div>

              {/* Password Input */}
              <div className="w-full flex items-center border-b border-gray-300 py-2 mb-2">
                <FiLock className="text-gray-400 mr-2 text-lg" />
                <input
                  name='password'
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="flex-1 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-between w-full text-sm mb-4 text-blue-600">
                <a href="/forgot-password" className="hover:underline">Forgot Password?</a>
                <a href="/sign-up" className="hover:underline">Not have account yet?</a>
              </div>

              <button 
                type="submit"
                className="bg-[#3d6fc2] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">
                Login
              </button>

              <div className="my-4 text-gray-500 text-sm">Or Login with</div>

              <div className="flex gap-4">
                <button className="bg-white border p-2 rounded-full shadow hover:shadow-md transition">
                  <FcGoogle className="text-xl" />
                </button>
                <button className="bg-white border p-2 rounded-full shadow hover:shadow-md transition text-blue-600">
                  <FaFacebook className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
