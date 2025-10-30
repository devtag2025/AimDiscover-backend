import { transporter, emailConfig, env } from "../config/index.js";

class EmailService {
  async sendPasswordResetEmail(email, resetToken, data = {}) {
    const subject = "Reset your password";
    const html = this.passwordResetHTML(resetToken, data);
    return this.send(email, subject, html);
  }

  async sendEmailVerification(email, verificationToken, data = {}) {
    const subject = "Verify your email";
    const html = this.emailVerificationHTML(verificationToken, data);
    return this.send(email, subject, html);
  }

  async sendWelcomeEmail(email, data = {}) {
    const subject = "Welcome to Fitness Ad Campaign";
    const html = this.welcomeHTML(data);
    return this.send(email, subject, html);
  }

  async sendCampaignStatusEmail(email, data = {}) {
    const subject = `Campaign ${data.status}: ${data.campaignName}`;
    const html = this.campaignStatusHTML(data);
    return this.send(email, subject, html);
  }

  async sendPaymentConfirmationEmail(email, data = {}) {
    const subject = "Payment confirmed";
    const html = this.paymentConfirmationHTML(data);
    return this.send(email, subject, html);
  }

  async sendPaymentFailedEmail(email, data = {}) {
    const subject = "Payment failed";
    const html = this.paymentFailedHTML(data);
    return this.send(email, subject, html);
  }

  async send(to, subject, html, retries = 0) {
    const maxRetries = emailConfig?.settings?.maxRetries ?? 3;
    const retryDelayMs = emailConfig?.settings?.retryDelay ?? 5000;

    try {
      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
        to,
        subject,
        html,
      };

      const result = await transporter.sendMail(mailOptions);
      return result;
    } catch (err) {
      if (retries < maxRetries) {
        await new Promise((r) => setTimeout(r, retryDelayMs));
        return this.send(to, subject, html, retries + 1);
      }
      throw err;
    }
  }

  passwordResetHTML(resetToken, data = {}) {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const name = data.userName || "there";
    return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1f2937;color:#fff;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">Reset your password</h1>
  </div>
  <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px">
    <p style="color:#111827">Hi ${name},</p>
    <p style="color:#374151">Click the button below to reset your password.</p>
    <p style="text-align:center;margin:20px 0">
      <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Reset Password</a>
    </p>
    <p style="font-size:13px;color:#6b7280">This link expires in 1 hour.</p>
  </div>
</div>`;
  }

  emailVerificationHTML(verificationToken, data = {}) {
    const url = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(verificationToken)}`;
    const name = data.userName || "there";
    return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#2563eb;color:#fff;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">Verify your email</h1>
  </div>
  <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px">
    <p style="color:#111827">Hi ${name},</p>
    <p style="color:#374151">Click the button below to verify your email.</p>
    <p style="text-align:center;margin:20px 0">
      <a href="${url}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Verify Email</a>
    </p>
    <p style="font-size:13px;color:#6b7280">This link expires in 24 hours.</p>
  </div>
</div>`;
  }

  welcomeHTML(data = {}) {
    const name = data.userName || "there";
    const dashboardUrl = `${env.CLIENT_URL}/dashboard`;
    return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#111827;color:#fff;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">Welcome to Fitness Ad Campaign</h1>
  </div>
  <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px">
    <p style="color:#111827">Hi ${name},</p>
    <p style="color:#374151">Your account is ready. You can now create and manage fitness advertising campaigns.</p>
    <p style="text-align:center;margin:20px 0">
      <a href="${dashboardUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Go to Dashboard</a>
    </p>
  </div>
</div>`;
  }

  campaignStatusHTML(data = {}) {
    const name = data.userName || "there";
    const campaign = data.campaignName || "Your campaign";
    const status = data.status || "updated";
    return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#065f46;color:#fff;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">Campaign ${status}</h1>
  </div>
  <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px">
    <p style="color:#111827">Hi ${name},</p>
    <p style="color:#374151">Your campaign "${campaign}" status has been updated to: <strong>${status}</strong></p>
    <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:12px;border-radius:6px;margin:16px 0">
      <p style="margin:0;color:#065f46">Campaign: ${campaign}</p>
      <p style="margin:0;color:#065f46">Status: ${status}</p>
    </div>
  </div>
</div>`;
  }

  paymentConfirmationHTML(data = {}) {
    const name = data.userName || "there";
    const plan = data.planName || "subscription";
    const amount = data.amount || "—";
    const reference = data.reference || "—";
    return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#0f766e;color:#fff;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">Payment confirmed</h1>
  </div>
  <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px">
    <p style="color:#111827">Hi ${name},</p>
    <p style="color:#374151">Payment received for ${plan}.</p>
    <div style="background:#fff;border-left:4px solid #0f766e;padding:12px;border-radius:6px;margin:16px 0">
      <p style="margin:0"><strong>Amount:</strong> ${amount}</p>
      <p style="margin:0"><strong>Reference:</strong> ${reference}</p>
    </div>
  </div>
</div>`;
  }

  paymentFailedHTML(data = {}) {
    const name = data.userName || "there";
    const plan = data.planName || "subscription";
    const reason = data.reason || "Unknown error";
    const retryUrl = `${env.CLIENT_URL}/billing`;
    return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#991b1b;color:#fff;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">Payment failed</h1>
  </div>
  <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px">
    <p style="color:#111827">Hi ${name},</p>
    <p style="color:#374151">Payment failed for ${plan}.</p>
    <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:12px;border-radius:6px;margin:16px 0">
      <p style="margin:0"><strong>Reason:</strong> ${reason}</p>
    </div>
    <p style="text-align:center;margin:20px 0">
      <a href="${retryUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Retry Payment</a>
    </p>
  </div>
</div>`;
  }
}

export const emailService = new EmailService();
export const sendEmail = (options) => emailService.send(options.to, options.subject, options.html || options.text);