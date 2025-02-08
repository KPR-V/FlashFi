import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AIagent from "./components/AIagent";
import ChatPage from "./components/Chat";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="w-full h-screen overflow-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/new" element={<AIagent />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
