import { useAuth } from "@clerk/clerk-react";
import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { Navigate, Outlet, useLocation } from "react-router";
import { QueryPrefetcher } from "../query-prefetcher";
import { SplashScreen } from "../splash-screen";

export const AuthLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const userSubscription = useQuery(api.stripe.getUserSubscription);
  const isProUser = userSubscription?.status === "active";
  const isProLoading = userSubscription === undefined;

  const isReady = isLoaded && !isProLoading;

  const renderContent = () => {
    if (!isReady) return null;

    if (!isSignedIn) {
      return <Navigate to="/sign-in" replace />;
    }

    const isSubscriptionPage = location.pathname === "/settings/subscription";

    if (!isProUser && !isSubscriptionPage) {
      return <Navigate to="/settings/subscription" replace />;
    }

    return <Outlet />;
  };

  return (
    <SplashScreen ready={isReady}>
      <QueryPrefetcher />
      {renderContent()}
    </SplashScreen>
  );
};
