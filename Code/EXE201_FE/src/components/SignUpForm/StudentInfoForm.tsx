import React from "react";

const StudentInfoForm : React.FC = () =>{
    return (
        <div className='bg-white border border-black rounded-2xl flex flex-col items-center gap-0 w-220 mt-25 '>
            <div className="flex flex-col items-center mb-8">
                <img src="/logo.png" alt="logo" className="w-12 h-12" />
                <h2 className="text-[#1e4c91] font-bold text-xl">HYBRID</h2>
                <p className="text-2xl text-gray-700 mt-2 font-medium">Information of Student</p>
            </div>
            <form className="w-200 m-5 mr-3 ml-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <input type="email" placeholder="Email*" className="border-b p-2 outline-none" required />
            <input type="text" placeholder="FullName*" className="border-b p-2 outline-none" required />
            <input type="password" placeholder="Password*" className="border-b p-2 outline-none" required />
            <input type="tel" placeholder="Phone*" className="border-b p-2 outline-none" required />
            <input type="password" placeholder="Confirm password*" className="border-b p-2 outline-none" required />
            <input type="text" placeholder="Address" className="border-b p-2 outline-none" />
        
            <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-4">
                <input type="checkbox" id="agree" required />
                <label htmlFor="agree">
                I have read and agree to the <a href="#" className="text-blue-500 underline">Terms of Service</a> and <a href="#" className="text-blue-500 underline">Privacy Policy</a>.
                </label>
            </div>
        
            <div className="col-span-1 md:col-span-2 flex justify-center mt-2">
                <button
                type="submit"
                className="bg-[#1e4c91] text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition"
                >
                Sign up
                </button>
            </div>
            </form>
        </div>
      );
    };
export default StudentInfoForm