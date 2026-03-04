import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const isTokenExpiringSoon = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const expirationTime = decoded.exp;
    const timeUntilExpiry = expirationTime - currentTime;

    return timeUntilExpiry < 60;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/api/auth/token`,
      {},
      { withCredentials: true },
    );
    const { accessToken } = response.data;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      return accessToken;
    }
    return null;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    throw error;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    // Skip interceptor for public auth endpoints that don't need tokens
    const publicEndpoints = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/verify-email",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint),
    );

    if (isPublicEndpoint) {
      return config;
    }

    const token = localStorage.getItem("accessToken");

    if (token && isTokenExpiringSoon(token)) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          processQueue(null, newToken);

          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
        } catch (error) {
          isRefreshing = false;
          processQueue(error, null);
          return Promise.reject(error);
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            config.headers.Authorization = `Bearer ${newToken}`;
            return config;
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
