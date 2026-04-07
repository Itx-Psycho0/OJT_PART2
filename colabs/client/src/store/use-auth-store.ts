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
  loginWithPassword: (data: Record<string, string>) => Promise<{ success: boolean; message?: string }>;
  register: (data: Record<string, string>) => Promise<{ success: boolean; message?: string }>;
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

  loginWithPassword: async (data: Record<string, string>) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok && result.success) {
        set({ user: result.user });
        return { success: true };
      }
      return { success: false, message: result.message || "Login failed" };
    } catch {
      return { success: false, message: "Network error" };
    }
  },

  register: async (data: Record<string, string>) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok && result.success) {
        set({ user: result.user });
        return { success: true };
      }
      return { success: false, message: result.message || "Registration failed" };
    } catch {
      return { success: false, message: "Network error" };
    }
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
