import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SidebarState {
  isSidebarOpen: boolean;
  actions: {
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
  };
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      actions: {
        toggleSidebar: () => {
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
        },
        setSidebarOpen: (isOpen) => {
          set({ isSidebarOpen: isOpen });
        },
      },
    }),
    {
      name: 'central-pet:sidebar-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isSidebarOpen: state.isSidebarOpen,
      }),
    },
  ),
);
