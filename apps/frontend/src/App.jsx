import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import UsersPage from "./pages/UsersPage";
import ProfilePage from "./pages/ProfilePage";
import TradePage from "./pages/TradePage";

function App() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#a7d8f0_0%,_#fffaf0_45%,_#ffd6c8_100%)]" />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/trade/:tradeId" element={<TradePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
