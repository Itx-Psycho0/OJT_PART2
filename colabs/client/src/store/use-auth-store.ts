import { create } from "zustand";

interface User {
  id: string;
  displayName: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: () => {
    window.location.href = `${API_URL}/auth/google`;
  },

  checkAuth: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // proceed with logout even if request fails
    }
    set({ user: null });
    window.location.href = "/login";
  },
}));
