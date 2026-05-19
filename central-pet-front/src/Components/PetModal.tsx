import React from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@/routes';
import { getPetRouteId } from '@/storage/pets/pet-helpers';
import { formatPetSpecies, formatState } from '@/lib/formatters';
import { useAuth } from '@/lib/auth-context';
import { useModalStore } from '@/storage';

const PetModal: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const petData = useModalStore((state) =>
    state.activeModal === 'pet-details' ? state.modalData : null,
  );
  const closeModal = useModalStore((state) => state.actions.closeModal);

  if (!petData) return null;

  const routeId = getPetRouteId(petData);
  const locationText = petData.city
    ? `${petData.city}${petData.state ? `/${formatState(petData.state)}` : ''}`
    : 'Nao informado';

  const buttonText =
    !isLoading && currentUser?.id === petData.responsibleUserId ? 'Ver Perfil' : 'Quero adotar';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50"
      onClick={() => closeModal()}
    >
      <div
        className="bg-white rounded-lg p-6 w-11/12 max-w-md relative shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-1 right-2 text-gray-500 hover:text-gray-700"
          onClick={() => closeModal()}
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
          <strong>Especie:</strong> {formatPetSpecies(petData.species)}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Características Físicas:</strong> {petData.physicalCharacteristics}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Características Comportamentais:</strong> {petData.behavioralCharacteristics}
        </p>
        <p className="text-gray-700 mb-1">
          <strong>Localizacao:</strong> {locationText}
        </p>

        <Link
          to={routes.pets.detail.build(routeId)}
          onClick={() => closeModal()}
          className="mt-6 block w-full rounded-xl bg-primary-400 py-3 text-center font-semibold text-white transition hover:bg-primary-600"
          aria-disabled={isLoading}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default PetModal;
