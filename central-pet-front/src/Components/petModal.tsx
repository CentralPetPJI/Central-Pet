import { Pet } from '../Models/Types';
import React from "react";

interface PetModalProps {
  petData: Pet;
  onClick: () => void;
}

const PetModal: React.FC<PetModalProps> = ({ petData, onClick }) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50"
      onClick={onClick}
    >
      <div
        className="bg-white rounded-lg p-6 w-11/12 max-w-md relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-1 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClick}
        >
          ✕
        </button>
        <img
          src={petData.photo}
          alt={petData.name}
          className="w-full h-64 object-cover rounded-md mb-4"
        />
        <h2 className="text-2xl font-bold mb-2">{petData.name}</h2>
        <p className="text-gray-700 mb-1">
          <strong>Especie:</strong> {petData.species}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Características Físicas:</strong> {petData.physicalCharacteristics}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Características Comportamentais:</strong> {petData.behavioralCharacteristics}
        </p>
        <p className="text-gray-700">
          <strong>Notas:</strong> {petData.notes}
        </p>

        <button className="mt-6 w-full bg-[#1ed6ea] hover:bg-[#6de9f7] text-white py-3 rounded-xl transition font-semibold">
          <a href="#"> Quero Adotar 🐾</a>
          {/* Deixar dessa forma por enquanto, depois implementa um router */}
        </button>
      </div>
    </div>
  );
};

export default PetModal;
