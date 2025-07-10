import React, { ChangeEvent, useEffect, useState } from 'react';
import Header from '../components/HomePage/Header';
import { createHistory, getStudentTierById, getTeacherTierById } from '../services/userService';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface LocationState {
    price: number;
    tierId: string;
}

type Tier = {
    tierId: string;
    tierName: string;
    description: string;
};
const PaymentPage: React.FC = () => {
    //   const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const userId = useSelector((state: RootState) => state.user.userId);
    const isTeacher = useSelector((state: RootState) => state.user.roleId) === '3';
    const {
        state: { price: unitPrice, tierId },
    } = useLocation() as { state: LocationState };
    const navigate = useNavigate();

    const paymentMethods = [
        { id: 'payOs', name: 'payOs', icon: '🏦', expiry: 'N/A' },
    ];
    const [tier, setTier] = useState<Tier | null>(null);
    const [months, setMonths] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const totalPrice = unitPrice * months;

    useEffect(() => {
        const fetchTier = async () => {
            try {
                const data = isTeacher
                    ? await getTeacherTierById(tierId)
                    : await getStudentTierById(tierId);
                setTier(data);
            } catch (err) {
                console.error("Failed to fetch tier", err);
            }
        };
        fetchTier();
    }, [tierId, isTeacher]);

    const handlePay = async () => {
        if (!paymentMethod) return;
        try {
            const data = {
                amount: totalPrice,
                methodId: "1"
            }
            const result = await createHistory(data);
            if (result.isSuccess === true) {
                localStorage.setItem("paymentInfo", JSON.stringify({
                    transactionId: result.transactionId,
                    amount: totalPrice,
                    userId: userId,
                    days: months * 30,
                    tierId: tier?.tierId,
                    tierName: tier?.tierName
                }));

                navigate("/payment");
            } else {
                toast.error(result.message)
            }

        } catch (err) {
            console.error("Payment error", err);
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-24 px-4">
                <div className="w-full max-w-3xl">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Payment</h2>

                    {/* Tier Summary */}
                    {tier && (
                        <div className="bg-gray-800 rounded-lg p-4 mb-6 text-center">
                            <h3 className="text-xl font-bold mb-2">{tier.tierName}</h3>
                            <p className="text-sm text-gray-300 whitespace-pre-line">
                                {tier.description.replace(/\s*\/\s*/g, "\n")}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Payment Methods */}
                        <div className="space-y-3 w-full md:w-1/2">
                            {paymentMethods.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setPaymentMethod(m.id)}
                                    className={`flex items-center justify-between w-full p-3 rounded-lg bg-gray-800 h-14 transition border  ${paymentMethod === m.id
                                        ? "border-blue-500"
                                        : "border-transparent hover:border-gray-600"
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <span className="text-xl">{m.icon}</span>
                                        {m.name}
                                    </span>
                                    <input
                                        type="radio"
                                        className="form-radio text-blue-500"
                                        checked={paymentMethod === m.id}
                                        onChange={() => setPaymentMethod(m.id)}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Price Breakdown */}
                        <div className="w-full md:w-1/2 bg-gray-800 rounded-lg p-4">
                            <div className="mb-4">
                                <label htmlFor="months" className="block mb-1 text-sm">
                                    Số tháng sử dụng
                                </label>
                                <select
                                    id="months"
                                    value={months}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                        setMonths(Number(e.target.value))
                                    }
                                    className="w-full bg-gray-700 rounded p-2 focus:outline-none"
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1} tháng
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Giá / tháng</span>
                                    <span>{unitPrice.toLocaleString("vi-VN")}₫</span>
                                </div>

                                <div className="flex justify-between font-semibold border-t pt-2 mt-2 text-lg">
                                    <span>Tổng cộng</span>
                                    <span>{totalPrice.toLocaleString("vi-VN")}₫</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-center gap-10">
                        <button
                            disabled={!paymentMethod}
                            onClick={handlePay}
                            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold"
                        >
                            Pay now
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-lg font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentPage;