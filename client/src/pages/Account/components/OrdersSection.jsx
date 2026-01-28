export default function OrdersSection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[18px] font-semibold text-[#2b2730]">Đơn Mua</h2>
        <p className="text-[13px] text-[#8b7b84] mt-1">
          Danh sách đơn mua sẽ được hiển thị khi backend cung cấp API.
        </p>
      </div>
      <div className="border border-dashed border-[#f1d4e0] rounded-[12px] p-6 text-center text-[14px] text-[#8b7b84]">
        Chưa có dữ liệu đơn mua.
      </div>
    </div>
  );
}
