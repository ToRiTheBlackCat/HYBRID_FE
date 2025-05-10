import React, { useState } from 'react';
import SetNewPasswordImage from "../assets/forgot-password.jpg";
import Logo from "../assets/Logo1_noBg.png";
import { FiEye } from 'react-icons/fi';

const SetNewPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
      console.log('New password set:', password);
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex">
          {/* Left Section */}
          <div className="w-1/2 p-10 flex flex-col justify-center items-center">
            <img src={Logo} alt="Your Logo" className="h-20 w-20" />
            <h2 className="text-2xl font-semibold mb-2">Set a password</h2>
            <p className="text-gray-600 mb-6">
              Your previous password has been reset. Please set a new password for your account.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Create Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 transform translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FiEye className="text-gray-500" size={20} />
                </button>
              </div>
              <div className="mb-4 relative">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Re-enter Password
                </label>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 transform translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <FiEye className="text-gray-500" size={20} />
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
              >
                Set password
              </button>
            </form>
          </div>
  
          {/* Right Section */}
          <div className="w-1/2 bg-gray-100 flex items-center justify-center rounded-r-lg">
            <img src={SetNewPasswordImage} alt="Set Password" className="w-3/4" />
          </div>
        </div>
      </div>
    );
  };
  
  export default SetNewPassword;