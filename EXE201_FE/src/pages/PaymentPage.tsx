import React, { useState } from 'react';
import Header from '../components/HomePage/Header';

const PaymentPage:React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = [
    { id: 'local-bank', name: 'Local Bank', icon: '🏦', expiry: 'N/A' },
    { id: 'momo', name: 'Momo', icon: '📱', expiry: 'N/A' },
    { id: 'vnpay', name: 'VNPay', icon: '💳', expiry: 'N/A' },
  ];

  const originalPrice = 659.00;
  const savings = 299.00;
  const storePickup = 99.00;
  const total = 719.00;

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-900 text-white p-6 mt-25">
        <h2 className="text-2xl font-semibold mb-6">Payment</h2>

        {/* Payment Methods and Price Breakdown Container */}
        <div className="flex flex-col md:flex-row gap-6">
            {/* Payment Methods */}
            <div className="space-y-2 w-full md:w-1/2">
            {paymentMethods.map((method) => (
                <div
                key={method.id}
                className={`flex items-center justify-between p-3 rounded-lg bg-gray-800 cursor-pointer h-14 ${
                    selectedMethod === method.id ? 'border-2 border-blue-500' : 'border border-gray-700'
                }`}
                onClick={() => setSelectedMethod(method.id)}
                >
                <div className="flex items-center gap-2">
                    <span className="text-xl">{method.icon}</span>
                    <div>
                    <p className="font-medium text-sm">{method.name}</p>
                    <p className="text-xs text-gray-400">Expiry {method.expiry}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                    className="form-radio text-blue-500 focus:ring-0"
                    />
                </div>
                </div>
            ))}
            </div>

            {/* Price Breakdown */}
            <div className="w-full md:w-1/2">
            <div className="bg-gray-800 p-4 rounded-lg">
                <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Original price</span>
                    <span>${originalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-500">
                    <span>Savings</span>
                    <span>-${savings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Store Pickup</span>
                    <span>${storePickup.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                </div>
            </div>
            </div>
        </div>

        {/* Pay Now Button */}
        <div className="mt-6">
            <button
                className="w-1/2 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
                disabled={!selectedMethod}
            >
                Pay now
            </button>
        </div>
    </div>
    </>
  );
};

export default PaymentPage;