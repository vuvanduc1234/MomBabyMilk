const fieldClassName =
  "w-full h-[44px] px-3 rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#E996B1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]";

export default function PasswordSection({
  value,
  onChange,
  onSubmit,
  status,
  loading,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[18px] font-semibold text-[#2b2730]">
          Đổi Mật Khẩu
        </h2>
        <p className="text-[13px] text-[#8b7b84] mt-1">
          Mật khẩu mới nên có 8-30 ký tự, bao gồm chữ hoa, chữ thường và số.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
          <span className="font-medium">Mật khẩu hiện tại</span>
          <input
            type="password"
            name="oldPassword"
            value={value?.oldPassword || ""}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Nhập mật khẩu hiện tại"
          />
        </label>

        <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
          <span className="font-medium">Mật khẩu mới</span>
          <input
            type="password"
            name="newPassword"
            value={value?.newPassword || ""}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Nhập mật khẩu mới"
          />
        </label>

        <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
          <span className="font-medium">Xác nhận mật khẩu mới</span>
          <input
            type="password"
            name="confirmPassword"
            value={value?.confirmPassword || ""}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Nhập lại mật khẩu mới"
          />
        </label>

        {status?.message && (
          <div
            className={`px-4 py-3 rounded-[12px] text-[13px] font-semibold ${
              status.type === "success"
                ? "bg-[#e9f7ef] text-[#1b5e20]"
                : "bg-[#ffeaea] text-[#b71c1c]"
            }`}
          >
            {status.message}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="h-[44px] px-6 rounded-[12px] border-0 bg-[#E996B1] text-white font-semibold text-[15px] cursor-pointer shadow-[0_8px_16px_rgba(233,150,177,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đổi..." : "Cập nhật mật khẩu"}
          </button>
        </div>
      </form>
    </div>
  );
}
