import { SignIn as ClerkSignIn } from "@clerk/clerk-react";

export const SignIn = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <ClerkSignIn />
    </div>
  );
};
