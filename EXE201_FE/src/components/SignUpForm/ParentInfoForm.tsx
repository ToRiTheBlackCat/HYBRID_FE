import React, { useState } from 'react';
import Logo from '../../assets/Logo2_noBg.png';
import { toast } from 'react-toastify';

interface ParentInfoFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
    fullName: string;
    address?: string;
    phone: string;
    birthYear: number;
  }) => void;
}

const ParentInfoForm: React.FC<ParentInfoFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    address: "",
    phone: "",
    confirmPassword: "",
    birthYear: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const year = Number(formData.birthYear);
    if (!year || year < 1900 || year > new Date().getFullYear()) {
      toast.error("Please enter a valid birth year");
      return;
    }

    onSubmit({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      address: formData.address,
      phone: formData.phone,
      birthYear: year,
    });
  };

  return (
    <div className='bg-white border border-black rounded-2xl flex flex-col items-center gap-0 w-220 mt-25'>
      <div className="flex flex-col items-center mb-8">
        <img src={Logo} alt="logo" className="w-25 h-20" />
        <p className="text-2xl text-gray-700 mt-2 font-medium">Information of Parent</p>
      </div>

      <form
        className="w-200 m-5 mr-3 ml-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700"
        onSubmit={handleSubmit}
      >
        <input type="email" name='email' placeholder="Parent's email*" className="border-b p-2 outline-none" required value={formData.email} onChange={handleChange} />
        <input type="text" name='fullName' placeholder="Parent's full name*" className="border-b p-2 outline-none" required value={formData.fullName} onChange={handleChange} />
        <input type="password" name='password' placeholder="Password*" className="border-b p-2 outline-none" required value={formData.password} onChange={handleChange} />
        <input type="tel" name='phone' placeholder="Parent's phone*" className="border-b p-2 outline-none" required value={formData.phone} onChange={handleChange} />
        <input type="password" name='confirmPassword' placeholder="Confirm password*" className="border-b p-2 outline-none" required value={formData.confirmPassword} onChange={handleChange} />
        <input type="text" name='address' placeholder="Address" className="border-b p-2 outline-none" required value={formData.address} onChange={handleChange} />
        <input type="number" name="birthYear" placeholder="Birth year*" className="border-b p-2 outline-none" required value={formData.birthYear} onChange={handleChange} />

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

export default ParentInfoForm;
