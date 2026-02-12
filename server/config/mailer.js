const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (to, code, fullname) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Mom & Baby Milk Shop <onboarding@resend.dev>",
      to: [to],
      subject: "Mã xác nhận đăng ký tài khoản",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
          <h2>Xin chào ${fullname}!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Mom & Baby Milk Shop</strong>. Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất quá trình đăng ký:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #ff69b4;">
            ${code}
          </p>
          <p>Mã xác nhận có hiệu lực trong <strong>10 phút</strong>.</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Chúc mẹ và bé luôn khỏe mạnh! 💕</p>
        </div>
      `,
    });

    if (error) {
      console.error(`Lỗi gửi email:`, error);
      throw new Error("Không thể gửi email xác nhận.");
    }

    console.log(`Email xác nhận đã gửi tới ${to}`, data);
  } catch (error) {
    console.error(`Lỗi gửi email:`, error);
    throw new Error("Không thể gửi email xác nhận.");
  }
};

const sendResetPassword = async (to, code) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Mom & Baby Milk Shop <onboarding@resend.dev>",
      to: [to],
      subject: "Yêu cầu đặt lại mật khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
          <p>Bạn đã yêu cầu đặt lại mật khẩu tài khoản tại <strong>Mom & Baby Milk Shop</strong>.</p>
          <p>Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất quá trình đặt lại mật khẩu:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #ff69b4;">
            ${code}
          </p>
          <p>Mã này có hiệu lực trong <strong>15 phút</strong>.</p>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">Chúc mẹ và bé luôn khỏe mạnh! 💕</p>
        </div>
      `,
    });

    if (error) {
      console.error(`Lỗi gửi email:`, error);
      throw new Error("Không thể gửi email đặt lại mật khẩu.");
    }

    console.log(`Email đặt lại mật khẩu đã gửi tới ${to}`, data);
  } catch (error) {
    console.error(`Lỗi gửi email:`, error);
    throw new Error("Không thể gửi email đặt lại mật khẩu.");
  }
};

module.exports = { sendVerificationEmail, sendResetPassword };
