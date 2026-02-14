import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import { ClerkProvider } from "./components/providers/clerk-provider.tsx";
import { ConvexProvider } from "./components/providers/convex-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider>
      <ConvexProvider>
        <App />
      </ConvexProvider>
    </ClerkProvider>
  </StrictMode>
);
