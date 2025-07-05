import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../../assets/Logo1_noBg.png";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.footer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white rounded-full opacity-50"></div>
      </div>

      <div className="relative z-10 py-16 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          >
            {/* Logo and Intro */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="mb-6">
                <Link to="/" className="inline-block hover:scale-105 transition-transform duration-300">
                  <img
                    src={Logo}
                    alt="HYBRID Logo"
                    className="w-40 h-auto filter brightness-0 invert"
                  />
                </Link>
              </div>
              <div className="space-y-3">
                <p className="text-blue-100 text-lg font-medium leading-relaxed">
                  🎯 Equip English learners with passion
                </p>
                <p className="text-blue-100 text-lg font-medium leading-relaxed">
                  🎓 Tailor superior lessons for Teachers
                </p>
              </div>

              {/* Social Media Icons */}
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <span className="text-xl">📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <span className="text-xl">📧</span>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <span className="text-xl">💬</span>
                </a>
              </div>
            </motion.div>

            {/* Our Company */}
            <motion.div variants={itemVariants}>
              <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                CÔNG TY CHÚNG TÔI
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "Trang chủ", path: "/" },
                  { name: "Về chúng tôi", path: "/about-us" },
                  { name: "Liên hệ", path: "https://www.facebook.com/profile.php?id=61577080800928", external: true},
                  { name: "Mẫu bài học", path: "/templates" },
                  { name: "Khóa học", path: "/course" }
                ].map((item, index) => (
                  <li key={index}>
                    {item.external ? (
                      <a
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-100 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block font-medium"
                      >
                        {item.name}
                      </a>
                    ) : (
                      <a
                        href="#"
                        onClick={() => navigate(item.path)}
                        className="text-blue-100 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block font-medium"
                      >
                        {item.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Our Terms */}
            <motion.div variants={itemVariants}>
              <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
                <span className="text-2xl">📋</span>
                ĐIỀU KHOẢN
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "Chính sách bảo mật", path: "/privacy-policy" },
                  { name: "Chính sách hợp đồng", path: "/contract-policy" },
                  { name: "Chính sách giá cả", path: "/pricing-policy" }
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      onClick={() => navigate(item.path)}
                      className="text-blue-100 hover:text-white transition-all duration-300 hover:translate-x-2 inline-block font-medium"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div variants={itemVariants}>
              <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
                <span className="text-2xl">📬</span>
                ĐĂNG KÝ NHẬN TIN
              </h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Cập nhật những tính năng mới nhất, mẫu bài học và thông tin hữu ích bằng cách đăng ký nhận bản tin của chúng tôi
              </p>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn..."
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-300"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg">
                    Đăng ký
                  </button>
                </div>

                <div className="flex items-center gap-2 text-blue-200 text-sm">
                  <span className="text-green-400">✓</span>
                  <span>Không spam • Hủy đăng ký bất cứ lúc nào</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="my-12"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </motion.div>

          {/* Bottom Section */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <div className="text-blue-200 text-sm md:text-base">
              © Copyright 2025 | <span className="font-bold text-white">HYBRID</span> | Bảo lưu mọi quyền
            </div>

            <div className="flex flex-wrap gap-6 text-blue-200 text-sm">
              <a href="#" className="hover:text-white transition-colors duration-300">
                Hỗ trợ kỹ thuật
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                Câu hỏi thường gặp
              </a>
              <a href="#" className="hover:text-white transition-colors duration-300">
                Sitemap
              </a>
            </div>
          </motion.div>

          {/* Back to Top Button */}
          <motion.button
            variants={itemVariants}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">↑</span>
          </motion.button>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;