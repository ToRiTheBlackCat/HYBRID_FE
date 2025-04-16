import React from "react";
import Header from "../components/HomePage/Header";
import Footer from "../components/HomePage/Footer";

import "../tailwind.css";

const HomePage: React.FC = () => {
  return (
    <>
      <div>
        <Header />
        <Footer />
      </div>
    </>
  );
};
export default HomePage;
