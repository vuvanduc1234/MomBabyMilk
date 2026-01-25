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
    const className = 'login-page-active';
    if (isOpen) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => {
      document.body.classList.remove(className);
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
    <div className="login-page">
      <div className="login-shell">
        <div className="login-brand" aria-hidden="true">
          <img className="login-logo" src="/LogoLogin.png" alt="" />
          <img
            className="login-brand-wordmark"
            src="/nura-logo-white.svg"
            alt="NURA MOM & BABY MILK"
          />
        </div>

        <div className="login-card">
          <h1 className="login-title">Đăng ký tài khoản</h1>
          <p className="login-subtitle">Tạo tài khoản để nhận ưu đãi độc quyền</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field-label">Họ và tên</span>
              <span className="field-control">
                <span className="field-icon">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  name="fullName"
                  className="field-input"
                  placeholder="Nhập tên của bạn"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">Email</span>
              <span className="field-control">
                <span className="field-icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  name="email"
                  className="field-input"
                  placeholder="Nhập email của bạn"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">Mật khẩu</span>
              <span className="field-control">
                <span className="field-icon">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="field-input"
                  placeholder="Nhập mật khẩu"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  className="field-toggle"
                  type="button"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <EyeIcon isOpen={showPassword} />
                </button>
              </span>
            </label>

            <label className="field">
              <span className="field-label">Xác nhận mật khẩu</span>
              <span className="field-control">
                <span className="field-icon">
                  <LockIcon />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="field-input"
                  placeholder="Xác nhận mật khẩu"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  className="field-toggle"
                  type="button"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <EyeIcon isOpen={showConfirmPassword} />
                </button>
              </span>
            </label>

            <button className="login-button" type="submit">
              Đăng ký
            </button>
          </form>

          <div className="login-footer">
            Đã có tài khoản?{' '}
            <a className="login-link" href="/login" onClick={handleLoginLink}>
              Đăng nhập
            </a>
          </div>
        </div>
      </div>

      <div className="login-footer-section">
        <Footer />
      </div>

      <style>{`
        body.login-page-active {
          overflow: hidden;
        }

        body.login-page-active header,
        body.login-page-active footer {
          display: none !important;
        }

        body.login-page-active .fixed.inset-0.pointer-events-none.overflow-hidden {
          display: none !important;
        }

        body.login-page-active .login-trigger {
          display: none;
        }

        .login-page {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: flex-start;
          background: #e996b1;
          z-index: 9999;
          padding: 32px 24px;
          color: #2f2730;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          overflow-y: auto;
          min-height: 100vh;
        }

        .login-shell {
          width: min(1240px, 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 36px;
          padding: 0 24px;
          margin: clamp(12px, 7.225vh, 10.8375vh) auto 40px;
        }

        .login-footer-section {
          width: 100%;
          background: #ffffff;
          margin: 0 -24px -32px;
          width: calc(100% + 48px);
          margin-top: auto;
          padding-top: 3.25vh;
        }

        .login-page .login-footer-section footer {
          display: block !important;
          background: #ffffff !important;
          color: #2f2730;
        }

        .login-page .login-footer-section footer.bg-gray-900 {
          background: #ffffff !important;
        }

        .login-page .login-footer-section footer .bg-gray-950 {
          background: #ffffff !important;
        }

        .login-page .login-footer-section footer .text-gray-300,
        .login-page .login-footer-section footer .text-gray-400,
        .login-page .login-footer-section footer .text-gray-500 {
          color: #5f4c55 !important;
        }

        .login-page .login-footer-section footer .text-white {
          color: #2f2730 !important;
        }

        .login-page .login-footer-section footer a {
          color: #2f2730;
        }

        .login-page .login-footer-section footer a:hover {
          color: #2f2730;
        }

        .login-page .login-footer-section footer .border-gray-800,
        .login-page .login-footer-section footer .border-gray-700 {
          border-color: #e8dfe3 !important;
        }

        .login-page .login-footer-section footer input {
          background: #ffffff !important;
          color: #2f2730 !important;
          border-color: #e8dfe3 !important;
        }

        .login-page .login-footer-section footer button {
          background: #e996b1 !important;
          color: #ffffff !important;
        }

        .login-brand {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          user-select: none;
          transform: translate(-10%, -25%) scale(1.2);
          transform-origin: center;
        }

        .login-logo {
          width: 406px;
          height: 406px;
          display: block;
          object-fit: contain;
          filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.18));
        }

        .login-brand-wordmark {
          width: 420px;
          max-width: 100%;
          height: auto;
          margin-top: -80px;
          user-select: none;
        }

        .login-card {
          width: 420px;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #f0dbe4;
          box-shadow: 0 18px 50px rgba(41, 10, 24, 0.08);
          padding: 32px 32px 24px;
          margin-top: -5%;
        }

        .login-title {
          text-align: center;
          font-size: 26px;
          margin: 0;
          color: #2b2730;
        }

        .login-subtitle {
          text-align: center;
          margin: 8px 0 28px;
          color: #8b7b84;
          font-size: 14px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
          color: #3b3339;
        }

        .field-label {
          font-weight: 500;
        }

        .field-control {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          color: #d1a1b7;
        }

        .field-icon svg,
        .field-toggle svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }

        .field-input {
          width: 100%;
          height: 44px;
          padding: 0 44px 0 42px;
          border-radius: 10px;
          border: 1.5px solid #f1d4e0;
          background: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field-input:focus {
          border-color: #e996b1;
          box-shadow: 0 0 0 3px rgba(233, 150, 177, 0.15);
        }

        .field-toggle {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #c78ea6;
          cursor: pointer;
          padding: 4px;
        }

        .login-button {
          height: 44px;
          border-radius: 12px;
          border: none;
          background: #e996b1;
          color: #ffffff;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 8px 16px rgba(233, 150, 177, 0.35);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-toast-overlay {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: min(520px, 90%);
          display: flex;
          justify-content: center;
          pointer-events: none;
          z-index: 2;
        }

        .login-toast {
          width: 100%;
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1px;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.24);
          backdrop-filter: blur(10px);
          animation: fadeIn 0.25s ease-out;
        }

        .login-toast.success {
          background: #4caf50;
          color: #1b5e20;
        }

        .login-toast.error {
          background: #e53935;
          color: #ffffff;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 13px;
          color: #7e6b75;
        }

        .login-link {
          color: #e996b1;
          text-decoration: none;
          font-weight: 600;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-shell {
            flex-direction: column;
            align-items: center;
            padding: 0;
          }

          .login-brand {
            transform: translate(-10%, -10%) scale(1.05);
          }

          .login-brand-wordmark {
            width: 240px;
          }

          .login-card {
            width: 100%;
            padding: 28px 22px 22px;
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5zm0 2c-4.2 0-8 2.2-8 5v3h16v-3c0-2.8-3.8-5-8-5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-7-2a2 2 0 0 1 4 0v2h-4z" />
    </svg>
  );
}

function EyeIcon({ isOpen }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {isOpen ? (
        <path d="M12 4.5c-5.6 0-10.3 3.5-12 7.5 1.7 4 6.4 7.5 12 7.5s10.3-3.5 12-7.5c-1.7-4-6.4-7.5-12-7.5zm0 12.2a4.7 4.7 0 1 1 0-9.4 4.7 4.7 0 0 1 0 9.4z" />
      ) : (
        <path d="M2.3 3.7 1 5l3.3 3.3C2.6 9.7 1.4 11.6 1 12c1.7 4 6.4 7.5 12 7.5 2 0 3.9-.4 5.6-1.2l3.1 3.1 1.3-1.3-20-20zm9.7 12.9a4.7 4.7 0 0 1-4.7-4.7c0-.6.1-1.1.3-1.6l6 6c-.5.2-1 .3-1.6.3zm2.9-1 2.9 2.9c-1.7.8-3.6 1.2-5.8 1.2-4.4 0-8.3-2.6-9.9-6.2.8-1.7 2-3.1 3.5-4.2l2.1 2.1a4.7 4.7 0 0 0 7.2 6.2zM12 6.3c4.4 0 8.3 2.6 9.9 6.2-.7 1.4-1.6 2.6-2.7 3.5l-1.8-1.8a4.7 4.7 0 0 0-5.6-5.6L9 6.7c1-.3 2-.4 3-.4z" />
      )}
    </svg>
  );
}

export default Register;
