import { useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router";

export const AuthLayout = () => {
  const { isSignedIn, isLoaded, has } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const hasProPlan = has?.({ plan: "user:pro" }) ?? false;
  const isSubscriptionPage = location.pathname === "/settings/subscription";

  if (!hasProPlan && !isSubscriptionPage) {
    return <Navigate to="/settings/subscription" replace />;
  }

  return <Outlet />;
};
