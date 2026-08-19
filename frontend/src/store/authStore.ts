import { create } from "zustand";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: "admin" | "operator" | "security" | "maintenance" | "user";
  is_active: boolean;
  is_verified: boolean;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  initialize: async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("dsr_go_token") : null;
    if (!token) {
      set({ token: null, user: null, loading: false });
      return;
    }

    set({ token, loading: true, error: null });
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch("/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const user = await res.json();
        set({ user, loading: false });
      } else {
        // Token is invalid/expired
        localStorage.removeItem("dsr_go_token");
        set({ token: null, user: null, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to initialize session", loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Invalid email or password");
      }

      const data = await res.json();
      localStorage.setItem("dsr_go_token", data.access_token);
      set({ token: data.access_token });

      // Fetch user profile
      const profileRes = await fetch("/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (profileRes.ok) {
        const user = await profileRes.json();
        set({ user, loading: false });
        return true;
      } else {
        throw new Error("Failed to fetch profile after login");
      }
    } catch (err: any) {
      set({ error: err.message || "Login failed", loading: false });
      return false;
    }
  },

  register: async (registerData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registration failed");
      }

      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || "Registration failed", loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("dsr_go_token");
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
