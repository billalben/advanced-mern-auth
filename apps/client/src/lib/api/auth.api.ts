import { AxiosError } from "axios";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
  User,
} from "../../features/auth/auth.types";
import { api } from "./client";

export interface ApiError {
  status: number;
  message: string;
}

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.message ?? error.message ?? "Request failed";
    return { status, message };
  }
  return { status: 0, message: "Request failed" };
};

export const extractErrorMessage = (error: unknown): string =>
  toApiError(error).message;

export const authApi = {
  signup: async (data: SignupInput): Promise<User> => {
    const { data: res } = await api.post<{ success: true; user: User }>(
      "/signup",
      data,
    );
    return res.user;
  },

  login: async (data: LoginInput): Promise<User> => {
    const { data: res } = await api.post<{ success: true; user: User }>(
      "/login",
      data,
    );
    return res.user;
  },

  logout: async (): Promise<void> => {
    await api.post("/logout");
  },

  verifyEmail: async (code: string): Promise<User> => {
    const { data: res } = await api.post<{ success: true; user: User }>(
      "/verify-email",
      { code },
    );
    return res.user;
  },

  checkAuth: async (): Promise<User | null> => {
    try {
      const { data: res } = await api.get<{ success: true; user: User }>(
        "/check-auth",
      );
      return res.user;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  forgotPassword: async (data: ForgotPasswordInput): Promise<string> => {
    const { data: res } = await api.post<{ success: true; message: string }>(
      "/forgot-password",
      data,
    );
    return res.message;
  },

  resetPassword: async ({
    token,
    password,
  }: ResetPasswordInput & { token: string }): Promise<string> => {
    const { data: res } = await api.post<{ success: true; message: string }>(
      `/reset-password/${token}`,
      { password },
    );
    return res.message;
  },
};
