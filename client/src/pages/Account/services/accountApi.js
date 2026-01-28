const API_BASE = window.__API_BASE__ || "http://localhost:5000";

const buildHeaders = (token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.error || "Yêu cầu thất bại.";
    throw new Error(message);
  }
  return data;
};

export const fetchUserProfile = async (userId, token) => {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    headers: buildHeaders(token),
  });
  return parseJson(response);
};

export const updateUserProfile = async (userId, payload, token) => {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: "PATCH",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseJson(response);
};

export const changePassword = async (payload, token) => {
  const response = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseJson(response);
};
