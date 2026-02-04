const decodeBase64Url = (input) => {
  if (!input) return null;
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  return decodeBase64Url(parts[1]);
};
