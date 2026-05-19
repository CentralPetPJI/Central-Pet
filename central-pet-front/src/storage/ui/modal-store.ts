import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Pet } from '@/Models/pet';

export type ModalType = 'pet-register' | 'pet-details' | 'adoption-request' | 'login-prompt';

type ModalPayloadByType = {
  'pet-register': null;
  'pet-details': Pet;
  'adoption-request': null;
  'login-prompt': null;
};

type ModalData = ModalPayloadByType[ModalType];

type ModalActions = {
  openModal: {
    (type: 'pet-details', data: ModalPayloadByType['pet-details']): void;
    (type: Exclude<ModalType, 'pet-details'>): void;
  };
  closeModal: () => void;
};

interface ModalState {
  activeModal: ModalType | null;
  modalData: ModalData | null;
  actions: ModalActions;
}

const syncBodyScrollLock = (hasActiveModal: boolean) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.style.overflow = hasActiveModal ? 'hidden' : '';
};

export const useModalStore = create<ModalState>()(
  persist(
    (set) => ({
      activeModal: null,
      modalData: null,
      actions: {
        openModal: (type: ModalType, data?: ModalData) => {
          set({ activeModal: type, modalData: data ?? null });
          syncBodyScrollLock(true);
        },

        closeModal: () => {
          set({ activeModal: null, modalData: null });
          syncBodyScrollLock(false);
        },
      },
    }),
    {
      name: 'central-pet:modal-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeModal: state.activeModal,
        modalData: state.modalData,
      }),
      onRehydrateStorage: () => (state) => {
        syncBodyScrollLock(Boolean(state?.activeModal));
      },
    },
  ),
);
