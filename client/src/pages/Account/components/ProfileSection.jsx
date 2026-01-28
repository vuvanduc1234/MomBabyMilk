import { GENDER_OPTIONS } from "../constants";

const fieldClassName =
  "w-full h-[44px] px-3 rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#E996B1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]";

export default function ProfileSection({
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
          Hồ Sơ Của Tôi
        </h2>
        <p className="text-[13px] text-[#8b7b84] mt-1">
          Quản lý thông tin hồ sơ để bảo mật tài khoản
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
            <span className="font-medium">Tên đăng nhập</span>
            <input
              type="text"
              value={value?.email || ""}
              className={`${fieldClassName} bg-[#faf7f9] text-[#8b7b84]`}
              readOnly
            />
          </label>

          <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
            <span className="font-medium">Tên</span>
            <input
              type="text"
              name="fullname"
              value={value?.fullname || ""}
              onChange={onChange}
              className={fieldClassName}
              placeholder="Nhập họ và tên"
            />
          </label>

          <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
            <span className="font-medium">Email</span>
            <input
              type="email"
              value={value?.email || ""}
              className={`${fieldClassName} bg-[#faf7f9] text-[#8b7b84]`}
              readOnly
            />
          </label>

          <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
            <span className="font-medium">Số điện thoại</span>
            <input
              type="tel"
              name="phone"
              value={value?.phone || ""}
              onChange={onChange}
              className={fieldClassName}
              placeholder="Nhập số điện thoại"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
            <span className="font-medium">Giới tính</span>
            <div className="flex items-center gap-4">
              {GENDER_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-[14px]"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={value?.gender === option.value}
                    onChange={onChange}
                    className="accent-[#E996B1]"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
            <span className="font-medium">Ngày sinh</span>
            <input
              type="date"
              name="dateOfBirth"
              value={value?.dateOfBirth || ""}
              onChange={onChange}
              className={fieldClassName}
            />
          </label>
        </div>

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
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
