import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
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

// Mock data
const mockUsers = [
  {
    id: 1,
    fullName: "Nguyễn Văn An",
    email: "an.nguyen@email.com",
    phone: "0901234567",
    role: "customer",
    status: "active",
    created_at: "2025-12-15T10:00:00Z",
    last_login: "2026-01-28T08:30:00Z",
  },
  {
    id: 2,
    fullName: "Trần Thị Bình",
    email: "binh.tran@email.com",
    phone: "0902345678",
    role: "staff",
    status: "active",
    created_at: "2025-11-20T14:30:00Z",
    last_login: "2026-01-27T16:45:00Z",
  },
  {
    id: 3,
    fullName: "Lê Văn Cường",
    email: "cuong.le@email.com",
    phone: "0903456789",
    role: "customer",
    status: "inactive",
    created_at: "2025-10-10T09:15:00Z",
    last_login: "2025-12-20T11:20:00Z",
  },
  {
    id: 4,
    fullName: "Phạm Thị Dung",
    email: "dung.pham@email.com",
    phone: "0904567890",
    role: "admin",
    status: "active",
    created_at: "2025-09-05T08:00:00Z",
    last_login: "2026-01-28T07:15:00Z",
  },
  {
    id: 5,
    fullName: "Hoàng Văn Em",
    email: "em.hoang@email.com",
    phone: "0905678901",
    role: "customer",
    status: "active",
    created_at: "2026-01-10T13:45:00Z",
    last_login: "2026-01-28T09:00:00Z",
  },
];

const roleColors = {
  admin: "bg-purple-100 text-purple-800",
  staff: "bg-blue-100 text-blue-800",
  customer: "bg-green-100 text-green-800",
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
};

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

export default function AccountManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // create, edit, delete
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and search
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

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
      fullName: "",
      email: "",
      phone: "",
      role: "customer",
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

  const handleToggleStatus = (user) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u,
      ),
    );
  };

  const handleSaveUser = () => {
    if (dialogMode === "create") {
      const newUser = {
        ...selectedUser,
        id: users.length + 1,
        created_at: new Date().toISOString(),
        last_login: null,
      };
      setUsers((prev) => [...prev, newUser]);
    } else if (dialogMode === "edit") {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? selectedUser : u)),
      );
    } else if (dialogMode === "delete") {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    }
    setDialogOpen(false);
  };

  const handleExport = () => {
    // Export to CSV
    console.log("Exporting users...");
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
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
              {users.filter((u) => u.status === "active").length}
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
                users.filter((u) => u.role === "admin" || u.role === "staff")
                  .length
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
              {users.filter((u) => u.role === "customer").length}
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
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Đăng nhập gần nhất</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {user.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[user.status]}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(user.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.last_login
                        ? formatDate(user.last_login)
                        : "Chưa đăng nhập"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user)}
                        >
                          {user.status === "active" ? (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Vô hiệu hóa
                            </>
                          ) : (
                            <>
                              <Unlock className="mr-2 h-4 w-4" />
                              Kích hoạt
                            </>
                          )}
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
              ))}
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
                <strong>{selectedUser?.fullName}</strong>? Hành động này không
                thể hoàn tác.
              </DialogDescription>
            )}
          </DialogHeader>

          {(dialogMode === "create" || dialogMode === "edit") &&
            selectedUser && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Họ và tên</Label>
                  <Input
                    value={selectedUser.fullName}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        fullName: e.target.value,
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
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
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
            >
              {dialogMode === "delete" ? "Xóa" : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
