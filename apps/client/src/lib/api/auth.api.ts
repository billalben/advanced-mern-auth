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
  code?: string;
}

export interface ApiFailureBody {
  success: false;
  message: string;
  code?: string;
  data?: { fields?: { path: string; message: string }[] };
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as ApiFailureBody | undefined;
    const message = data?.message ?? error.message ?? "Request failed";
    const code = data?.code;
    return code ? { status, message, code } : { status, message };
  }
  return { status: 0, message: "Request failed" };
};

export const extractErrorMessage = (error: unknown): string =>
  toApiError(error).message;

export interface SignupResult {
  name: string;
  email: string;
}

export const authApi = {
  signup: async (data: SignupInput): Promise<SignupResult> => {
    const { data: body } = await api.post<ApiSuccess<SignupResult>>(
      "/signup",
      data,
    );
    return body.data;
  },

  login: async (data: LoginInput): Promise<User> => {
    const { data: body } = await api.post<ApiSuccess<User>>("/login", data);
    return body.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/logout");
  },

  verifyEmail: async (code: string): Promise<User> => {
    const { data: body } = await api.post<ApiSuccess<User>>("/verify-email", {
      code,
    });
    return body.data;
  },

  checkAuth: async (): Promise<User | null> => {
    try {
      const { data: body } = await api.get<ApiSuccess<User>>("/check-auth");
      return body.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  forgotPassword: async (data: ForgotPasswordInput): Promise<string> => {
    const { data: body } = await api.post<ApiSuccess<null>>(
      "/forgot-password",
      data,
    );
    return body.message ?? "";
  },

  resetPassword: async ({
    token,
    password,
  }: ResetPasswordInput & { token: string }): Promise<string> => {
    const { data: body } = await api.post<ApiSuccess<null>>(
      `/reset-password/${token}`,
      { password },
    );
    return body.message ?? "";
  },
};
