import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from "../../assets/whitecat_logo.jpg";
import { FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { RootState } from '../../store/store';
import { logout } from '../../store/userSlice';
import DropdownMenu from "./DropdownMenu";
import { fetchUserProfile } from "../../services/authService";
import { Profile } from '../../types';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<Profile>();

  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = !!user.userId;
  const roleId = user.roleId;

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getFullName = async () => {
      const isTeacher = user.roleId === "1";
      try {
        const data = await fetchUserProfile(user.userId, isTeacher);
        setUserData(data ?? undefined);
      } catch (error) {
        console.log(error);
      }
    };
    getFullName();

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user.roleId, user.userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    Cookies.remove('user');
    dispatch(logout());
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    if (roleId === "2") {
      navigate('/student');
    } else {
      navigate('/');
    }
  };

  const isActiveLink = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/course', label: 'Courses' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/about-us', label: 'About Us' },
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <button onClick={handleHomeClick} className="flex items-center gap-2">
          <img src={Logo} alt="Logo" className="h-10 w-auto" />
        </button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex mr-20 items-center gap-4">
          {menuItems.map((item) => {
            const isHome = item.path === '/';
            const handleClick = () => {
              if (isHome && roleId === "2") {
                navigate('/student');
              } else {
                navigate(item.path);
              }
            };
            return (
              <button
                key={item.path}
                onClick={handleClick}
                className={`text-sm px-4 py-2 rounded-full font-medium transition ${
                  isActiveLink(item.path)
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu userName={userData?.fullName} roleId={roleId} />
          ) : (
            <>
              <Link to="/login" className="text-sm px-4 py-2 bg-blue-600 rounded-full text-white hover:bg-green-700">
                Đăng nhập
              </Link>
              <Link
                to="/sign-up"
                className="text-sm px-4 py-2 bg-white text-black rounded-full hover:bg-orange-500"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-gray-700 p-2 rounded-md hover:bg-blue-50"
        >
          {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white shadow-md"
          >
            <div className="flex flex-col px-4 pb-4 space-y-2">
              {menuItems.map((item) => {
                const isHome = item.path === '/';
                const handleClick = () => {
                  setIsMobileMenuOpen(false);
                  if (isHome && roleId === "2") {
                    navigate('/student');
                  } else {
                    navigate(item.path);
                  }
                };
                return (
                  <button
                    key={item.path}
                    onClick={handleClick}
                    className={`text-sm px-4 py-2 rounded-md ${
                      isActiveLink(item.path)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm text-gray-700 hover:text-blue-600"
                  >
                    My profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm text-gray-700 hover:text-blue-600"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
