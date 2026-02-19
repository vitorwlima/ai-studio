import { SignIn as ClerkSignIn } from "@clerk/clerk-react";

export const SignIn = () => {
  return (
    <div className="flex h-dvh items-center justify-center">
      <ClerkSignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
      />
    </div>
  );
};
