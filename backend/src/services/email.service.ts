import transporter from "@/configs/email.config.js";
import env from "@/configs/env.config.js";
import z from "zod";

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

/** Public surface of {@link emailService}, for dependency injection/mocking. */
export interface IEmailService {
  sendEmail(info: SendEmailType): Promise<void>;
}

/**
 * Thin wrapper around the configured Nodemailer transporter for sending
 * outbound emails (e.g. OTP codes, notifications) under a shared sender name.
 */
class emailService implements IEmailService {
  constructor(private mailer = transporter) {}

  /** Sender name shown before the app's email address in outgoing mail. */
  private INITIALISM = "PIT-FES";

  /**
   * Sends an email via the configured transporter.
   *
   * @param info.to - recipient email address
   * @param info.options.subject - email subject line
   * @param info.options.text - plaintext body (required if `html` is omitted)
   * @param info.options.html - HTML body (required if `text` is omitted)
   * @throws {ZodError} if `info` fails schema validation, including when
   *   both `text` and `html` are omitted
   */
  async sendEmail(info: SendEmailType): Promise<void> {
    const validation = await SendEmailSchema.safeParseAsync(info);
    if (!validation.success) throw validation.error;

    await this.mailer.sendMail({
      from: `"${this.INITIALISM} Notification Services" ${env.GMAIL_APP_USER}`,
      to: info.to,
      ...info.options,
    });
  }
}

const EmailService = new emailService();
export default EmailService;
export { emailService };
