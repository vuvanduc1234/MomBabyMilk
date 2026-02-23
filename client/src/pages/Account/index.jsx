import { useEffect, useMemo, useState } from "react";
import AccountSidebar from "./components/AccountSidebar";
import AvatarUploader from "./components/AvatarUploader";
import ProfileSection from "./components/ProfileSection";
import PasswordSection from "./components/PasswordSection";
import { ACCOUNT_SECTIONS, DEFAULT_STATUS, MEMBER_SECTIONS } from "./constants";
import { useAccountProfile } from "./hooks/useAccountProfile";
import VouchersSection from "./components/VouchersSection";
import LoyaltySection from "./components/LoyaltySection";
import RewardsSection from "./components/RewardsSection";

const SECTION_COMPONENTS = {
  profile: ProfileSection,
  password: PasswordSection,
  loyalty: LoyaltySection,
  rewards: RewardsSection,
  vouchers: VouchersSection,
};

const getDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const buildProfileForm = (profile, fallbackEmail = "") => {
  // Fix phone: Backend lưu dưới dạng Number, nên số 0 đầu bị mất
  // Tự động thêm 0 vào đầu nếu phone có 9 chữ số
  let phoneValue = profile?.phone || "";
  if (phoneValue && typeof phoneValue === "number") {
    phoneValue = String(phoneValue);
  }
  if (phoneValue && phoneValue.length === 9 && !phoneValue.startsWith("0")) {
    phoneValue = "0" + phoneValue;
  }

  return {
    fullname: profile?.fullname || "",
    email: profile?.email || fallbackEmail || "",
    phone: phoneValue,
    gender: profile?.gender || "",
    dateOfBirth: getDateInputValue(profile?.dateOfBirth),
  };
};

const buildAddressForm = (profile) => ({
  provinceCode: "",
  districtCode: "",
  wardCode: "",
  region: "",
  addressLine: "",
  type: "home",
});

const formatAddressToString = (addressForm) => {
  if (!addressForm?.region || !addressForm?.addressLine) {
    return "";
  }
  const typeMap = { home: "Nhà Riêng", office: "Văn Phòng" };
  const typeLabel = typeMap[addressForm.type] || "";
  return `${addressForm.addressLine}, ${addressForm.region}${typeLabel ? ` - ${typeLabel}` : ""}`;
};

export default function AccountPage() {
  const {
    profile,
    loading,
    error,
    updateProfile,
    updatePassword,
    userEmail,
    userId,
  } = useAccountProfile();

  const [activeSection, setActiveSection] = useState("profile");
  const [profileForm, setProfileForm] = useState(
    buildProfileForm(profile, userEmail),
  );
  const [addressForm, setAddressForm] = useState(buildAddressForm(profile));
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileStatus, setProfileStatus] = useState(DEFAULT_STATUS);
  const [passwordStatus, setPasswordStatus] = useState(DEFAULT_STATUS);
  const [busySection, setBusySection] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (profile) {
      setProfileForm(buildProfileForm(profile, userEmail));
      setAddressForm(buildAddressForm(profile));
      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }
    }
  }, [profile, userEmail]);

  // Tự động ẩn thông báo sau 2 giây
  useEffect(() => {
    if (!profileStatus.message) return;
    const timer = setTimeout(() => setProfileStatus(DEFAULT_STATUS), 2000);
    return () => clearTimeout(timer);
  }, [profileStatus]);

  useEffect(() => {
    if (!passwordStatus.message) return;
    const timer = setTimeout(() => setPasswordStatus(DEFAULT_STATUS), 2000);
    return () => clearTimeout(timer);
  }, [passwordStatus]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      setProfileStatus({
        type: "error",
        message: "Dung lượng file không được vượt quá 1MB.",
      });
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setProfileStatus({
        type: "error",
        message: "Chỉ chấp nhận file PNG hoặc JPEG.",
      });
      return;
    }

    // Preview immediately
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(URL.createObjectURL(file));

    // Upload to Cloudinary
    setProfileStatus(DEFAULT_STATUS);
    setBusySection("avatar");
    try {
      const { uploadAvatar } = await import("./services/accountApi");
      const response = await uploadAvatar(file);

      setProfileStatus({
        type: "success",
        message: "Upload avatar thành công.",
      });

      // Update preview with actual uploaded URL
      setAvatarPreview(response.data.avatar);
    } catch (error) {
      setProfileStatus({
        type: "error",
        message: error?.message || "Upload avatar thất bại.",
      });
    } finally {
      setBusySection("");
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileStatus(DEFAULT_STATUS);
    setBusySection("profile");
    try {
      const addressString = formatAddressToString(addressForm);
      const payload = {
        fullname: profileForm.fullname,
        phone: profileForm.phone ? String(profileForm.phone) : undefined,
        gender: profileForm.gender,
        dateOfBirth: profileForm.dateOfBirth || undefined,
        address: addressString || undefined,
      };
      await updateProfile(payload);
      setProfileStatus({
        type: "success",
        message: "Cập nhật hồ sơ thành công.",
      });
    } catch (error) {
      setProfileStatus({
        type: "error",
        message: error?.message || "Cập nhật hồ sơ thất bại.",
      });
    } finally {
      setBusySection("");
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordStatus(DEFAULT_STATUS);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }
    setBusySection("password");
    try {
      await updatePassword({
        email: profile?.email || userEmail,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordStatus({
        type: "success",
        message: "Đổi mật khẩu thành công.",
      });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setPasswordStatus({
        type: "error",
        message: error?.message || "Đổi mật khẩu thất bại.",
      });
    } finally {
      setBusySection("");
    }
  };

  const ActiveSection = useMemo(
    () => SECTION_COMPONENTS[activeSection] || ProfileSection,
    [activeSection],
  );

  return (
    <div className="bg-white min-h-screen font-['Inter','Segoe_UI',system-ui,sans-serif]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="space-y-6">
            <AccountSidebar
              activeSection={activeSection}
              onSelect={setActiveSection}
              user={profile}
              avatarUrl={avatarPreview || profile?.avatarUrl}
            />

            <div>
              <h2 className="text-[16px] font-semibold text-[#2b2730] mb-3">
                NURA Members
              </h2>
              <nav className="flex flex-col gap-1">
                {MEMBER_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
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
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white border border-[#f1d4e0] rounded-[18px] p-6 md:p-8 shadow-[0_12px_30px_rgba(41,10,24,0.06)]">
              {loading && (
                <div className="text-[14px] text-[#8b7b84]">
                  Đang tải thông tin hồ sơ...
                </div>
              )}
              {!loading && error && (
                <div className="text-[14px] text-[#b71c1c]">{error}</div>
              )}
              {!loading && !error && (
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    {activeSection === "profile" ? (
                      <ProfileSection
                        value={profileForm}
                        onChange={handleProfileChange}
                        onSubmit={handleProfileSubmit}
                        status={profileStatus}
                        loading={busySection === "profile"}
                        addressValue={addressForm}
                        onAddressChange={handleAddressChange}
                        profileAddress={profile?.address}
                      />
                    ) : (
                      <ActiveSection
                        value={
                          activeSection === "password" ? passwordForm : null
                        }
                        onChange={handlePasswordChange}
                        onSubmit={handlePasswordSubmit}
                        status={passwordStatus}
                        loading={busySection === activeSection}
                      />
                    )}
                  </div>

                  {activeSection === "profile" && (
                    <div className="w-full lg:w-[260px] flex justify-center lg:justify-end">
                      <AvatarUploader
                        previewUrl={avatarPreview}
                        onChange={handleAvatarChange}
                        loading={busySection === "avatar"}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
