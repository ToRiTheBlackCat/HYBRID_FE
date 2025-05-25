import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from "../assets/Logo.jpg"
import Header from '../components/HomePage/Header';

const plans = [
  {
    name: 'FREE',
    current: true,
    price: '',
    features: [true, false, false, false],
  },
  {
    name: 'BASIC',
    current: false,
    price: '30.000 VND /month',
    features: [true, true, true, false],
  },
  {
    name: 'PREMIUM',
    current: false,
    price: '60.000 VND /month',
    features: [true, true, true, true],
  },
];

const features = ['Free content', 'Func1', 'Func2', 'Func3'];

const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-[#4e71b3] flex flex-col items-center justify-center text-sm">
      {/* Logo and title */}
      

      {/* Plan cards */}
      <div className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center">
        {/* Logo */}
        <div className="mb-4">
            <img src={Logo} alt="logo" className="h-14 mx-auto" />
        </div>

        {/* Danh sách các loại tài khoản: nằm ngang */}
        <div className="flex gap-6 justify-center flex-wrap">
            {plans.map((plan, index) => (
            <div
                key={plan.name}
                className="bg-[#d6e4ff] rounded-xl px-6 py-4 flex flex-col items-center w-52"
            >
                <h2 className="text-xl font-semibold text-center text-blue-800">
                {plan.name}{" "}
                {plan.current && (
                    <span className="text-xs text-red-500">(current)</span>
                )}
                </h2>
                <ul className="mt-4 mb-4 space-y-2 text-sm">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                    {plan.features[i] ? (
                        <CheckCircle className="text-green-500 w-5 h-5" />
                    ) : (
                        <XCircle className="text-red-500 w-5 h-5" />
                    )}
                    {feature}
                    </li>
                ))}
                </ul>
                {plan.price && (
                <p className="text-red-500 text-sm font-semibold mb-2">
                    {plan.price}
                </p>
                )}
                <button className="text-blue-700 border border-blue-700 px-3 py-1 rounded hover:bg-blue-100">
                See detail
                </button>
            </div>
            ))}
        </div>

        {/* Nút Back */}
        <button className="mt-6 bg-blue-800 text-white px-8 py-2 rounded-full hover:bg-blue-900">
            Back
        </button>
        </div>
    </div>
    </>
  );
};

export default PricingPage;
