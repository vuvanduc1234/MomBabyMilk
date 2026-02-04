import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Complaints() {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="pt-2 pb-6">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Quản lý khiếu nại
          </h1>
        </div>
        <div className="sticky top-20 bg-white border rounded-lg shadow-sm p-4 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <div>
            <h3 className="font-semibold text-sm mb-3">Bộ lọc</h3>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mức độ ưu tiên</Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Trạng thái</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="inprogress">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã giải quyết</SelectItem>
                  <SelectItem value="closed">Đã đóng</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setPriorityFilter("all");
                setStatusFilter("all");
                setSearch("");
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pt-2 flex-1 space-y-5">
        {/* Search and Create Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khiếu nại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo khiếu nại
          </Button>
        </div>

        {/* Content Card */}
        <Card className="py-2 min-h-[calc(100vh-10rem)]">
          <CardContent className="px-3">
            <div className="flex items-center justify-center h-[calc(100vh-14rem)] text-muted-foreground">
              <p>Nội dung quản lý khiếu nại sẽ được hiển thị tại đây</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}