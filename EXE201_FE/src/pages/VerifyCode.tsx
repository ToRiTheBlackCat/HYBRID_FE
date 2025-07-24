import React, { useState } from "react";
import VerifyCodeImage from "../assets/verify-code.jpg";
import Logo from "../assets/Logo2_noBg.png";
import { confirmReset } from "../services/userService"; // Updated to use confirmReset
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const data = {
        email,
        resetCode: code,
        password
      };
      const response = await confirmReset(data);
      if (response?.status === 200) { // Adjusted for API response
        toast.success("Password reset successful! You can now log in.");
        navigate("/login");
      } else {
        toast.error("Failed to reset password. Please check your details.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex flex-col md:flex-row">
        {/* Left Section */}
        <div className="w-full md:w-1/2 p-10 flex flex-col items-center">
          <img src={Logo} alt="Your Logo" className="h-20 w-20 mb-4" />
          <a
            href="/login"
            className="text-blue-500 hover:text-blue-700 text-sm mb-6"
          >
            &lt; Back to login
          </a>
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Verify Code and Reset Password
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            An authentication code has been sent to your email.
          </p>
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="code"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Reset Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your code"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  New Password
                </label>
                <input
                  type="password" // Changed to password for security
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your new password"
                  required
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Didn’t receive a code?{" "}
                <span className="text-red-500 cursor-pointer">Resend</span>
              </p>
              <button
                type="submit"
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 bg-gray-200 flex items-center justify-center rounded-r-lg">
          <img
            src={VerifyCodeImage}
            alt="Verify Code"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;