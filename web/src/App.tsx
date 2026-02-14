import { BrowserRouter, Routes, Route } from "react-router";
import { Home } from "./pages/home";
import { Chat } from "./pages/chat";
import "./styles.css";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat/:chatId" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
};
