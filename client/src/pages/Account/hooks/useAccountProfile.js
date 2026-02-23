import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  changePassword,
  fetchUserProfile,
  updateUserProfile,
} from "../services/accountApi";

// Simple JWT payload decoder
const decodeJwtPayload = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const buildInitialState = () => ({
  data: null,
  loading: true,
  error: "",
});

export const useAccountProfile = () => {
  const { token } = useAuth();
  const [state, setState] = useState(buildInitialState);

  const decodedToken = useMemo(() => decodeJwtPayload(token), [token]);
  const userId = decodedToken?.id;
  const userEmail = decodedToken?.email;

  const loadProfile = useCallback(async () => {
    if (!token || !userId) {
      setState({
        data: null,
        loading: false,
        error: "Vui lòng đăng nhập để xem hồ sơ.",
      });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const response = await fetchUserProfile(userId);
      setState({ data: response?.data || null, loading: false, error: "" });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error?.message || "Không thể tải hồ sơ.",
      });
    }
  }, [token, userId]);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId]);

  const updateProfile = async (payload) => {
    if (!token || !userId) {
      throw new Error("Vui lòng đăng nhập để cập nhật hồ sơ.");
    }
    const response = await updateUserProfile(userId, payload);
    if (response?.data) {
      setState((prev) => ({ ...prev, data: response.data }));
    }
    return response;
  };

  const updatePassword = async (payload) => {
    if (!token) {
      throw new Error("Vui lòng đăng nhập để đổi mật khẩu.");
    }
    return changePassword(payload);
  };

  return {
    profile: state.data,
    loading: state.loading,
    error: state.error,
    refresh: loadProfile,
    updateProfile,
    updatePassword,
    userId,
    userEmail,
  };
};
