import React from 'react';
import Carousel from '../Components/Carousel';
import petsData from '../Models/Pet';

const MainPage: React.FC = () => {
  return (
    <main
      className="
        pt-[11vh]
        px-8
        pb-12
        max-w-7xl
      "
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Pet Central!</h1>

      <p className="text-gray-600 mb-8">Check out our latest pets:</p>

      <Carousel petsData={petsData} />
    </main>
  );
};

export default MainPage;
