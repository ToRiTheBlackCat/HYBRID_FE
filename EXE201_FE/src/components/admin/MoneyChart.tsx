import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Transaction {
  id: number;
  date: string; // Format: YYYY-MM-DD
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
}

interface CashFlowData {
  month: string;
  income: number;
  expense: number;
}

const AdminCashFlow: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [transactions] = useState<Transaction[]>([
    { id: 1, date: '2025-01-05', description: 'Học phí - Nguyễn Văn A', amount: 2000000, type: 'Income' },
    { id: 2, date: '2025-01-10', description: 'Thanh toán gia sư - Trần Thị B', amount: 1200000, type: 'Expense' },
    { id: 3, date: '2025-02-03', description: 'Học phí - Lê Văn C', amount: 1800000, type: 'Income' },
    { id: 4, date: '2025-02-15', description: 'Thanh toán gia sư - Phạm Thị D', amount: 1500000, type: 'Expense' },
    { id: 5, date: '2025-03-01', description: 'Học phí - Nguyễn Văn A', amount: 2000000, type: 'Income' },
    { id: 6, date: '2025-03-20', description: 'Chi phí vận hành', amount: 500000, type: 'Expense' },
    { id: 7, date: '2025-04-10', description: 'Học phí - Lê Văn C', amount: 2200000, type: 'Income' },
  ]);

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate)
    );
  });

  // Aggregate data for chart
  const aggregateCashFlow = (): CashFlowData[] => {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // e.g., "2025-1"
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      if (transaction.type === 'Income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
    });

    return Object.keys(monthlyData).map(month => ({
      month: new Date(month + '-01').toLocaleString('vi-VN', { month: 'long', year: 'numeric' }),
      income: monthlyData[month].income,
      expense: monthlyData[month].expense,
    }));
  };

  const cashFlowData = aggregateCashFlow();

  const chartData = {
    labels: cashFlowData.map(item => item.month),
    datasets: [
      {
        label: 'Thu nhập (VND)',
        data: cashFlowData.map(item => item.income),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Chi phí (VND)',
        data: cashFlowData.map(item => item.expense),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Dòng tiền theo tháng' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(tickValue: string | number) {
            const num = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
            return `${(num / 1000000).toFixed(1)}M`;
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Dòng tiền</h1>

        {/* Date Filter */}
        <div className="mb-6 flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Chọn ngày bắt đầu"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate ?? undefined}
              placeholderText="Chọn ngày kết thúc"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="dd/MM/yyyy"
            />
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div className="mb-12 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tổng quan Dòng tiền</h2>
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Transaction History Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-800 p-6">Lịch sử Giao dịch</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền (VND)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(transaction.amount / 1000000).toFixed(1)}M
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'Income' ? 'Thu nhập' : 'Chi phí'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Không tìm thấy giao dịch
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCashFlow;