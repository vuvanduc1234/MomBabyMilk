import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getAccessToken = () => localStorage.getItem("accessToken");
const getStoredUser = () => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};
const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};
const setStoredUser = (userData) => {
  if (userData) {
    localStorage.setItem("user", JSON.stringify(userData));
  }
};
const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const defaultAuth = {
  user: null,
  token: getAccessToken(),
  loading: false,
  login: (accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
  },
  logout: () => {
    clearTokens();
  },
  isAuthenticated: () => !!getAccessToken(),
  updateToken: () => {},
  refreshToken: async () => {},
};

const AuthContext = createContext(defaultAuth);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getAccessToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = getAccessToken();
      const savedUser = getStoredUser();
      if (savedToken) {
        setToken(savedToken);
      }
      if (savedUser) {
        setUser(savedUser);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (accessToken, refreshToken, userData) => {
    setTokens(accessToken, refreshToken);
    setStoredUser(userData);
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    clearTokens();
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const updateToken = (newToken) => {
    localStorage.setItem("accessToken", newToken);
    setToken(newToken);
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/token`,
        {},
        { withCredentials: true },
      );

      if (response.data.accessToken) {
        updateToken(response.data.accessToken);
        return response.data.accessToken;
      }
      return null;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    updateToken,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
