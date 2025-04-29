import React from "react";
import Header from "../components/HomePage/Header";
import Body from "../components/HomePage/Body";
import "../tailwind.css";

const HomePage : React.FC = () =>{
    return(
        <>
            <div>
                <Header/>
                <Body/>
            </div>
        </>
    )
}
export default HomePage;