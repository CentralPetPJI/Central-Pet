/* eslint-disable no-debugger */
import React from "react";
import Carousel from "../Components/Carousel";
import petsData from "../Models/Pet"; // Assuming petsData is exported from a separate file
import "./MainPage.css";

const MainPage: React.FC = () => {
  return (
    <div className="main-page">
      <h1>Bem-vindo ao Central Pet!</h1>
      <div className="carousel-area">
        <Carousel petsData={petsData} />
      </div>
    </div>
  );
};

export default MainPage;
