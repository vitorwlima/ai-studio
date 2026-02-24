import { useAuth } from "@clerk/clerk-react";
import { api } from "@convex/api";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";

const SPLASH_DURATION_MS = 1200;
const EXIT_DURATION_MS = 400;

const SplashScreen = ({ exiting }: { exiting: boolean }) => {
  const letters = "AI Studio".split("");

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white ${exiting ? "animate-splash-out" : ""}`}
      style={exiting ? { pointerEvents: "none" } : undefined}
    >
      <div className="flex items-baseline gap-[2px] select-none">
        {letters.map((letter, i) => (
          <span
            key={i}
            className="animate-splash-letter text-4xl font-bold tracking-tight text-zinc-900 opacity-0"
            style={{
              animationDelay: `${i * 60}ms`,
              ...(letter === " " ? { width: "0.35em" } : {}),
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </div>

      <div className="absolute bottom-12 h-0.5 w-16 rounded-full overflow-hidden bg-zinc-200">
        <div
          className="h-full w-full rounded-full animate-splash-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent, #18181b, transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
    </div>
  );
};

export const AuthLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const userSubscription = useQuery(api.stripe.getUserSubscription);
  const isProUser = userSubscription?.status === "active";
  const isProLoading = userSubscription === undefined;

  const isReady = isLoaded && !isProLoading;

  const [splashTimerDone, setSplashTimerDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const exitTriggered = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setSplashTimerDone(true), SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const tryExit = useCallback(() => {
    if (exitTriggered.current) return;
    exitTriggered.current = true;
    setExiting(true);
    setTimeout(() => setGone(true), EXIT_DURATION_MS);
  }, []);

  useEffect(() => {
    if (splashTimerDone && isReady) {
      tryExit();
    }
  }, [splashTimerDone, isReady, tryExit]);

  if (!isLoaded || isProLoading) {
    return <SplashScreen exiting={false} />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const isSubscriptionPage = location.pathname === "/settings/subscription";

  if (!isProUser && !isSubscriptionPage) {
    return <Navigate to="/settings/subscription" replace />;
  }

  return (
    <>
      {!gone && <SplashScreen exiting={exiting} />}
      <Outlet />
    </>
  );
};
