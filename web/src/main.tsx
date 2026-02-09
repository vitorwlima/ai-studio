import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import { ConvexProvider } from "./components/providers/convex-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider>
      <App />
    </ConvexProvider>
  </StrictMode>
);
