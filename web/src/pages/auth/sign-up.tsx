import { SignUp as ClerkSignUp } from "@clerk/clerk-react";

export const SignUp = () => {
  return (
    <div className="flex h-dvh items-center justify-center">
      <ClerkSignUp />
    </div>
  );
};
