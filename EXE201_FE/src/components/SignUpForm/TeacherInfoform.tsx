import React, { useState } from 'react';
import Logo from '../../assets/Logo2_noBg.png';
import { toast } from 'react-toastify';

interface TeacherInfoFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    fullName: string;
    address?: string;
    phone: string;
    birthYear?: string;
  }) => void;
}

const TeacherInfoForm: React.FC<TeacherInfoFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    address: "",
    phone: "",
    birthYear: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      setIsSubmitting(true)
      onSubmit({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        address: formData.address || undefined,
        phone: formData.phone,
        birthYear: formData.birthYear || undefined,
      });
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false); // 👈 mở lại nút sau khi xong
    }
  };

  return (
    <div className='bg-white border border-black rounded-2xl flex flex-col items-center gap-0 w-220 mt-25 '>
      <div className="flex flex-col items-center mb-8">
        <img src={Logo} alt="logo" className="w-25 h-20" />
        <p className="text-2xl text-gray-700 mt-2 font-medium">Information of Teacher</p>
      </div>

      <form
        className="w-200 m-5 mr-3 ml-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700"
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          name="email"
          placeholder="Teacher's email*"
          className="border-b p-2 outline-none"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="fullName"
          placeholder="Teacher's full name*"
          className="border-b p-2 outline-none"
          required
          value={formData.fullName}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password*"
          className="border-b p-2 outline-none"
          required
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Teacher's phone*"
          className="border-b p-2 outline-none"
          required
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password*"
          className="border-b p-2 outline-none"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          className="border-b p-2 outline-none"
          value={formData.address}
          onChange={handleChange}
        />
        <input
          type="number"
          name="birthYear"
          placeholder="Year of birth"
          className="border-b p-2 outline-none"
          min="1900"
          max={new Date().getFullYear()}
          value={formData.birthYear}
          onChange={handleChange}
        />

        <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-4">
          <input type="checkbox" id="agree" required />
          <label htmlFor="agree">
            I have read and agree to the{" "}
            <a href="#" className="text-blue-500 underline">Terms of Service</a> and{" "}
            <a href="#" className="text-blue-500 underline">Privacy Policy</a>.
          </label>
        </div>

        <div className="col-span-1 md:col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#1e4c91] text-white px-6 py-2 rounded-full shadow hover:bg-blue-700 transition"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherInfoForm;
