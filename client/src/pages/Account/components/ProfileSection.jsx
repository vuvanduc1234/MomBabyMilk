import { useEffect, useMemo, useRef, useState } from "react";
import { GENDER_OPTIONS } from "../constants";

const fieldClassName =
  "w-full h-[44px] px-3 rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#E996B1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]";

const addressTypeOptions = [
  { value: "home", label: "Nhà Riêng" },
  { value: "office", label: "Văn Phòng" },
];

export default function ProfileSection({
  value,
  onChange,
  onSubmit,
  status,
  loading,
  addressValue,
  onAddressChange,
  profileAddress,
}) {
  const [provinceList, setProvinceList] = useState([]);
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState("");
  const [openDropdown, setOpenDropdown] = useState("");
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadRegions = async () => {
      setRegionLoading(true);
      setRegionError("");
      try {
        const response = await fetch(
          "https://provinces.open-api.vn/api/?depth=3",
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error("Không thể tải danh sách tỉnh thành.");
        }
        if (isMounted) {
          setProvinceList(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setRegionError(
            error?.message || "Không thể tải danh sách tỉnh thành.",
          );
        }
      } finally {
        if (isMounted) {
          setRegionLoading(false);
        }
      }
    };
    loadRegions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Lưu thành công → tự đóng form địa chỉ
  useEffect(() => {
    if (status?.type === "success") {
      setIsAddressFormOpen(false);
    }
  }, [status]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!openDropdown) return;
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpenDropdown("");
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  const selectedProvince = useMemo(
    () =>
      provinceList.find(
        (item) => `${item.code}` === `${addressValue?.provinceCode}`,
      ),
    [provinceList, addressValue?.provinceCode],
  );

  const districtList = selectedProvince?.districts || [];
  const selectedDistrict = districtList.find(
    (item) => `${item.code}` === `${addressValue?.districtCode}`,
  );
  const wardList = selectedDistrict?.wards || [];
  const selectedWard = wardList.find(
    (item) => `${item.code}` === `${addressValue?.wardCode}`,
  );

  const emitAddressChange = (name, nextValue) => {
    onAddressChange({
      target: {
        name,
        value: nextValue,
        type: "text",
      },
    });
  };

  const syncRegionText = (province, district, ward) => {
    if (!province || !district || !ward) {
      emitAddressChange("region", "");
      return;
    }
    emitAddressChange(
      "region",
      `${ward.name}, ${district.name}, ${province.name}`,
    );
  };

  const handleProvinceSelect = (event) => {
    const nextCode = event.target.value;
    emitAddressChange("provinceCode", nextCode);
    emitAddressChange("districtCode", "");
    emitAddressChange("wardCode", "");
    syncRegionText(null, null, null);
  };

  const handleDistrictSelect = (event) => {
    const nextCode = event.target.value;
    emitAddressChange("districtCode", nextCode);
    emitAddressChange("wardCode", "");
    const nextProvince = provinceList.find(
      (item) => `${item.code}` === `${addressValue?.provinceCode}`,
    );
    const nextDistrict = nextProvince?.districts?.find(
      (item) => `${item.code}` === `${nextCode}`,
    );
    syncRegionText(nextProvince, nextDistrict, null);
  };

  const handleWardSelect = (event) => {
    const nextCode = event.target.value;
    emitAddressChange("wardCode", nextCode);
    const nextProvince = provinceList.find(
      (item) => `${item.code}` === `${addressValue?.provinceCode}`,
    );
    const nextDistrict = nextProvince?.districts?.find(
      (item) => `${item.code}` === `${addressValue?.districtCode}`,
    );
    const nextWard = nextDistrict?.wards?.find(
      (item) => `${item.code}` === `${nextCode}`,
    );
    syncRegionText(nextProvince, nextDistrict, nextWard);
  };

  const handleSelectOption = (type, option) => {
    if (type === "province") {
      handleProvinceSelect({ target: { value: `${option.code}` } });
    }
    if (type === "district") {
      handleDistrictSelect({ target: { value: `${option.code}` } });
    }
    if (type === "ward") {
      handleWardSelect({ target: { value: `${option.code}` } });
    }
    setOpenDropdown("");
  };

  const renderDropdown = (
    type,
    options,
    selectedLabel,
    disabled,
    placeholder,
  ) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenDropdown((prev) => (prev === type ? "" : type))}
        disabled={disabled}
        className={`${fieldClassName} flex items-center justify-between ${
          disabled ? "text-[#b0a0a8] bg-[#faf7f9]" : "text-[#2b2730]"
        }`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <span className="ml-3 text-[#b0a0a8]">▾</span>
      </button>
      {openDropdown === type && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-[#f1d4e0] rounded-[10px] shadow-[0_12px_30px_rgba(41,10,24,0.08)]">
          <div className="max-h-[220px] overflow-y-auto">
            {options.length ? (
              options.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => handleSelectOption(type, option)}
                  className="w-full text-left px-3 py-2 text-[14px] text-[#2b2730] hover:bg-[#fde7f0]"
                >
                  {option.name}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-[13px] text-[#8b7b84]">
                Không có dữ liệu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const hasAddress =
    addressValue?.provinceCode &&
    addressValue?.districtCode &&
    addressValue?.wardCode &&
    addressValue?.addressLine;

  const formatAddressDisplay = () => {
    if (!hasAddress) return "";
    const typeLabel =
      addressTypeOptions.find((opt) => opt.value === addressValue?.type)
        ?.label || "";
    return `${addressValue.addressLine}, ${addressValue.region}${typeLabel ? ` - ${typeLabel}` : ""}`;
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
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
              type="text"
              name="dateOfBirth"
              value={
                value?.dateOfBirth
                  ? value.dateOfBirth.split("-").reverse().join("/")
                  : ""
              }
              onChange={(e) => {
                let raw = e.target.value.replace(/[^0-9]/g, "");
                if (raw.length > 8) raw = raw.slice(0, 8);
                let display = raw;
                if (raw.length > 4)
                  display =
                    raw.slice(0, 2) +
                    "/" +
                    raw.slice(2, 4) +
                    "/" +
                    raw.slice(4);
                else if (raw.length > 2)
                  display = raw.slice(0, 2) + "/" + raw.slice(2);

                let isoValue = "";
                if (raw.length === 8) {
                  const dd = raw.slice(0, 2);
                  const mm = raw.slice(2, 4);
                  const yyyy = raw.slice(4, 8);
                  isoValue = `${yyyy}-${mm}-${dd}`;
                }

                onChange({
                  target: {
                    name: "dateOfBirth",
                    value: isoValue || display,
                    type: "text",
                  },
                });
              }}
              placeholder="DD/MM/YYYY"
              maxLength={10}
              className={fieldClassName}
            />
          </label>
        </div>

        {/* Address Section */}
        <div className="border-t border-[#f1d4e0] pt-4 mt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[#2b2730]">
                Địa chỉ
              </h3>
              <p className="text-[13px] text-[#8b7b84] mt-1">
                Địa chỉ giao hàng của bạn
              </p>
            </div>
            {(profileAddress || hasAddress) && !isAddressFormOpen && (
              <button
                type="button"
                onClick={() => setIsAddressFormOpen(true)}
                className="text-[13px] text-[#1f6ab8] hover:underline"
              >
                Chỉnh sửa
              </button>
            )}
          </div>

          {!isAddressFormOpen && !profileAddress && !hasAddress && (
            <button
              type="button"
              onClick={() => setIsAddressFormOpen(true)}
              className="h-[40px] px-4 rounded-[10px] border-0 bg-[#E996B1] text-white text-[13px] font-semibold shadow-[0_8px_16px_rgba(233,150,177,0.35)]"
            >
              + Thêm địa chỉ
            </button>
          )}

          {!isAddressFormOpen && (profileAddress || hasAddress) && (
            <div className="px-4 py-3 rounded-[10px] bg-[#f7edf2] text-[14px] text-[#2b2730]">
              {profileAddress || formatAddressDisplay()}
            </div>
          )}

          {isAddressFormOpen && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {renderDropdown(
                  "province",
                  provinceList,
                  selectedProvince?.name,
                  regionLoading || !provinceList.length,
                  regionLoading ? "Đang tải tỉnh/thành..." : "Tỉnh/Thành phố",
                )}
                {renderDropdown(
                  "district",
                  districtList,
                  selectedDistrict?.name,
                  !addressValue?.provinceCode,
                  "Quận/Huyện",
                )}
                {renderDropdown(
                  "ward",
                  wardList,
                  selectedWard?.name,
                  !addressValue?.districtCode,
                  "Phường/Xã",
                )}

                {regionError && (
                  <div className="text-[12px] text-[#b71c1c]">
                    {regionError}
                  </div>
                )}
              </div>

              <input
                type="text"
                name="addressLine"
                value={addressValue?.addressLine || ""}
                onChange={onAddressChange}
                className={fieldClassName}
                placeholder="Địa chỉ cụ thể"
              />

              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-medium text-[#3b3339]">
                  Loại địa chỉ:
                </span>
                <div className="flex items-center gap-3">
                  {addressTypeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="type"
                        value={option.value}
                        checked={addressValue?.type === option.value}
                        onChange={onAddressChange}
                        className="accent-[#E996B1]"
                      />
                      <span className="text-[14px] text-[#2b2730]">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {hasAddress && (
                <div className="px-4 py-3 rounded-[10px] bg-[#f7edf2] text-[14px] text-[#2b2730]">
                  {formatAddressDisplay()}
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => setIsAddressFormOpen(false)}
                  className="text-[14px] text-[#7e6b75] hover:underline"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
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
