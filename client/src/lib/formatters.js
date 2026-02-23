/**
 * Format price to Vietnamese currency
 */
export function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

/**
 * Format date to Vietnamese date format
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Format date and time to Vietnamese format
 */
export function formatDateTime(date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}
