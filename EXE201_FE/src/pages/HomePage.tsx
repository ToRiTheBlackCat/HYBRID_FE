import React from "react";
import Header from "../components/HomePage/Header";
import Footer from "../components/HomePage/Footer";

import Body from "../components/HomePage/Body";
import "../tailwind.css";

const HomePage: React.FC = () => {
  return (
    <>
      <div>
        <Header />
        <Body/>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
