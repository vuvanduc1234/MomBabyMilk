function ForgotPasswordSuccess({ onLogin }) {
  return (
    <div className="flex flex-col gap-4 text-center">
      <div className="text-[15px] text-[#2f6f3a] font-semibold">
        Đổi mật khẩu thành công.
      </div>
      <p className="text-[13px] text-[#6b5b63]">
        Bạn sẽ được chuyển về trang đăng nhập trong giây lát.
      </p>
      <button
        type="button"
        onClick={onLogin}
        className="h-[44px] rounded-[12px] border-0 bg-[#e996b1] text-white font-semibold text-[15px] cursor-pointer shadow-[0_8px_16px_rgba(233,150,177,0.35)]"
      >
        Về đăng nhập
      </button>
    </div>
  );
}

export default ForgotPasswordSuccess;
