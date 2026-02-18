import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Users,
  Settings,
  ShoppingCart,
  Package,
  BarChart3,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

// Permission categories
const permissionCategories = [
  {
    id: "users",
    name: "Quản lý người dùng",
    icon: Users,
    permissions: [
      { id: "users.view", name: "Xem danh sách người dùng" },
      { id: "users.create", name: "Thêm người dùng mới" },
      { id: "users.edit", name: "Chỉnh sửa người dùng" },
      { id: "users.delete", name: "Xóa người dùng" },
    ],
  },
  {
    id: "orders",
    name: "Quản lý đơn hàng",
    icon: ShoppingCart,
    permissions: [
      { id: "orders.view", name: "Xem đơn hàng" },
      { id: "orders.create", name: "Tạo đơn hàng" },
      { id: "orders.edit", name: "Chỉnh sửa đơn hàng" },
      { id: "orders.cancel", name: "Hủy đơn hàng" },
      { id: "orders.process", name: "Xử lý đơn hàng" },
    ],
  },
  {
    id: "products",
    name: "Quản lý sản phẩm",
    icon: Package,
    permissions: [
      { id: "products.view", name: "Xem sản phẩm" },
      { id: "products.create", name: "Thêm sản phẩm" },
      { id: "products.edit", name: "Chỉnh sửa sản phẩm" },
      { id: "products.delete", name: "Xóa sản phẩm" },
      { id: "products.inventory", name: "Quản lý tồn kho" },
    ],
  },
  {
    id: "reports",
    name: "Báo cáo & Thống kê",
    icon: BarChart3,
    permissions: [
      { id: "reports.revenue", name: "Xem báo cáo doanh thu" },
      { id: "reports.sales", name: "Xem báo cáo bán hàng" },
      { id: "reports.inventory", name: "Xem báo cáo tồn kho" },
      { id: "reports.export", name: "Xuất báo cáo" },
    ],
  },
  {
    id: "settings",
    name: "Cài đặt hệ thống",
    icon: Settings,
    permissions: [
      { id: "settings.view", name: "Xem cài đặt" },
      { id: "settings.edit", name: "Chỉnh sửa cài đặt" },
      { id: "settings.roles", name: "Quản lý vai trò" },
    ],
  },
];

// Mock roles data
const mockRoles = [
  {
    id: 1,
    name: "Administrator",
    description:
      "Quyền quản trị viên cao nhất, có toàn quyền truy cập hệ thống",
    permissions: [
      "users.view",
      "users.create",
      "users.edit",
      "users.delete",
      "orders.view",
      "orders.create",
      "orders.edit",
      "orders.cancel",
      "orders.process",
      "products.view",
      "products.create",
      "products.edit",
      "products.delete",
      "products.inventory",
      "reports.revenue",
      "reports.sales",
      "reports.inventory",
      "reports.export",
      "settings.view",
      "settings.edit",
      "settings.roles",
    ],
    userCount: 3,
    isSystem: true,
    color: "purple",
  },
  {
    id: 2,
    name: "Staff Manager",
    description:
      "Quản lý nhân viên, có quyền xử lý đơn hàng và quản lý sản phẩm",
    permissions: [
      "users.view",
      "orders.view",
      "orders.edit",
      "orders.process",
      "products.view",
      "products.edit",
      "products.inventory",
      "reports.sales",
      "reports.inventory",
    ],
    userCount: 8,
    isSystem: false,
    color: "blue",
  },
  {
    id: 3,
    name: "Sales Staff",
    description: "Nhân viên bán hàng, xử lý đơn hàng và hỗ trợ khách hàng",
    permissions: [
      "orders.view",
      "orders.edit",
      "orders.process",
      "products.view",
      "reports.sales",
    ],
    userCount: 15,
    isSystem: false,
    color: "green",
  },
  {
    id: 4,
    name: "Warehouse Staff",
    description: "Nhân viên kho, quản lý tồn kho và nhập xuất hàng",
    permissions: [
      "products.view",
      "products.inventory",
      "orders.view",
      "reports.inventory",
    ],
    userCount: 6,
    isSystem: false,
    color: "amber",
  },
];

const roleColorClasses = {
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-green-100 text-green-800 border-green-200",
  amber: "bg-amber-100 text-amber-800 border-amber-200",
};

