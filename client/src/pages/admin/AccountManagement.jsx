import { useState, useMemo, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Filter,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const roleColors = {
  Admin: "bg-purple-100 text-purple-800",
  Staff: "bg-blue-100 text-blue-800",
  Customer: "bg-green-100 text-green-800",
  admin: "bg-purple-100 text-purple-800",
  staff: "bg-blue-100 text-blue-800",
  customer: "bg-green-100 text-green-800",
};

const formatDate = (dateString) => {
  if (!dateString) return "Chưa đăng nhập";
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

export default function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/api/users");
      const data = res.data?.data || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể tải danh sách người dùng.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and search - normalize field names from API
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = user.fullname || user.fullName || user.name || "";
      const email = user.email || "";
      const phone = user.phone || user.phoneNumber || "";
      const role = (user.role || "").toLowerCase();
      const status = user.status || (user.isActive ? "active" : "inactive");

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery);

      const matchesRole =
        roleFilter === "all" || role === roleFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleCreateUser = () => {
    setDialogMode("create");
    setSelectedUser({
      fullname: "",
      email: "",
      phone: "",
      role: "Customer",
      status: "active",
    });
    setDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setDialogMode("edit");
    setSelectedUser({ ...user });
    setDialogOpen(true);
  };

  const handleDeleteUser = (user) => {
    setDialogMode("delete");
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      setSaving(true);
      if (dialogMode === "create") {
        await axiosInstance.post("/api/auth/register", {
          fullname: selectedUser.fullname || selectedUser.fullName,
          email: selectedUser.email,
          phone: selectedUser.phone,
          password: selectedUser.password || "Nura@123456",
          role: selectedUser.role,
        });
        await fetchUsers();
      } else if (dialogMode === "edit") {
        const userId = selectedUser._id || selectedUser.id;
        await axiosInstance.put(`/api/users/${userId}`, {
          fullname: selectedUser.fullname || selectedUser.fullName,
          phone: selectedUser.phone,
          role: selectedUser.role,
          status: selectedUser.status,
        });
        await fetchUsers();
      } else if (dialogMode === "delete") {
        const userId = selectedUser._id || selectedUser.id;
        await axiosInstance.delete(`/api/users/${userId}`);
        setUsers((prev) => prev.filter((u) => (u._id || u.id) !== userId));
      }
      setDialogOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Thao tác thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Account Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài khoản người dùng hệ thống
          </p>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng người dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter(
                  (u) => u.status === "active" || u.isActive === true,
                ).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admin/Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter((u) => {
                  const r = (u.role || "").toLowerCase();
                  return r === "admin" || r === "staff";
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter((u) => (u.role || "").toLowerCase() === "customer")
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Tìm theo tên, email hoặc số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600" />
                      Đang tải...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-red-600"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Không tìm thấy người dùng nào.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const userId = user._id || user.id;
                  const userName =
                    user.fullname || user.fullName || user.name || "—";
                  const userPhone = user.phone || user.phoneNumber || "—";
                  const userRole = user.role || "customer";
                  const createdAt = user.createdAt || user.created_at;
                  return (
                    <TableRow key={userId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{userName}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {userPhone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            roleColors[userRole] || "bg-gray-100 text-gray-800"
                          }
                        >
                          {userRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(createdAt)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
          {Math.min(currentPage * itemsPerPage, filteredUsers.length)} trong
          tổng số {filteredUsers.length} người dùng
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dialog for Create/Edit/Delete */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" && "Thêm người dùng mới"}
              {dialogMode === "edit" && "Chỉnh sửa người dùng"}
              {dialogMode === "delete" && "Xác nhận xóa"}
            </DialogTitle>
            {dialogMode === "delete" && (
              <DialogDescription>
                Bạn có chắc chắn muốn xóa người dùng{" "}
                <strong>
                  {selectedUser?.fullname || selectedUser?.fullName}
                </strong>
                ? Hành động này không thể hoàn tác.
              </DialogDescription>
            )}
          </DialogHeader>

          {(dialogMode === "create" || dialogMode === "edit") &&
            selectedUser && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    value={selectedUser.fullname || selectedUser.fullName || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        fullname: e.target.value,
                      })
                    }
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        email: e.target.value,
                      })
                    }
                    placeholder="Nhập email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={selectedUser.phone}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) =>
                      setSelectedUser({ ...selectedUser, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Customer">Customer</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Trạng thái</Label>
                  <Select
                    value={selectedUser.status}
                    onValueChange={(value) =>
                      setSelectedUser({ ...selectedUser, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveUser}
              variant={dialogMode === "delete" ? "destructive" : "default"}
              disabled={saving}
            >
              {saving
                ? "Đang xử lý..."
                : dialogMode === "delete"
                  ? "Xóa"
                  : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
