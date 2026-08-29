import { useCallback, useState } from "react";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./authContext.js";

const getStoredSession = () => {
  try {
    const token = localStorage.getItem("clearpathToken") || "";
    const savedUser = localStorage.getItem("clearpathUser");
    return { token, user: token && savedUser ? JSON.parse(savedUser) : null };
  } catch {
    localStorage.removeItem("clearpathToken");
    localStorage.removeItem("clearpathUser");
    return { token: "", user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(getStoredSession);
  const { user, token } = session;

  const saveSession = useCallback((authToken, userData) => {
    localStorage.setItem("clearpathToken", authToken);
    localStorage.setItem("clearpathUser", JSON.stringify(userData));
    setSession({ token: authToken, user: userData });
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: authToken, user: userData } = response.data.data;
    saveSession(authToken, userData);
    return userData;
  };

  const register = async (formData) => {
    const response = await api.post("/auth/register", formData);
    const { token: authToken, user: userData } = response.data.data;
    saveSession(authToken, userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("clearpathToken");
    localStorage.removeItem("clearpathUser");
    setSession({ token: "", user: null });
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading: false, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};
