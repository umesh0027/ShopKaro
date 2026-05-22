const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"ShopKaro Store" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };
  await transporter.sendMail(mailOptions);
};

// Email Templates
const emailTemplates = {
  otpVerification: (name, otp) => `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">ShopKaro</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Your Shopping Destination</p>
      </div>
      <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Hello, ${name}! 👋</h2>
        <p style="color: #666; line-height: 1.6;">Your OTP for email verification is:</p>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 14px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">© 2024 ShopKaro. All rights reserved.</p>
      </div>
    </div>
  `,

  orderConfirmation: (name, order) => `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Order Confirmed! 🎉</h1>
      </div>
      <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #333;">Hi ${name},</h2>
        <p style="color: #666;">Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
          ${order.items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
              <span>${item.name} x ${item.quantity}</span>
              <span>₹${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          `).join('')}
          <div style="padding-top: 10px;">
            <strong>Total: ₹${order.totalPrice.toLocaleString()}</strong>
          </div>
        </div>
        <p style="color: #666;">Estimated delivery: <strong>${new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
      </div>
    </div>
  `,

  orderStatusUpdate: (name, orderNumber, status, trackingNumber) => `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Order Update 📦</h1>
      </div>
      <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #333;">Hi ${name},</h2>
        <p style="color: #666;">Your order <strong>#${orderNumber}</strong> status has been updated to:</p>
        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 20px; color: #2e7d32; font-weight: bold;">${status.toUpperCase()}</span>
        </div>
        ${trackingNumber ? `<p style="color: #666;">Tracking Number: <strong>${trackingNumber}</strong></p>` : ''}
      </div>
    </div>
  `,

  contactReply: (name, reply) => `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Response from ShopKaro</h1>
      </div>
      <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #333;">Hi ${name},</h2>
        <p style="color: #666;">Thank you for reaching out! Here's our response:</p>
        <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="color: #333; margin: 0;">${reply}</p>
        </div>
      </div>
    </div>
  `
};

module.exports = { sendEmail, emailTemplates };
