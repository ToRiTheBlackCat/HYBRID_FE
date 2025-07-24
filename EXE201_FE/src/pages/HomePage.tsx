import React, { useEffect } from "react";
import Header from "../components/HomePage/Header";
import Footer from "../components/HomePage/Footer";

import Body from "../components/HomePage/Body";
import "../tailwind.css";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const roleId = useSelector((state: RootState) => state.user.roleId)
  const navigate = useNavigate();
  useEffect(() => {
    if (!roleId) return; 

    if (roleId === "2") {
      navigate("/student");
    } else if (roleId === "3") {
      navigate("/");
    } else if (roleId === "1") {
      navigate("/admin");
    }
  }, [navigate, roleId]);


  return (
    <>
      <div>
        <Header />
        <Body />
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
