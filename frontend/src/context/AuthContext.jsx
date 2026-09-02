import { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(() => Boolean(getStoredSession().token));
  const { user, token } = session;

  const saveSession = useCallback((authToken, userData) => {
    localStorage.setItem("clearpathToken", authToken);
    localStorage.setItem("clearpathUser", JSON.stringify(userData));
    setSession({ token: authToken, user: userData });
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("clearpathToken");
    localStorage.removeItem("clearpathUser");
    setSession({ token: "", user: null });
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = localStorage.getItem("clearpathToken");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      const userData = response.data.data.user;
      localStorage.setItem("clearpathUser", JSON.stringify(userData));
      setSession({ token: storedToken, user: userData });
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void restoreSession();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [restoreSession]);

  useEffect(() => {
    window.addEventListener("clearpath:unauthorized", clearSession);
    return () => window.removeEventListener("clearpath:unauthorized", clearSession);
  }, [clearSession]);

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

  const registerAdmin = async (formData) => {
    const response = await api.post("/auth/register-admin", formData);
    const { token: authToken, user: userData } = response.data.data;
    saveSession(authToken, userData);
    return userData;
  };

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, register, registerAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
};
