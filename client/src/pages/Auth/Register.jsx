import { useEffect, useState } from 'react';
import Footer from '../../components/layouts/Footer';

const isRegisterPath = () => window.location.pathname === '/register';
const API_BASE = window.__API_BASE__ || 'http://localhost:5000';

function Register() {
  const [isOpen, setIsOpen] = useState(isRegisterPath());
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setIsOpen(isRegisterPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const hiddenElements = [];
    const targets = document.querySelectorAll(
      'header, footer, .fixed.inset-0.pointer-events-none.overflow-hidden'
    );
    targets.forEach((element) => {
      if (!element.dataset.loginHidden) {
        element.dataset.loginHidden = 'true';
        element.classList.add('hidden');
        hiddenElements.push(element);
      }
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      hiddenElements.forEach((element) => {
        if (element.dataset.loginHidden === 'true') {
          delete element.dataset.loginHidden;
          element.classList.remove('hidden');
        }
      });
    };
  }, [isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginLink = (event) => {
    event.preventDefault();
    if (window.location.pathname !== '/login') {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    };

    try {
      await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-stretch justify-start bg-[#e996b1] z-[9999] px-6 py-8 text-[#2f2730] font-['Inter','Segoe_UI',system-ui,sans-serif] overflow-y-auto min-h-screen">
      <div className="w-full max-w-[1240px] flex items-center justify-between gap-9 px-6 mx-auto mt-[clamp(12px,7.225vh,10.8375vh)] mb-10 max-[480px]:flex-col max-[480px]:items-center max-[480px]:px-0">
        <div
          className="flex-1 flex flex-col items-center gap-0 select-none -translate-x-[10%] -translate-y-[25%] scale-[1.2] origin-center max-[480px]:-translate-y-[10%] max-[480px]:scale-[1.05]"
          aria-hidden="true"
        >
          <img
            className="w-[406px] h-[406px] block object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
            src="/LogoLogin.png"
            alt=""
          />
          <img
            className="w-[420px] max-w-full h-auto mt-[-80px] select-none max-[480px]:w-[240px]"
            src="/nura-logo-white.svg"
            alt="NURA MOM & BABY MILK"
          />
        </div>

        <div className="w-[420px] bg-white rounded-[16px] border border-[#f0dbe4] shadow-[0_18px_50px_rgba(41,10,24,0.08)] pt-8 px-8 pb-6 mt-[-5%] max-[480px]:w-full max-[480px]:pt-[28px] max-[480px]:px-[22px] max-[480px]:pb-[22px] max-[480px]:mt-0">
          <h1 className="text-center text-[26px] m-0 text-[#2b2730]">Đăng ký tài khoản</h1>
          <p className="text-center mt-2 mb-7 text-[#8b7b84] text-[14px]">
            Tạo tài khoản để nhận ưu đãi độc quyền
          </p>

          <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
              <span className="font-medium">Họ và tên</span>
              <span className="relative flex items-center">
                <span className="absolute left-[14px] text-[#d1a1b7]">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  name="fullName"
                  className="w-full h-[44px] pl-[42px] pr-[44px] rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#e996b1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]"
                  placeholder="Nhập tên của bạn"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </span>
            </label>

            <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
              <span className="font-medium">Email</span>
              <span className="relative flex items-center">
                <span className="absolute left-[14px] text-[#d1a1b7]">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  name="email"
                  className="w-full h-[44px] pl-[42px] pr-[44px] rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#e996b1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]"
                  placeholder="Nhập email của bạn"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </span>
            </label>

            <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
              <span className="font-medium">Mật khẩu</span>
              <span className="relative flex items-center">
                <span className="absolute left-[14px] text-[#d1a1b7]">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="w-full h-[44px] pl-[42px] pr-[44px] rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#e996b1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]"
                  placeholder="Nhập mật khẩu"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  className="absolute right-[12px] bg-transparent border-0 text-[#c78ea6] cursor-pointer p-1"
                  type="button"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <EyeIcon isOpen={showPassword} />
                </button>
              </span>
            </label>

            <label className="flex flex-col gap-2 text-[14px] text-[#3b3339]">
              <span className="font-medium">Xác nhận mật khẩu</span>
              <span className="relative flex items-center">
                <span className="absolute left-[14px] text-[#d1a1b7]">
                  <LockIcon />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="w-full h-[44px] pl-[42px] pr-[44px] rounded-[10px] border-[1.5px] border-[#f1d4e0] bg-white text-[14px] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#e996b1] focus:shadow-[0_0_0_3px_rgba(233,150,177,0.15)]"
                  placeholder="Xác nhận mật khẩu"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  className="absolute right-[12px] bg-transparent border-0 text-[#c78ea6] cursor-pointer p-1"
                  type="button"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <EyeIcon isOpen={showConfirmPassword} />
                </button>
              </span>
            </label>

            <button
              className="h-[44px] rounded-[12px] border-0 bg-[#e996b1] text-white font-semibold text-[15px] cursor-pointer shadow-[0_8px_16px_rgba(233,150,177,0.35)]"
              type="submit"
            >
              Đăng ký
            </button>
          </form>

          <div className="mt-5 text-center text-[13px] text-[#7e6b75]">
            Đã có tài khoản?{' '}
            <a
              className="text-[#e996b1] no-underline font-semibold hover:underline"
              href="/login"
              onClick={handleLoginLink}
            >
              Đăng nhập
            </a>
          </div>
        </div>
      </div>

      <div className="w-[calc(100%+48px)] bg-white -mx-6 -mb-8 mt-auto pt-[3.25vh] [&_footer]:!block [&_footer]:!bg-white [&_footer]:text-[#2f2730] [&_footer.bg-gray-900]:!bg-white [&_footer_.bg-gray-950]:!bg-white [&_footer_.text-gray-300]:!text-[#5f4c55] [&_footer_.text-gray-400]:!text-[#5f4c55] [&_footer_.text-gray-500]:!text-[#5f4c55] [&_footer_.text-white]:!text-[#2f2730] [&_footer_a]:text-[#2f2730] [&_footer_a:hover]:text-[#2f2730] [&_footer_.border-gray-800]:!border-[#e8dfe3] [&_footer_.border-gray-700]:!border-[#e8dfe3] [&_footer_input]:!bg-white [&_footer_input]:!text-[#2f2730] [&_footer_input]:!border-[#e8dfe3] [&_footer_button]:!bg-[#e996b1] [&_footer_button]:!text-white">
        <Footer />
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-current">
      <path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5zm0 2c-4.2 0-8 2.2-8 5v3h16v-3c0-2.8-3.8-5-8-5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-current">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-current">
      <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-7-2a2 2 0 0 1 4 0v2h-4z" />
    </svg>
  );
}

function EyeIcon({ isOpen }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[18px] h-[18px] fill-current">
      {isOpen ? (
        <path d="M12 4.5c-5.6 0-10.3 3.5-12 7.5 1.7 4 6.4 7.5 12 7.5s10.3-3.5 12-7.5c-1.7-4-6.4-7.5-12-7.5zm0 12.2a4.7 4.7 0 1 1 0-9.4 4.7 4.7 0 0 1 0 9.4z" />
      ) : (
        <path d="M2.3 3.7 1 5l3.3 3.3C2.6 9.7 1.4 11.6 1 12c1.7 4 6.4 7.5 12 7.5 2 0 3.9-.4 5.6-1.2l3.1 3.1 1.3-1.3-20-20zm9.7 12.9a4.7 4.7 0 0 1-4.7-4.7c0-.6.1-1.1.3-1.6l6 6c-.5.2-1 .3-1.6.3zm2.9-1 2.9 2.9c-1.7.8-3.6 1.2-5.8 1.2-4.4 0-8.3-2.6-9.9-6.2.8-1.7 2-3.1 3.5-4.2l2.1 2.1a4.7 4.7 0 0 0 7.2 6.2zM12 6.3c4.4 0 8.3 2.6 9.9 6.2-.7 1.4-1.6 2.6-2.7 3.5l-1.8-1.8a4.7 4.7 0 0 0-5.6-5.6L9 6.7c1-.3 2-.4 3-.4z" />
      )}
    </svg>
  );
}

export default Register;
