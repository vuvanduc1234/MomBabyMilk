import { useEffect, useMemo, useRef, useState } from "react";

const fieldClassName =
  "w-full h-[44px] px-3 rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#E996B1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]";

const addressTypeOptions = [
  { value: "home", label: "Nhà Riêng" },
  { value: "office", label: "Văn Phòng" },
];

const isDraftComplete = (draft) =>
  Boolean(
    draft?.fullName &&
      draft?.phone &&
      draft?.provinceCode &&
      draft?.districtCode &&
      draft?.wardCode &&
      draft?.addressLine &&
      draft?.type
  );

export default function AddressSection({
  value,
  onChange,
  onSubmit,
  status,
  loading,
  addresses,
  isFormOpen,
  onOpenForm,
  onCloseForm,
  onEdit,
  onDelete,
  onSetDefault,
  limit,
  phoneError,
}) {
  const [provinceList, setProvinceList] = useState([]);
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState("");
  const [openDropdown, setOpenDropdown] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadRegions = async () => {
      setRegionLoading(true);
      setRegionError("");
      try {
        const response = await fetch(
          "https://provinces.open-api.vn/api/?depth=3"
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
            error?.message || "Không thể tải danh sách tỉnh thành."
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
      provinceList.find((item) => `${item.code}` === `${value?.provinceCode}`),
    [provinceList, value?.provinceCode]
  );

  const districtList = selectedProvince?.districts || [];
  const selectedDistrict = districtList.find(
    (item) => `${item.code}` === `${value?.districtCode}`
  );
  const wardList = selectedDistrict?.wards || [];
  const selectedWard = wardList.find(
    (item) => `${item.code}` === `${value?.wardCode}`
  );

  const emitChange = (name, nextValue) => {
    onChange({
      target: {
        name,
        value: nextValue,
        type: "text",
      },
    });
  };

  const syncRegionText = (province, district, ward) => {
    if (!province || !district || !ward) {
      emitChange("region", "");
      return;
    }
    emitChange("region", `${ward.name}, ${district.name}, ${province.name}`);
  };

  const handleProvinceSelect = (event) => {
    const nextCode = event.target.value;
    emitChange("provinceCode", nextCode);
    emitChange("districtCode", "");
    emitChange("wardCode", "");
    syncRegionText(null, null, null);
  };

  const handleDistrictSelect = (event) => {
    const nextCode = event.target.value;
    emitChange("districtCode", nextCode);
    emitChange("wardCode", "");
    const nextProvince = provinceList.find(
      (item) => `${item.code}` === `${value?.provinceCode}`
    );
    const nextDistrict = nextProvince?.districts?.find(
      (item) => `${item.code}` === `${nextCode}`
    );
    syncRegionText(nextProvince, nextDistrict, null);
  };

  const handleWardSelect = (event) => {
    const nextCode = event.target.value;
    emitChange("wardCode", nextCode);
    const nextProvince = provinceList.find(
      (item) => `${item.code}` === `${value?.provinceCode}`
    );
    const nextDistrict = nextProvince?.districts?.find(
      (item) => `${item.code}` === `${value?.districtCode}`
    );
    const nextWard = nextDistrict?.wards?.find(
      (item) => `${item.code}` === `${nextCode}`
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
    placeholder
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

  return (
    <div ref={containerRef} className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 border-b border-[#f1d4e0] pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-[#2b2730]">
              Địa chỉ của tôi
            </h2>
            <p className="text-[13px] text-[#8b7b84] mt-1">
              Lưu tối đa {limit} địa chỉ để giao hàng nhanh hơn
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenForm}
            className="h-[40px] px-4 rounded-[10px] border-0 bg-[#E996B1] text-white text-[13px] font-semibold shadow-[0_8px_16px_rgba(233,150,177,0.35)]"
          >
            + Thêm địa chỉ mới
          </button>
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
      </div>

      {!isFormOpen && (
        <div className="flex flex-col gap-4">
          {addresses?.length ? (
            addresses.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 pb-4 border-b border-[#f1d4e0] last:border-b-0"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-[15px] text-[#2b2730]">
                      <span className="font-semibold">{item.fullName}</span>
                      <span className="text-[#b0a0a8]">|</span>
                      <span className="text-[#6c5c64]">{item.phone}</span>
                    </div>
                    <div className="text-[13px] text-[#6c5c64] mt-1">
                      {item.addressLine}
                    </div>
                    <div className="text-[13px] text-[#6c5c64]">
                      {item.region}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="text-[#1f6ab8] hover:underline"
                    >
                      Cập nhật
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="text-[#1f6ab8] hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {item.isDefault && (
                    <span className="px-2 py-[2px] text-[11px] font-semibold text-[#b2547a] border border-[#f1d4e0] rounded">
                      Mặc định
                    </span>
                  )}
                  {!item.isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefault(item.id)}
                      className="px-3 py-[6px] text-[12px] rounded-[8px] border border-[#d7d1d5] text-[#2b2730] hover:bg-[#f7edf2]"
                    >
                      Thiết lập mặc định
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-[#f1d4e0] rounded-[12px] p-6 text-center text-[14px] text-[#8b7b84]">
              Chưa có địa chỉ nào. Hãy thêm địa chỉ mới.
            </div>
          )}
        </div>
      )}

      {isFormOpen && (
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div>
            <h3 className="text-[18px] font-semibold text-[#2b2730]">
              Địa chỉ mới (dùng thông tin trước sáp nhập)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="min-h-[18px] text-[13px] text-transparent">
                placeholder
              </span>
              <input
                type="text"
                name="fullName"
                value={value?.fullName || ""}
                onChange={onChange}
                className={fieldClassName}
                placeholder="Họ và tên"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span
                className="min-h-[18px] text-[13px] text-[#b71c1c]"
                aria-live="polite"
              >
                {phoneError || ""}
              </span>
              <input
                type="text"
                name="phone"
                value={value?.phone || ""}
                onChange={onChange}
                className={fieldClassName}
                placeholder="Số điện thoại"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {renderDropdown(
              "province",
              provinceList,
              selectedProvince?.name,
              regionLoading || !provinceList.length,
              regionLoading ? "Đang tải tỉnh/thành..." : "Tỉnh/Thành phố"
            )}
            {renderDropdown(
              "district",
              districtList,
              selectedDistrict?.name,
              !value?.provinceCode,
              "Quận/Huyện"
            )}
            {renderDropdown(
              "ward",
              wardList,
              selectedWard?.name,
              !value?.districtCode,
              "Phường/Xã"
            )}

            {regionError && (
              <div className="text-[12px] text-[#b71c1c]">{regionError}</div>
            )}
          </div>

          <input
            type="text"
            name="addressLine"
            value={value?.addressLine || ""}
            onChange={onChange}
            className={fieldClassName}
            placeholder="Địa chỉ cụ thể"
          />

          <div className="flex flex-col gap-2">
            <span className="text-[14px] font-medium text-[#3b3339]">
              Loại địa chỉ:
            </span>
            <div className="flex items-center gap-3">
              {addressTypeOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={value?.type === option.value}
                    onChange={onChange}
                    className="accent-[#E996B1]"
                  />
                  <span className="text-[14px] text-[#2b2730]">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <label
            className={`flex items-center gap-3 px-3 py-3 rounded-[10px] border text-[14px] ${
              isDraftComplete(value)
                ? "border-[#f1d4e0] text-[#2b2730] cursor-pointer"
                : "border-[#f4e7ee] text-[#b0a0a8] cursor-not-allowed"
            }`}
          >
            <input
              type="checkbox"
              name="isDefault"
              checked={!!value?.isDefault}
              onChange={onChange}
              disabled={!isDraftComplete(value)}
              className="accent-[#E996B1]"
            />
            Đặt làm địa chỉ mặc định
          </label>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onCloseForm}
              className="text-[14px] text-[#7e6b75] hover:underline"
            >
              Trở lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-[44px] px-6 rounded-[12px] border-0 bg-[#E996B1] text-white font-semibold text-[15px] cursor-pointer shadow-[0_8px_16px_rgba(233,150,177,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : "Hoàn thành"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
