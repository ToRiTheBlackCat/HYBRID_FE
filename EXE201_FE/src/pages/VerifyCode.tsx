import React, { useState } from "react";
import VerifyCodeImage from "../assets/verify-code.jpg";
import Logo from "../assets/Logo2_noBg.png";


const VerifyCode: React.FC = () => {
    const [code, setCode] = useState("");
    // const [showCode, setShowCode] = useState(false);
    const showCode = true;
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Code submitted:", code);
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex">
          {/* Left Section */}
          <div className="w-1/2 p-10 flex flex-col justify-center items-center">
            <img src={Logo} alt="Your Logo" className="h-20 w-20" />
            <a
              href="/login"
              className="text-blue-500 hover:text-blue-700 text-sm mb-4"
            >
              &lt; Back to login
            </a>
            <h2 className="text-2xl font-semibold mb-2">Verify code</h2>
            <p className="text-gray-600 mb-6">
              An authentication code has been sent to your email.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="code"
                >
                  Enter Code
                </label>
                <input
                  type={showCode ? "text" : "password"}
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  placeholder="Enter your code"
                  required
                />
                {/* <button
                  type="button"
                  className="absolute right-3 top-10 transform -translate-y-1/2"
                  onClick={() => setShowCode(!showCode)}
                >
                  <FiEye className="text-gray-500" size={20} />
                </button> */}
              </div>
              <p className="text-sm text-gray-600">
                Didn’t receive a code?{" "}
                <span className="text-red-500 cursor-pointer">Resend</span>
              </p>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
              >
                Verify
              </button>
            </form>
          </div>
  
          {/* Right Section */}
          <div className="w-1/2 bg-gray-100 flex items-center justify-center rounded-r-lg">
            <img src={VerifyCodeImage} alt="Verify Code" className="w-3/4" />
          </div>
        </div>
      </div>
    );
  };
  
  export default VerifyCode;
  