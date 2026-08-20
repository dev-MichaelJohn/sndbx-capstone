import transporter from "@/configs/email.config.js";
import env from "@/configs/env.config.js";
import { Resend } from "resend";
import z from "zod";
import { logger } from "@/utils/logger.util.js";

export const SendEmailSchema = z.object({
  to: z.email(),
  options: z
    .object({
      subject: z.string(),
      text: z.string().optional(),
      html: z.string().optional(),
    })
    .refine((data) => data.text || data.html, {
      message: "Either text or html must be provided",
    }),
});
export type SendEmailType = z.infer<typeof SendEmailSchema>;

export interface IEmailService {
  sendEmail(info: SendEmailType): Promise<void>;
}

/**
 * Multi-Engine Transactional Email Service:
 * 1. Brevo HTTPS API (Primary - Free, sends to any recipient without a custom domain)
 * 2. Resend HTTPS API (Secondary)
 * 3. Nodemailer Gmail SMTP (Local/Development Fallback)
 */
class emailService implements IEmailService {
  private resendClient: Resend | null = null;
  private INITIALISM = "PIT-FES";

  constructor() {
    if (env.BREVO_API_KEY) {
      logger.info("⚡ Transactional Email Engine: Brevo HTTP API active.");
    } else if (env.RESEND_API_KEY) {
      this.resendClient = new Resend(env.RESEND_API_KEY);
      logger.info("⚡ Transactional Email Engine: Resend HTTP API initialized.");
    } else {
      logger.info("📧 Transactional Email Engine: Using Nodemailer SMTP transport.");
    }
  }

  async sendEmail(info: SendEmailType): Promise<void> {
    const validation = await SendEmailSchema.safeParseAsync(info);
    if (!validation.success) throw validation.error;

    const senderName = `${this.INITIALISM} Notification Services`;
    const senderEmail = env.GMAIL_APP_USER;

    // ──────────────────────────────────────────────────────────────────────────
    // 1. PRIMARY: Brevo HTTP API (Port 443 HTTPS - Sends to ANY recipient)
    // ──────────────────────────────────────────────────────────────────────────
    if (env.BREVO_API_KEY) {
      try {
        const payload: Record<string, any> = {
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [{ email: info.to }],
          subject: info.options.subject,
        };

        if (info.options.html) {
          payload.htmlContent = info.options.html;
        }
        if (info.options.text) {
          payload.textContent = info.options.text;
        }

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": env.BREVO_API_KEY,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          logger.info(`📧 Transactional email sent to ${info.to} via Brevo HTTP API`);
          return; // Success!
        }

        const errorData = await response.json();
        logger.warn(
          `Brevo API rejected request: ${errorData.message || response.statusText}. Trying next fallback...`,
        );
      } catch (brevoErr: any) {
        logger.warn(`Brevo HTTP API request failed: ${brevoErr.message}. Trying next fallback...`);
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. SECONDARY: Resend HTTP API (Port 443 HTTPS)
    // ──────────────────────────────────────────────────────────────────────────
    if (this.resendClient) {
      try {
        const resendFromAddress =
          env.EMAIL_FROM?.trim() || `${this.INITIALISM} <onboarding@resend.dev>`;

        const payload: any = {
          from: resendFromAddress,
          to: [info.to],
          subject: info.options.subject,
        };

        if (info.options.html) payload.html = info.options.html;
        if (info.options.text) payload.text = info.options.text;

        const { data, error } = await this.resendClient.emails.send(payload);

        if (!error && data) {
          logger.info(`📧 Transactional email sent to ${info.to} via Resend HTTP API`);
          return; // Success!
        }

        if (error) {
          logger.warn(`Resend API error: ${error.message}. Trying SMTP fallback...`);
        }
      } catch (resendError: any) {
        logger.warn(`Resend API failed: ${resendError.message}. Trying SMTP fallback...`);
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. FALLBACK: Nodemailer Gmail SMTP
    // ──────────────────────────────────────────────────────────────────────────
    try {
      await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: info.to,
        ...info.options,
      });
      logger.info(`📧 Transactional email sent to ${info.to} via Nodemailer Gmail SMTP`);
    } catch (smtpError: any) {
      logger.error("❌ All email dispatch channels failed:", smtpError);
      throw new Error(`Failed to send email: ${smtpError.message || "Service unavailable"}`);
    }
  }
}

const EmailService = new emailService();
export default EmailService;
export { emailService };
