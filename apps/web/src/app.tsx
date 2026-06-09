import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthLayout } from "./components/layouts/auth-layout";
import { Chat } from "./pages/chat";
import { SignIn } from "./pages/auth/sign-in";
import { SignUp } from "./pages/auth/sign-up";
import { AccountSettings } from "./pages/settings/account";
import { ApiKeySettings } from "./pages/settings/api-key";
import { ContactSettings } from "./pages/settings/contact";
import { McpOAuthCallback } from "./pages/settings/mcp-callback";
import { McpServersSettings } from "./pages/settings/mcp-servers";
import { SubscriptionSettings } from "./pages/settings/subscription";
import "./styles.css";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Chat />} />
          <Route path="/chat/:threadId" element={<Chat />} />
          <Route
            path="/settings"
            element={<Navigate to="/settings/account" replace />}
          />
          <Route path="/settings/account/*" element={<AccountSettings />} />
          <Route path="/settings/api-key" element={<ApiKeySettings />} />
          <Route path="/settings/mcp" element={<McpServersSettings />} />
          <Route
            path="/settings/mcp/callback"
            element={<McpOAuthCallback />}
          />
          <Route
            path="/settings/subscription"
            element={<SubscriptionSettings />}
          />
          <Route path="/settings/contact" element={<ContactSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
