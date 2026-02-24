import { useAuth } from "@clerk/clerk-react";
import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { Navigate, Outlet, useLocation } from "react-router";

export const AuthLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const userSubscription = useQuery(api.stripe.getUserSubscription);
  const isProUser = userSubscription?.status === "active";
  const isProLoading = userSubscription === undefined;

  if (!isLoaded || isProLoading) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const isSubscriptionPage = location.pathname === "/settings/subscription";

  if (!isProUser && !isSubscriptionPage) {
    return <Navigate to="/settings/subscription" replace />;
  }

  return <Outlet />;
};
