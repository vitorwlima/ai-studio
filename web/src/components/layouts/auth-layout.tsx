import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";

export const AuthLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
};
