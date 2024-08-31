import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios, { AxiosError } from "axios";

interface IUser {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  createdAt: string;
  lastLogin: string;
}

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  message: string | null;

  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5011/api/auth"
    : "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
      isCheckingAuth: true,
      message: null,

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post(`${API_URL}/signup`, {
            email,
            password,
            name,
          });

          console.log("response.data", response.data);

          set({ message: response.data.message, isLoading: false });
        } catch {
          set({
            error: "Error signing up",
            isLoading: false,
          });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/login`, {
            email,
            password,
          });
          const user = response.data.user;
          set({
            isAuthenticated: true,
            user,
            error: null,
            isLoading: false,
          });
        } catch (error) {
          const err = error as AxiosError<{ message: string }>;
          set({
            error: err.response?.data.message || "Error logging in",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(`${API_URL}/logout`);
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
        } catch (error) {
          const err = error as AxiosError<{ message: string }>;
          set({ error: "Error logging out", isLoading: false });
          throw err;
        }
      },

      verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/verify-email`, {
            code,
          });
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return response.data;
        } catch (error) {
          const err = error as AxiosError<{ message: string }>;
          set({
            error: err.response?.data.message || "Error verifying email",
            isLoading: false,
          });
          throw error;
        }
      },

      checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
          const response = await axios.get(`${API_URL}/check-auth`);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isCheckingAuth: false,
          });
        } catch (error) {
          const err = error as AxiosError<{ message: string }>;
          set({
            error: err.response?.data.message,
            isCheckingAuth: false,
            isAuthenticated: false,
          });
        }
      },

      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/forgot-password`, {
            email,
          });
          set({ message: response.data.message, isLoading: false });
        } catch (error) {
          const err = error as AxiosError<{ message: string }>;
          set({
            isLoading: false,
            error:
              err.response?.data.message ||
              "Error sending reset password email",
          });
          throw error;
        }
      },

      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_URL}/reset-password/${token}`,
            {
              password,
            },
          );
          set({ message: response.data.message, isLoading: false });
        } catch (error) {
          const err = error as AxiosError<{ message: string }>;
          set({
            isLoading: false,
            error: err.response?.data.message || "Error resetting password",
          });
          throw error;
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
