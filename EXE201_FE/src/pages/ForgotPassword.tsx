import React, { useState } from 'react';
import forgotPasswordImage from '../assets/forgot-password.jpg';
import Logo from '../assets/Logo1_noBg.png';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Email submitted:', email);
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex">
          {/* Left Section */}
          <div className="w-1/2 p-10 flex flex-col justify-center">
            <img src={Logo} alt="Your Logo" className="h-25 w-25" />
            <a href="/login" className="text-blue-500 hover:text-blue-700 text-sm mb-4">&lt; Back to login</a>
            <h2 className="text-2xl font-semibold mb-2">Forgot your password?</h2>
            <p className="text-gray-600 mb-6">
              Don't worry, happens to all of us. Enter your email below to recover your password.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@gmail.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Submit
              </button>
            </form>
          </div>
  
          {/* Right Section */}
          <div className="w-1/2 bg-gray-100 flex items-center justify-center rounded-r-lg">
            <img src={forgotPasswordImage} alt="Forgot Password" className="w-3/4" />
          </div>
        </div>
      </div>
    );
  };
  
  export default ForgotPassword;