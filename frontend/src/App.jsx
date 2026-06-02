import { useState } from "react";
import Auth from "./pages/Auth";
import Home from "./Home";
import api from "./api";

function App() {
  const [user, setUser] = useState(null);
  function handleAuthSuccess(connectedUser) {
    setUser(connectedUser);
  }

  const handleLogout = async () => {
    try {
      await api.post("/user/logout");
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    }
    setUser(null);
  };

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} api={api} />;
  }

  return <Home user={user} onLogout={handleLogout} api={api} />;
}

export default App;