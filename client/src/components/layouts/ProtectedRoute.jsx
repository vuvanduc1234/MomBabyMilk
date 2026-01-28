import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute component để bảo vệ các routes yêu cầu xác thực
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con cần được bảo vệ
 * @param {string[]} props.allowedRoles - Danh sách các vai trò được phép truy cập
 */
export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Đang kiểm tra trạng thái đăng nhập
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập -> chuyển đến trang login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền truy cập nếu có chỉ định allowedRoles
  if (allowedRoles.length > 0 && user) {
    const userRole = user.role || "customer";

    if (!allowedRoles.includes(userRole)) {
      // Không có quyền -> chuyển đến trang 403 hoặc trang chủ
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Không có quyền truy cập
            </h1>
            <p className="text-gray-600 mb-6">
              Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản
              trị viên nếu bạn nghĩ đây là lỗi.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Đã đăng nhập và có quyền -> cho phép truy cập
  return children;
}

/**
 * Hook để kiểm tra quyền của người dùng hiện tại
 */
export function usePermission() {
  const { user } = useAuth();

  const hasRole = (roles) => {
    if (!user) return false;
    const userRole = user.role || "customer";
    return roles.includes(userRole);
  };

  const isAdmin = () => hasRole(["admin"]);
  const isStaff = () => hasRole(["staff", "admin"]);
  const isCustomer = () => hasRole(["customer", "staff", "admin"]);

  return {
    hasRole,
    isAdmin,
    isStaff,
    isCustomer,
    currentRole: user?.role || "customer",
  };
}
