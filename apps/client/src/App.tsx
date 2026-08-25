import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import type * as React from "react";
import { Toaster } from "react-hot-toast";
import FloatingShapes from "./components/FloatingShapes";
import { useAuth } from "./features/auth/useAuth";
import { useCheckAuthQuery } from "./features/auth/queries";

const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const VerifyEmailPage = lazy(() => import("./pages/EmailVerificationPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isVerified } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

const RedirectAuthenticatedUser = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, isVerified } = useAuth();

  if (isAuthenticated && isVerified) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => {
  useCheckAuthQuery();

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-linear-to-br from-gray-900 via-green-900 to-emerald-900">
      <FloatingShapes />
      <Suspense fallback={<div>Loading...</div>}>
        <AuthGate>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/register"
              element={
                <RedirectAuthenticatedUser>
                  <RegisterPage />
                </RedirectAuthenticatedUser>
              }
            />
            <Route
              path="/login"
              element={
                <RedirectAuthenticatedUser>
                  <LoginPage />
                </RedirectAuthenticatedUser>
              }
            />
            <Route
              path="/verify-email"
              element={
                <RedirectAuthenticatedUser>
                  <VerifyEmailPage />
                </RedirectAuthenticatedUser>
              }
            />

            <Route
              path="/forgot-password"
              element={
                <RedirectAuthenticatedUser>
                  <ForgotPasswordPage />
                </RedirectAuthenticatedUser>
              }
            />

            <Route
              path="/reset-password/:token"
              element={
                <RedirectAuthenticatedUser>
                  <ResetPasswordPage />
                </RedirectAuthenticatedUser>
              }
            />

            {/* Protected Route */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthGate>
      </Suspense>
      <Toaster />
    </div>
  );
};

export default App;
