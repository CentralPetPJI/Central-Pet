import React from 'react';
import { useModalStore } from '@/storage';
import PetModal from '@/Components/PetModal';

/**
 * Gerenciador central de modais.
 * Renderiza o modal ativo com base no estado global da modal-store.
 */
export const ModalManager: React.FC = () => {
  const activeModal = useModalStore((state) => state.activeModal);

  switch (activeModal) {
    case 'pet-details':
      return <PetModal />;

    // Futuros modais podem ser adicionados aqui
    // case 'pet-register':
    //   return <PetRegisterModal />;

    default:
      return null;
  }
};
