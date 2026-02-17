import { BrowserRouter, Routes, Route } from "react-router";
import { AuthLayout } from "./components/layouts/auth-layout";
import { Chat } from "./pages/chat";
import { Settings } from "./pages/settings";
import { SignIn } from "./pages/auth/sign-in";
import { SignUp } from "./pages/auth/sign-up";
import "./styles.css";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Chat />} />
          <Route path="/chat/:threadId" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
