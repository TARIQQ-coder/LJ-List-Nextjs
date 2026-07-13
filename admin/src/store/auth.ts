import { create } from "zustand";
import type { User } from "../types";
import * as authApi from "../api/endpoints/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User | null) => void;
  fetchProfile: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user) => {
    set({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
    });
  },

  fetchProfile: async () => {
    try {
      const res = await authApi.fetchProfile();
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      if (error?.response?.status === 401) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        throw error;
      }
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  isAdmin: () => get().user?.role === "admin",
}));
