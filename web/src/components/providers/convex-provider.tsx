import {
  ConvexProvider as ConvexProviderFromLib,
  ConvexReactClient,
} from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export const ConvexProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConvexProviderFromLib client={convex}>{children}</ConvexProviderFromLib>
  );
};
