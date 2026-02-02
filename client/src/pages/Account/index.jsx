import { useEffect, useMemo, useState } from "react";
import AccountSidebar from "./components/AccountSidebar";
import AvatarUploader from "./components/AvatarUploader";
import ProfileSection from "./components/ProfileSection";
import AddressSection from "./components/AddressSection";
import PasswordSection from "./components/PasswordSection";
import OrdersSection from "./components/OrdersSection";
import { DEFAULT_STATUS } from "./constants";
import { useAccountProfile } from "./hooks/useAccountProfile";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "./services/addressService";

const SECTION_COMPONENTS = {
  profile: ProfileSection,
  address: AddressSection,
  password: PasswordSection,
  orders: OrdersSection,
};

const getDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const buildProfileForm = (profile, fallbackEmail = "") => ({
  fullname: profile?.fullname || "",
  email: profile?.email || fallbackEmail || "",
  phone: profile?.phone || "",
  gender: profile?.gender || "",
  dateOfBirth: getDateInputValue(profile?.dateOfBirth),
});

const ADDRESS_LIMIT = 10;

const buildAddressDraft = (profile) => ({
  fullName: profile?.fullname || "",
  phone: profile?.phone || "",
  provinceCode: "",
  districtCode: "",
  wardCode: "",
  region: "",
  addressLine: "",
  type: "home",
  isDefault: false,
});

