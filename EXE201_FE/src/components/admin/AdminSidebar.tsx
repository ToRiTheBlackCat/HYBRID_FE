import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../../assets/Logo.jpg';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Quản lý người dùng' },
    { path: '/admin/cashflow', icon: '💬', label: 'Quản lý dòng tiền' },
    { path: '/admin/settings', icon: '⚙️', label: 'Cài đặt' },
  ];

  return (
    <div 
      className={`${
        isExpanded ? 'w-64' : 'w-20'
      } bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Logo và Toggle button */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <img src={Logo} alt="Logo" className="h-8 w-8" />
          <span className={`font-bold text-xl whitespace-nowrap transition-opacity duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}>
            Smart Enrol
          </span>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg hover:bg-gray-700 focus:outline-none"
        >
          {isExpanded ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2 py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-2 mt-2 text-sm rounded-lg ${
              location.pathname === item.path
                ? 'bg-gray-700 text-white'
                : 'hover:bg-gray-700'
            } transition-colors duration-200`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0 w-0'
            }`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className={`flex items-center ${isExpanded ? 'space-x-3' : 'justify-center'}`}>
          <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
            A
          </div>
          <div className={`transition-opacity duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
          }`}>
            <p className="text-sm font-medium">Admin Name</p>
            <p className="text-xs text-gray-400">admin@smartenrol.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 