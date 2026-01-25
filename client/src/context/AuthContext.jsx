import { createContext, useContext, useEffect, useState } from "react";

const getAccessToken = () => localStorage.getItem("accessToken");
const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};
const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
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
};

const AuthContext = createContext(defaultAuth);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getAccessToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = getAccessToken();
      if (savedToken) {
        setToken(savedToken);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (accessToken, refreshToken, userData) => {
    setTokens(accessToken, refreshToken);
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

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