const isAddressDraftComplete = (draft) =>
  Boolean(
    draft?.fullName &&
      draft?.phone &&
      draft?.provinceCode &&
      draft?.districtCode &&
      draft?.wardCode &&
      draft?.addressLine &&
      draft?.type
  );

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
    buildProfileForm(profile, userEmail)
  );
  const [addresses, setAddresses] = useState([]);
  const [addressDraft, setAddressDraft] = useState(buildAddressDraft(profile));
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [addressMode, setAddressMode] = useState("create");
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileStatus, setProfileStatus] = useState(DEFAULT_STATUS);
  const [addressStatus, setAddressStatus] = useState(DEFAULT_STATUS);
  const [passwordStatus, setPasswordStatus] = useState(DEFAULT_STATUS);
  const [busySection, setBusySection] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (profile) {
      setProfileForm(buildProfileForm(profile, userEmail));
      setAddressDraft(buildAddressDraft(profile));
    }
  }, [profile, userEmail]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  useEffect(() => {
    if (!userId) {
      setAddresses([]);
      return;
    }
    listAddresses(userId)
      .then((data) => setAddresses(data))
      .catch(() => setAddresses([]));
  }, [userId]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (event) => {
    const { name, value, type, checked } = event.target;
    if (name === "phone") {
      setPhoneError("");
    }
    setAddressDraft((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileStatus(DEFAULT_STATUS);
    setBusySection("profile");
    try {
      const payload = {
        fullname: profileForm.fullname,
        phone: profileForm.phone || undefined,
        gender: profileForm.gender,
        dateOfBirth: profileForm.dateOfBirth || undefined,
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

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setAddressStatus(DEFAULT_STATUS);
    setPhoneError("");
    if (addressDraft.phone && /\D/.test(addressDraft.phone)) {
      setPhoneError("Không được ghi chữ ở ô số điện thoại.");
      setAddressDraft((prev) => ({ ...prev, phone: "" }));
      return;
    }
    if (addressDraft.phone && addressDraft.phone.length > 10) {
      setPhoneError("Số điện thoại không được vượt quá 10 số.");
      setAddressDraft((prev) => ({ ...prev, phone: "" }));
      return;
    }
    if (!isAddressDraftComplete(addressDraft)) {
      setAddressStatus({
        type: "error",
        message: "Vui lòng nhập đầy đủ thông tin địa chỉ.",
      });
      return;
    }
    if (addressMode === "create" && addresses.length >= ADDRESS_LIMIT) {
      setAddressStatus({
        type: "error",
        message: "Bạn chỉ có thể lưu tối đa 10 địa chỉ. Vui lòng xóa bớt.",
      });
      return;
    }
    setBusySection("address");
    try {
      if (!userId) {
        throw new Error("Vui lòng đăng nhập để lưu địa chỉ.");
      }
      const nextList =
        addressMode === "edit"
          ? await updateAddress(userId, editingAddressId, addressDraft)
          : await createAddress(userId, addressDraft);
      setAddresses(nextList);
      setIsAddressFormOpen(false);
      setAddressDraft(buildAddressDraft(profile));
      setAddressMode("create");
      setEditingAddressId(null);
    } catch (error) {
      setAddressStatus({
        type: "error",
        message: error?.message || "Cập nhật địa chỉ thất bại.",
      });
    } finally {
      setBusySection("");
    }
  };

  const handleAddressAdd = () => {
    setAddressStatus(DEFAULT_STATUS);
    setPhoneError("");
    if (addresses.length >= ADDRESS_LIMIT) {
      setAddressStatus({
        type: "error",
        message: "Bạn chỉ có thể lưu tối đa 10 địa chỉ. Vui lòng xóa bớt.",
      });
      return;
    }
    setAddressDraft(buildAddressDraft(profile));
    setAddressMode("create");
    setEditingAddressId(null);
    setIsAddressFormOpen(true);
  };

  const handleAddressEdit = (item) => {
    setAddressStatus(DEFAULT_STATUS);
    setPhoneError("");
    setAddressDraft({
      fullName: item.fullName,
      phone: item.phone,
      provinceCode: item.provinceCode || "",
      districtCode: item.districtCode || "",
      wardCode: item.wardCode || "",
      region: item.region,
      addressLine: item.addressLine,
      type: item.type,
      isDefault: item.isDefault,
    });
    setAddressMode("edit");
    setEditingAddressId(item.id);
    setIsAddressFormOpen(true);
  };

  const handleAddressDelete = (id) => {
    setAddressStatus(DEFAULT_STATUS);
    if (!userId) return;
    deleteAddress(userId, id)
      .then((next) => setAddresses(next))
      .catch((error) => {
        setAddressStatus({
          type: "error",
          message: error?.message || "Không thể xóa địa chỉ.",
        });
      });
  };

  const handleSetDefaultAddress = (id) => {
    setAddressStatus(DEFAULT_STATUS);
    if (!userId) return;
    setDefaultAddress(userId, id)
      .then((next) => setAddresses(next))
      .catch((error) => {
        setAddressStatus({
          type: "error",
          message: error?.message || "Không thể đặt mặc định.",
        });
      });
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
    [activeSection]
  );

  return (
    <div className="bg-white min-h-screen font-['Inter','Segoe_UI',system-ui,sans-serif]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          <AccountSidebar
            activeSection={activeSection}
            onSelect={setActiveSection}
            user={profile}
            avatarUrl={avatarPreview || profile?.avatarUrl}
          />

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
                    <ActiveSection
                      value={
                        activeSection === "profile"
                          ? profileForm
                          : activeSection === "address"
                          ? addressDraft
                          : activeSection === "password"
                          ? passwordForm
                          : null
                      }
                      onChange={
                        activeSection === "profile"
                          ? handleProfileChange
                          : activeSection === "address"
                          ? handleAddressChange
                          : handlePasswordChange
                      }
                      onSubmit={
                        activeSection === "profile"
                          ? handleProfileSubmit
                          : activeSection === "address"
                          ? handleAddressSubmit
                          : handlePasswordSubmit
                      }
                      status={
                        activeSection === "profile"
                          ? profileStatus
                          : activeSection === "address"
                          ? addressStatus
                          : passwordStatus
                      }
                      loading={busySection === activeSection}
                      addresses={addresses}
                      isFormOpen={isAddressFormOpen}
                      onOpenForm={handleAddressAdd}
                      onCloseForm={() => setIsAddressFormOpen(false)}
                      onEdit={handleAddressEdit}
                      onDelete={handleAddressDelete}
                      onSetDefault={handleSetDefaultAddress}
                      limit={ADDRESS_LIMIT}
                      phoneError={phoneError}
                    />
                  </div>

                  {activeSection === "profile" && (
                    <div className="w-full lg:w-[260px] flex justify-center lg:justify-end">
                      <AvatarUploader
                        previewUrl={avatarPreview}
                        onChange={handleAvatarChange}
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
