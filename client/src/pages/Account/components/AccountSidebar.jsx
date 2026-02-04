import { ACCOUNT_SECTIONS } from "../constants";

const formatInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return initials.toUpperCase();
};

export default function AccountSidebar({
  activeSection,
  onSelect,
  user,
  avatarUrl,
}) {
  const displayName = user?.fullname || user?.email || "Tài khoản";

  return (
    <aside className="w-full max-w-[280px] flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-[54px] h-[54px] rounded-full bg-[#f7d9e6] text-[#b2547a] flex items-center justify-center font-semibold text-[18px] overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{formatInitials(displayName)}</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold text-[#2b2730]">
            {displayName}
          </span>
          <span className="text-[12px] text-[#8b7b84]">Sửa hồ sơ</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {ACCOUNT_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className={`text-left px-3 py-2 rounded-[10px] text-[14px] transition ${
              activeSection === section.id
                ? "bg-[#fde7f0] text-[#b2547a] font-semibold"
                : "text-[#2b2730] hover:bg-[#f7edf2]"
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
