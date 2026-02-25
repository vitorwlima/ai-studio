import { useAuth } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { Navigate, Outlet } from "react-router";
import { QueryPrefetcher } from "../query-prefetcher";
import { SplashScreen } from "../splash-screen";

export const AuthLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  const isReady = isLoaded && (!isSignedIn || isConvexAuthenticated);

  const renderContent = () => {
    if (!isReady) return null;

    if (!isSignedIn) {
      return <Navigate to="/sign-in" replace />;
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
