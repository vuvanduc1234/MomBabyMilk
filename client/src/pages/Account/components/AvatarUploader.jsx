export default function AvatarUploader({ previewUrl, onChange }) {
  return (
    <div className="w-full max-w-[260px] border border-[#f1d4e0] rounded-[14px] p-4 flex flex-col items-center gap-3 bg-white">
      <div className="w-[120px] h-[120px] rounded-full border border-[#f1d4e0] bg-[#fff5f9] overflow-hidden flex items-center justify-center text-[#c78ea6] text-[24px] font-semibold">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span>Ảnh</span>
        )}
      </div>
      <label className="w-full">
        <input
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={onChange}
        />
        <span className="block w-full text-center px-3 py-2 rounded-[10px] border border-[#f1d4e0] text-[13px] font-semibold text-[#2b2730] cursor-pointer hover:bg-[#fde7f0] transition">
          Chọn ảnh
        </span>
      </label>
      <p className="text-[12px] text-[#8b7b84] text-center">
        Dung lượng file tối đa 1MB. Định dạng .JPEG, .PNG
      </p>
    </div>
  );
}
