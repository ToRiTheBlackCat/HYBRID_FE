import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/userSlice';
import Cookies from 'js-cookie';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { MdUpgrade } from 'react-icons/md';
import { FaTicketAlt, FaBriefcase } from 'react-icons/fa';

interface Props {
  userName?: string;
  roleId?: string;
  isUpdated: boolean;
}

const UserDropdown: React.FC<Props> = ({ userName, roleId, isUpdated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    Cookies.remove('user');
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={toggleDropdown}
      >
        <FiUser className="text-blue-600 w-5 h-5" />
        <span className="text-sm text-gray-700">{userName}</span>
        <FiChevronDown className="w-4 h-4 text-gray-500" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-56 bg-blue-300 text-white rounded shadow-lg p-2 z-50"
          >
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-400 rounded"
            >
              <FiUser /> Edit Profile
            </Link>
            {roleId === '3' && (
              <Link
                to="/teacher/activities"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-400 rounded"
              >
              
                <FaTicketAlt /> My Activities
              </Link>
            )}
            {roleId === '2' && (
              <Link
                to="/student/accomplishments"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-blue-400 rounded"
              >
                <FaBriefcase /> My Accomplishments
              </Link>
            )}
            {isUpdated===false && (
            <Link
              to="/pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-blue-400 rounded"
            >
              <MdUpgrade className="rotate-90" /> Upgrade
            </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 hover:bg-red-500 rounded text-white w-full mt-1"
            >
              <FiLogOut /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDropdown;
