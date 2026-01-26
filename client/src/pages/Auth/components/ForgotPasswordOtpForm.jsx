function ForgotPasswordOtpForm({
  email,
  otp,
  onOtpChange,
  onSubmit,
  onBack,
  loading,
  error,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.();
  };

  const handleOtpInvalid = (event) => {
    const input = event.target;
    if (input.validity.valueMissing) {
      input.setCustomValidity('Vui lòng nhập mã OTP.');
    } else {
      input.setCustomValidity('');
    }
  };

  const handleInput = (event) => {
    event.target.setCustomValidity('');
  };

  return (
    <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>
      

      <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
        <span className="font-medium">Mã OTP</span>
        <input
          type="text"
          name="otp"
          className="w-full h-[44px] px-[14px] rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#e996b1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]"
          placeholder="Nhập mã OTP"
          value={otp}
          onChange={(event) => onOtpChange?.(event.target.value)}
          onInvalid={handleOtpInvalid}
          onInput={handleInput}
          required
        />
      </label>

      {error && <p className="text-[13px] text-[#e53935]">{error}</p>}

      <button
        className="h-[44px] rounded-[12px] border-0 bg-[#e996b1] text-white font-semibold text-[15px] cursor-pointer shadow-[0_8px_16px_rgba(233,150,177,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
      </button>
    </form>
  );
}

export default ForgotPasswordOtpForm;
