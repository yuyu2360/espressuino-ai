import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile, UserSettings, BrewingProfile } from '../types';

interface AuthState {
  profile: Profile | null;
  settings: UserSettings | null;
  brewingProfiles: BrewingProfile[];
  isLoading: boolean;
  error: string | null;

  loginAsGuest: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchBrewingProfiles: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  createBrewingProfile: (profile: Omit<BrewingProfile, 'id' | 'profileId' | 'createdAt'>) => Promise<void>;
  updateBrewingProfile: (id: string, updates: Partial<BrewingProfile>) => Promise<void>;
  deleteBrewingProfile: (id: string) => Promise<void>;
  setDefaultBrewingProfile: (id: string) => Promise<void>;
}

const GUEST_EMAIL = '';

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  settings: null,
  brewingProfiles: [],
  isLoading: false,
  error: null,

  loginAsGuest: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', GUEST_EMAIL)
        .eq('account_type', 'guest')
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            email: GUEST_EMAIL,
            account_type: 'guest',
          })
          .select()
          .single();

        if (createError) throw createError;

        const { error: settingsError } = await supabase
          .from('settings')
          .insert({
            profile_id: newProfile.id,
          });

        if (settingsError) throw settingsError;

        set({ profile: { ...newProfile, userId: undefined } });
      } else {
        set({ profile: { ...profile, userId: undefined } });
      }

      await get().fetchSettings();
      await get().fetchBrewingProfiles();
      set({ isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Guest login failed';
      set({ error: message, isLoading: false });
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          email,
          account_type: 'user',
          user_id: authData.user.id,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      const { error: settingsError } = await supabase
        .from('settings')
        .insert({
          profile_id: profile.id,
        });

      if (settingsError) throw settingsError;

      set({ profile, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      set({ error: message, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in failed');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      set({ profile, isLoading: false });
      await get().fetchSettings();
      await get().fetchBrewingProfiles();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      set({ error: message, isLoading: false });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ profile: null, settings: null, brewingProfiles: [], error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      set({ error: message });
    }
  },

  fetchCurrentUser: async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (profileError) throw profileError;
        set({ profile });
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  },

  fetchSettings: async () => {
    try {
      const profile = get().profile;
      if (!profile) return;

      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (error) throw error;
      set({ settings });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  },

  fetchBrewingProfiles: async () => {
    try {
      const profile = get().profile;
      if (!profile) return;

      const { data: profiles, error } = await supabase
        .from('brewing_profiles')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ brewingProfiles: profiles || [] });
    } catch (error) {
      console.error('Failed to fetch brewing profiles:', error);
    }
  },

  updateSettings: async (updates: Partial<UserSettings>) => {
    try {
      const settings = get().settings;
      if (!settings) return;

      const { error } = await supabase
        .from('settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      set({ settings: { ...settings, ...updates } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      set({ error: message });
    }
  },

  createBrewingProfile: async (profile: Omit<BrewingProfile, 'id' | 'profileId' | 'createdAt'>) => {
    try {
      const currentProfile = get().profile;
      if (!currentProfile) return;

      const { data: newProfile, error } = await supabase
        .from('brewing_profiles')
        .insert({
          ...profile,
          profile_id: currentProfile.id,
        })
        .select()
        .single();

      if (error) throw error;

      set({ brewingProfiles: [...get().brewingProfiles, newProfile] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create brewing profile';
      set({ error: message });
    }
  },

  updateBrewingProfile: async (id: string, updates: Partial<BrewingProfile>) => {
    try {
      const { error } = await supabase
        .from('brewing_profiles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      const profiles = get().brewingProfiles.map((p) => (p.id === id ? { ...p, ...updates } : p));
      set({ brewingProfiles: profiles });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update brewing profile';
      set({ error: message });
    }
  },

  deleteBrewingProfile: async (id: string) => {
    try {
      const { error } = await supabase
        .from('brewing_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({ brewingProfiles: get().brewingProfiles.filter((p) => p.id !== id) });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete brewing profile';
      set({ error: message });
    }
  },

  setDefaultBrewingProfile: async (id: string) => {
    try {
      const profiles = get().brewingProfiles;

      const { error: clearError } = await supabase
        .from('brewing_profiles')
        .update({ is_default: false })
        .in('id', profiles.map((p) => p.id));

      if (clearError) throw clearError;

      const { error: setError } = await supabase
        .from('brewing_profiles')
        .update({ is_default: true })
        .eq('id', id);

      if (setError) throw setError;

      const updated = profiles.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }));
      set({ brewingProfiles: updated });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set default profile';
      set({ error: message });
    }
  },
}));
