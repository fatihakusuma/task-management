import { useCallback, useEffect, useState } from "react";
import {
  clearSession,
  getStoredUser,
  isSessionValid,
  setUnauthorizedHandler
} from "./api.js";
import Navbar from "./components/Navbar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";

export default function App() {
  const [user, setUser] = useState(() => (isSessionValid() ? getStoredUser() : null));
  const [page, setPage] = useState("dashboard");
  const [sessionMessage, setSessionMessage] = useState("");

  const logout = useCallback((message = "") => {
    clearSession();
    setUser(null);
    setPage("dashboard");
    setSessionMessage(message);
  }, []);

  // Jika token tidak valid/kedaluwarsa (401), otomatis kembali ke login
  useEffect(() => {
    setUnauthorizedHandler(() => logout("Sesi berakhir. Silakan login kembali."));
  }, [logout]);

  if (!user) {
    return (
      <LoginPage
        message={sessionMessage}
        onSuccess={(u) => {
          setSessionMessage("");
          setUser(u);
        }}
      />
    );
  }

  return (
    <div className="app">
      <Navbar page={page} onNavigate={setPage} user={user} onLogout={() => logout()} />
      <main className="content">
        {page === "dashboard" && <DashboardPage onNavigate={setPage} />}
        {page === "tasks" && <TasksPage />}
        {page === "courses" && <CoursesPage />}
      </main>
    </div>
  );
}
