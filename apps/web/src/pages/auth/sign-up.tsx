import { SignUp as ClerkSignUp } from "@clerk/clerk-react";

export const SignUp = () => {
  return (
    <div className="flex h-dvh items-center justify-center">
      <ClerkSignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
      />
    </div>
  );
};
