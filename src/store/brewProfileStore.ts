import { create } from 'zustand';
import type { BrewingProfile } from '../types';

interface BrewProfileStore {
  currentProfile: BrewingProfile | null;
  setCurrentProfile: (profile: BrewingProfile | null) => void;
}

export const useBrewProfileStore = create<BrewProfileStore>((set) => ({
  currentProfile: null,
  setCurrentProfile: (profile: BrewingProfile | null) => {
    set({ currentProfile: profile });
  },
}));
