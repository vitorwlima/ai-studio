import { ClerkProvider as ClerkProviderFromLib } from "@clerk/clerk-react";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProviderFromLib publishableKey={publishableKey}>
      {children}
    </ClerkProviderFromLib>
  );
};