export default function RoleManagement() {
  const [roles, setRoles] = useState(mockRoles);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedRole, setSelectedRole] = useState(null);

  // Fetch real user counts per role from API
  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const res = await axiosInstance.get("/api/users");
        const users = res.data?.data || res.data || [];
        if (!Array.isArray(users)) return;

        setRoles((prev) =>
          prev.map((role) => ({
            ...role,
            userCount: users.filter(
              (u) => (u.role || "").toLowerCase() === role.name.toLowerCase(),
            ).length,
          })),
        );
      } catch (err) {
        console.error("Error fetching user counts:", err);
      }
    };
    fetchUserCounts();
  }, []);

  const handleCreateRole = () => {
    setDialogMode("create");
    setSelectedRole({
      name: "",
      description: "",
      permissions: [],
      color: "blue",
    });
    setDialogOpen(true);
  };

  const handleEditRole = (role) => {
    setDialogMode("edit");
    setSelectedRole({ ...role });
    setDialogOpen(true);
  };

  const handleDeleteRole = (role) => {
    setDialogMode("delete");
    setSelectedRole(role);
    setDialogOpen(true);
  };

  const handleSaveRole = () => {
    if (dialogMode === "create") {
      const newRole = {
        ...selectedRole,
        id: roles.length + 1,
        userCount: 0,
        isSystem: false,
      };
      setRoles((prev) => [...prev, newRole]);
    } else if (dialogMode === "edit") {
      setRoles((prev) =>
        prev.map((r) => (r.id === selectedRole.id ? selectedRole : r)),
      );
    } else if (dialogMode === "delete") {
      setRoles((prev) => prev.filter((r) => r.id !== selectedRole.id));
    }
    setDialogOpen(false);
  };

  const togglePermission = (permissionId) => {
    setSelectedRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const toggleCategoryPermissions = (category) => {
    const categoryPermissions = category.permissions.map((p) => p.id);
    const allSelected = categoryPermissions.every((p) =>
      selectedRole.permissions.includes(p),
    );

    setSelectedRole((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !categoryPermissions.includes(p))
        : [...new Set([...prev.permissions, ...categoryPermissions])],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý vai trò và phân quyền người dùng
          </p>
        </div>
        <Button onClick={handleCreateRole}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo vai trò mới
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {roles.map((role) => (
          <Card
            key={role.id}
            className={`border-2 ${roleColorClasses[role.color]}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {role.name}
                    {role.isSystem && (
                      <Badge variant="outline" className="ml-2">
                        System
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {role.description}
                  </p>
                </div>
                {!role.isSystem && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditRole(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRole(role)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm font-medium">Người dùng</span>
                  <Badge variant="secondary">{role.userCount}</Badge>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3">Quyền hạn:</div>
                  <div className="space-y-2">
                    {permissionCategories.map((category) => {
                      const categoryPermissions = category.permissions.filter(
                        (p) => role.permissions.includes(p.id),
                      );
                      if (categoryPermissions.length === 0) return null;

                      const Icon = category.icon;
                      return (
                        <div
                          key={category.id}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-xs text-muted-foreground mb-1">
                              {category.name}
                            </div>
                            <ul className="space-y-1 text-xs">
                              {categoryPermissions.map((permission) => (
                                <li
                                  key={permission.id}
                                  className="flex items-center gap-1"
                                >
                                  <Check className="h-3 w-3 text-green-600" />
                                  {permission.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog for Create/Edit/Delete */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" && "Tạo vai trò mới"}
              {dialogMode === "edit" && "Chỉnh sửa vai trò"}
              {dialogMode === "delete" && "Xác nhận xóa"}
            </DialogTitle>
            {dialogMode === "delete" && (
              <DialogDescription>
                Bạn có chắc chắn muốn xóa vai trò{" "}
                <strong>{selectedRole?.name}</strong>? Hành động này sẽ ảnh
                hưởng đến {selectedRole?.userCount} người dùng.
              </DialogDescription>
            )}
          </DialogHeader>

          {(dialogMode === "create" || dialogMode === "edit") &&
            selectedRole && (
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Tên vai trò *</Label>
                  <Input
                    value={selectedRole.name}
                    onChange={(e) =>
                      setSelectedRole({ ...selectedRole, name: e.target.value })
                    }
                    placeholder="Ví dụ: Sales Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mô tả</Label>
                  <Textarea
                    value={selectedRole.description}
                    onChange={(e) =>
                      setSelectedRole({
                        ...selectedRole,
                        description: e.target.value,
                      })
                    }
                    placeholder="Mô tả vai trò và trách nhiệm"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Phân quyền</Label>
                  <div className="space-y-4">
                    {permissionCategories.map((category) => {
                      const Icon = category.icon;
                      const categoryPermissions = category.permissions.map(
                        (p) => p.id,
                      );
                      const allSelected = categoryPermissions.every((p) =>
                        selectedRole.permissions.includes(p),
                      );
                      const someSelected =
                        !allSelected &&
                        categoryPermissions.some((p) =>
                          selectedRole.permissions.includes(p),
                        );

                      return (
                        <Card key={category.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">
                                  {category.name}
                                </span>
                              </div>
                              <Switch
                                checked={allSelected}
                                onCheckedChange={() =>
                                  toggleCategoryPermissions(category)
                                }
                              />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-3 md:grid-cols-2">
                              {category.permissions.map((permission) => (
                                <div
                                  key={permission.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={permission.id}
                                    checked={selectedRole.permissions.includes(
                                      permission.id,
                                    )}
                                    onCheckedChange={() =>
                                      togglePermission(permission.id)
                                    }
                                  />
                                  <label
                                    htmlFor={permission.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {permission.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleSaveRole}
              variant={dialogMode === "delete" ? "destructive" : "default"}
            >
              {dialogMode === "delete" ? "Xóa vai trò" : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
