import { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TOKEN_KEY = "accessToken";
const USER_KEY = "auth_user";

// Only persist non-sensitive, immutable identity fields — role is excluded
// because it is mutable and must not be spoofable via localStorage tampering
const getStorableUser = (userData) => {
  const { id, name } = userData;
  return { id, name };
};

// Derive role from the signed JWT payload (read-only, server-issued)
const getRoleFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
};

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const AuthContext = createContext(undefined);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refs to always have current values inside event handlers without stale closures
  const tokenRef = useRef(token);
  const userRef = useRef(user);
  useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => { userRef.current = user; }, [user]);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser({ ...storedUser, role: getRoleFromToken(storedToken) });
    } else {
      // Clear any partial state
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setLoading(false);
  }, []);

  // Sync state when the user returns to the tab or refocuses the window.
  // visibilitychange: covers switching between browser tabs.
  // window focus: covers returning from another app/window.
  useEffect(() => {
    const handleSync = (e) => {
      // For visibilitychange, skip when the tab is going hidden
      if (e.type === "visibilitychange" && document.visibilityState !== "visible") return;

      const storedToken = getStoredToken();
      const storedUser = getStoredUser();
      const currentToken = tokenRef.current;
      const currentUser = userRef.current;

      // localStorage was cleared externally — log out
      if ((!storedToken || !storedUser) && (currentToken || currentUser)) {
        setToken(null);
        setUser(null);
        return;
      }

      // Restore if state was lost but localStorage still has data
      if (storedToken && storedUser && (!currentToken || !currentUser)) {
        setToken(storedToken);
        setUser({ ...storedUser, role: getRoleFromToken(storedToken) });
        return;
      }

      // Token changed in another tab — update state and re-derive role
      if (storedToken && storedToken !== currentToken) {
        setToken(storedToken);
        setUser((prev) => ({ ...prev, role: getRoleFromToken(storedToken) }));
      }
    };

    document.addEventListener("visibilitychange", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      document.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []); // empty deps — refs keep values current without re-registering

  const login = (accessToken, refreshToken, userData) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(getStorableUser(userData)));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => !!token;

  const updateToken = (newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const updateUser = (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(getStorableUser(userData)));
    setUser(userData);
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
    updateUser,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
