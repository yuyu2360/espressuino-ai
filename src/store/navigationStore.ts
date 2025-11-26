import { create } from 'zustand';

type Page = 'dashboard' | 'profiles';

interface NavigationStore {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  currentPage: 'dashboard',
  navigateTo: (page: Page) => {
    set({ currentPage: page });
  },
}));
