import { useState } from "react";
import axios from "axios";
import Auth from "./pages/Auth";
import Home from "./Home";

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true
});

function App() {
  const [user, setUser] = useState({
    username: "Robin",
    firstName: "Rob",
    lastName: "B",
    email: "robin@rob.fr",
    role: "admin",
    birthdate: "2003-06-01"
  });

  function handleAuthSuccess(connectedUser) {
    setUser(connectedUser);
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} api={api} />;
  }

  return <Home user={user} onLogout={() => setUser(null)} api={api} />;
}

export default App;