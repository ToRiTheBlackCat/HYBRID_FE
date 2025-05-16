import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../../assets/Logo1_noBg.png";

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveLink = (path: string) => location.pathname === path;
  //   const menuItems = [
  //     { path: "/", label: "Template" },
  //     { path: "/chat-with-ai", label: "Courses" },
  //     { path: "/career-guidance", label: "Pricing" },
  //     { path: "/about-us", label: "About Us" },
  //   ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-400 text-white py-10 px-6 md:px-20 mb-0"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        {/* Logo and intro */}
        <div>
          <div className="font-bold text-xl -mt-5 -mb-8 flex items-center gap-2">
            <Link to="/">
              <img src={Logo} alt="Logo" className="w-35 " />
            </Link>
          </div>
          <p className="text-base">Equip English learners with passion</p>
          <p className="text-base">Tailor superior lessons for Teachers</p>
        </div>

        {/* Our company */}
        <div>
          <h3 className="font-semibold  mb-2 text-lg">OUR COMPANY</h3>
          <ul className="space-y-1">
            <li>
              <a href="#" onClick={() => navigate("/about")}>
                Home
              </a>
            </li>
            <li>
              <a href="#" onClick={() => navigate("/about")}>
                About us
              </a>
            </li>
            <li>
              <a href="#" onClick={() => navigate("/contact")}>
                Contact us
              </a>
            </li>
            <li>
              <a href="#" onClick={() => navigate("/templates")}>
                Templates
              </a>
            </li>
            <li>
              <a href="#" onClick={() => navigate("/courses")}>
                Courses
              </a>
            </li>
          </ul>
        </div>

        {/* Our terms */}
        <div>
          <h3 className="font-semibold mb-2 text-lg">OUR TERMS</h3>
          <ul className="space-y-1">
            <li>
              <a href="#" onClick={() => navigate("/privacy-policy")}>
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" onClick={() => navigate("/contract-policy")}>
                Contract Policy
              </a>
            </li>
            <li>
              <a href="#" onClick={() => navigate("/pricing-policy")}>
                Pricing Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold mb-2 text-lg">
            SUBSCRIBE TO OUR NEWSLETTER
          </h3>
          <p className="mb-2">
            Stay updated with the latest features, templates and updates by
            subscribing to our newsletter
          </p>
          <div className="flex gap-2 mt-2">
            {/* <Input placeholder="Enter your email" className="w-full" />
            <Button>Subscribe</Button> */}
          </div>
        </div>
      </div>

      <hr className="my-6 border-white" />

      <div className="text-center text-sm text-blue-700">
        © Copyright 2025 | HYBRID | All Rights Reserved
      </div>
    </motion.footer>
  );
};
export default Footer;
