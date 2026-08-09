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
 * High-performance Email Service using Resend HTTP API with automatic
 * Nodemailer SMTP fallback for backward compatibility.
 */
class emailService implements IEmailService {
  private resendClient: Resend | null = null;
  private INITIALISM = "PIT-FES";

  constructor() {
    if (env.RESEND_API_KEY) {
      this.resendClient = new Resend(env.RESEND_API_KEY);
      logger.info("⚡ Transactional Email Engine: Resend HTTP API initialized.");
    } else {
      logger.info("📧 Transactional Email Engine: Using Nodemailer SMTP transport.");
    }
  }

  /**
   * Sends an email via Resend HTTP API or Nodemailer SMTP fallback.
   */
  async sendEmail(info: SendEmailType): Promise<void> {
    const validation = await SendEmailSchema.safeParseAsync(info);
    if (!validation.success) throw validation.error;

    const smtpFromAddress = `"${this.INITIALISM} Notification Services" <${env.GMAIL_APP_USER}>`;

    // 1. Resend HTTP API Fast Path (~150ms)
    if (this.resendClient) {
      try {
        // Resend testing sandbox requires from: 'onboarding@resend.dev' unless a custom domain is verified
        const resendFromAddress =
          env.EMAIL_FROM?.trim() || `${this.INITIALISM} <onboarding@resend.dev>`;

        const payload: any = {
          from: resendFromAddress,
          to: [info.to],
          subject: info.options.subject,
        };

        if (info.options.html) {
          payload.html = info.options.html;
        }
        if (info.options.text) {
          payload.text = info.options.text;
        }

        await this.resendClient.emails.send(payload);
        return;
      } catch (resendError) {
        logger.warn("Resend HTTP API send failed. Falling back to SMTP transport...", resendError);
      }
    }

    // 2. Nodemailer SMTP Fallback
    await transporter.sendMail({
      from: smtpFromAddress,
      to: info.to,
      ...info.options,
    });
  }
}

const EmailService = new emailService();
export default EmailService;
export { emailService };
