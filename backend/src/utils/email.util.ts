const INSTITUTE_NAME = "Palompon Institute of Technology";
const SYSTEM_NAME = "Faculty Evaluation System";
const INITIALISM = "PIT-FES";

export interface UserWelcomeEmailData {
  recipientName: string;
  email: string;
  generatedPassword?: string;
  loginUrl?: string;
}

export interface UserUpdateEmailData {
  recipientName: string;
  updatedFields: {
    label: string;
    oldValue: string;
    newValue: string;
  }[];
  updatedAt: Date;
  /** If email was changed, also send to the old address. */
  oldEmail?: string;
}

/**
 * Builds the plaintext body for an OTP verification email.
 */
export const GenerateOTPTextTemplate = (otpCode: string) => {
  return `${INSTITUTE_NAME} - ${SYSTEM_NAME} (${INITIALISM})
----------------------------------------------------------------------
Security Verification Notice

A login request has been recorded for your account. Use the following verification code to complete your access:

Verification Code: ${otpCode}

This code is valid for 5 minutes. If you did not request this code, please ignore this email or reach out to the IT Services Office.

--
This is an automated security message. Please do not reply.
`;
};

/**
 * Builds the HTML body for an OTP verification email.
 */
export const GenerateOTPHtmlTemplate = (otpCode: string) => {
  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${INITIALISM} Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        
        <tr>
          <td style="padding: 32px 40px; background-color: #0f172a; text-align: center;">
            <div style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
              ${INSTITUTE_NAME}
            </div>
            <div style="color: #38bdf8; font-size: 18px; font-weight: 700;">
              ${SYSTEM_NAME} (${INITIALISM})
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 40px 32px 40px;">
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; font-weight: 600;">
              Security Verification Notice
            </p>
            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569;">
              A request has been made to authenticate into your account on the PIT Faculty Evaluation portal. Please use the single-use verification code below to complete your authorization process.
            </p>

            <div style="margin: 32px 0; text-align: center;">
              <div style="display: inline-block; padding: 16px 40px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">
                ${otpCode}
              </div>
              <p style="margin: 12px 0 0 0; font-size: 13px; color: #64748b; font-style: italic;">
                This code is strictly confidential and will expire in 5 minutes.
              </p>
            </div>

            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 24px;">
              <strong>Security Reminder:</strong> The ${INITIALISM} support team will never ask for your passwords or credentials via email. If you did not initiate this login request, please report it immediately to the IT Services Office.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 12px; line-height: 18px; color: #94a3b8; font-weight: 600;">
              ${INSTITUTE_NAME} — ${INITIALISM}
            </p>
            <p style="margin: 0; font-size: 11px; line-height: 16px; color: #94a3b8;">
              This is an automated administrative notification. Please do not reply directly to this message.
            </p>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;
};

/**
 * Plaintext email template for new account creation.
 */
export const GenerateWelcomeTextTemplate = ({
  recipientName,
  email,
  generatedPassword,
  loginUrl = "https://your-portal-url.edu",
}: UserWelcomeEmailData) => {
  return `${INSTITUTE_NAME} - ${SYSTEM_NAME} (${INITIALISM})
----------------------------------------------------------------------
Welcome to ${INITIALISM}!

Hello ${recipientName},

Your account for the PIT Faculty Evaluation portal has been successfully created.

Account Details:
- Username / Email: ${email}
${generatedPassword ? `- Temporary Password: ${generatedPassword}\n` : ""}
${
  generatedPassword
    ? "SECURITY NOTICE: A temporary password was automatically generated for your account. Please log in immediately and change your password to secure your account."
    : "You may now log in using the password configured during setup."
}

Access the portal here: ${loginUrl}

--
This is an automated administrative notification. Please do not reply.
`;
};

/**
 * HTML email template for new account creation.
 */
export const GenerateWelcomeHtmlTemplate = ({
  recipientName,
  email,
  generatedPassword,
  loginUrl = "https://your-portal-url.edu",
}: UserWelcomeEmailData) => {
  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${INITIALISM}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        
        <tr>
          <td style="padding: 32px 40px; background-color: #0f172a; text-align: center;">
            <div style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
              ${INSTITUTE_NAME}
            </div>
            <div style="color: #38bdf8; font-size: 18px; font-weight: 700;">
              ${SYSTEM_NAME} (${INITIALISM})
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 40px 32px 40px;">
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; font-weight: 600;">
              Welcome, ${recipientName}!
            </p>
            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569;">
              Your account has been created for the ${INITIALISM} portal. Below are your account credentials:
            </p>

            <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">
                <strong>Username / Email:</strong> ${email}
              </p>
              ${
                generatedPassword
                  ? `<p style="margin: 0; font-size: 14px; color: #334155;">
                      <strong>Temporary Password:</strong> <code style="font-family: monospace; background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-weight: 600; color: #0f172a;">${generatedPassword}</code>
                    </p>`
                  : ""
              }
            </div>

            ${
              generatedPassword
                ? `<div style="margin: 24px 0; padding: 16px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #991b1b; font-size: 14px; line-height: 20px;">
                    <strong>Important Security Notice:</strong> A temporary password was generated for you. Please log in immediately and <strong>change your password</strong> to ensure your account remains secure.
                  </div>`
                : ""
            }

            <div style="margin: 32px 0; text-align: center;">
              <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; background-color: #0284c7; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 6px;">
                Log In to Portal
              </a>
            </div>

            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 24px;">
              <strong>Security Reminder:</strong> Never share your account details or password with anyone.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 12px; line-height: 18px; color: #94a3b8; font-weight: 600;">
              ${INSTITUTE_NAME} — ${INITIALISM}
            </p>
            <p style="margin: 0; font-size: 11px; line-height: 16px; color: #94a3b8;">
              This is an automated administrative notification. Please do not reply directly to this message.
            </p>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;
};

/**
 * Plaintext body for an admin-driven account update notification.
 * Lists each changed field with old → new values, plus a security notice.
 * If email was changed, call this twice — once for new email, once for old.
 */
export const GenerateAccountUpdateTextTemplate = ({
  recipientName,
  updatedFields,
  updatedAt,
}: UserUpdateEmailData) => {
  const formattedDate = updatedAt.toLocaleString("en-PH", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const fieldLines = updatedFields
    .map((f) => `  - ${f.label}: "${f.oldValue}" → "${f.newValue}"`)
    .join("\n");

  return `${INSTITUTE_NAME} - ${SYSTEM_NAME} (${INITIALISM})
----------------------------------------------------------------------
Account Update Notice

Hello ${recipientName},

Your ${INITIALISM} account was updated by an administrator on ${formattedDate}.

Changes made:
${fieldLines}

If you did not expect these changes or believe this was done in error, contact the IT Services Office or your system administrator immediately.

--
This is an automated administrative notification. Please do not reply.
`;
};

/**
 * HTML body for an admin-driven account update notification.
 * Lists each changed field with old → new values, plus a security notice.
 * If email was changed, call this twice — once for new email, once for old.
 */
export const GenerateAccountUpdateHtmlTemplate = ({
  recipientName,
  updatedFields,
  updatedAt,
}: UserUpdateEmailData) => {
  const formattedDate = updatedAt.toLocaleString("en-PH", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const fieldRows = updatedFields
    .map(
      (f) => `
        <tr>
          <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #334155; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">
            ${f.label}
          </td>
          <td style="padding: 10px 12px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
            <code style="font-family: monospace; background-color: #fee2e2; padding: 2px 6px; border-radius: 4px; color: #991b1b;">${f.oldValue}</code>
          </td>
          <td style="padding: 10px 12px; font-size: 13px; color: #64748b; border-bottom: 1px solid #e2e8f0;">
            <code style="font-family: monospace; background-color: #dcfce7; padding: 2px 6px; border-radius: 4px; color: #166534;">${f.newValue}</code>
          </td>
        </tr>`,
    )
    .join("");

  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${INITIALISM} Account Update Notice</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">

        <tr>
          <td style="padding: 32px 40px; background-color: #0f172a; text-align: center;">
            <div style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
              ${INSTITUTE_NAME}
            </div>
            <div style="color: #38bdf8; font-size: 18px; font-weight: 700;">
              ${SYSTEM_NAME} (${INITIALISM})
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding: 40px 40px 32px 40px;">
            <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; line-height: 24px;">
              Account Update Notice
            </p>
            <p style="margin: 0 0 24px 0; font-size: 13px; color: #94a3b8;">
              ${formattedDate}
            </p>
            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569;">
              Hello <strong>${recipientName}</strong>, your ${INITIALISM} account was updated by an administrator. The following changes were made:
            </p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 24px;">
              <thead>
                <tr>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #e2e8f0;">Field</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #e2e8f0;">Previous</th>
                  <th style="padding: 10px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background-color: #f1f5f9; text-align: left; border-bottom: 1px solid #e2e8f0;">Updated</th>
                </tr>
              </thead>
              <tbody>
                ${fieldRows}
              </tbody>
            </table>

            <div style="padding: 16px; background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; font-size: 14px; line-height: 20px; color: #9a3412;">
              <strong>Security Notice:</strong> If you did not expect these changes or believe this was done in error, contact the IT Services Office or your system administrator immediately.
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 12px; line-height: 18px; color: #94a3b8; font-weight: 600;">
              ${INSTITUTE_NAME} — ${INITIALISM}
            </p>
            <p style="margin: 0; font-size: 11px; line-height: 16px; color: #94a3b8;">
              This is an automated administrative notification. Please do not reply directly to this message.
            </p>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;
};

// Password Reset Text Template:
export const GeneratePasswordResetTextTemplate = (otpCode: string) => {
  return `${INSTITUTE_NAME} - ${SYSTEM_NAME} (${INITIALISM})
----------------------------------------------------------------------
Password Recovery Request

We received a request to reset the password for your ${INITIALISM} account.

Reset Verification Code: ${otpCode}

This code is valid for 5 minutes. If you did not request a password reset, please secure your account immediately or contact the IT Services Office.

--
This is an automated administrative notification. Please do not reply.
`;
};

// Password Reset HTML Template:
export const GeneratePasswordResetHtmlTemplate = (otpCode: string) => {
  return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${INITIALISM} Password Reset Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
        <tr>
          <td style="padding: 32px 40px; background-color: #0f172a; text-align: center;">
            <div style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
              ${INSTITUTE_NAME}
            </div>
            <div style="color: #38bdf8; font-size: 18px; font-weight: 700;">
              ${SYSTEM_NAME} (${INITIALISM})
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 40px 32px 40px;">
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; font-weight: 600;">
              Password Reset Request
            </p>
            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #475569;">
              We received a request to reset the password associated with your ${INITIALISM} account. Please use the verification code below to authorize your password reset:
            </p>

            <div style="margin: 32px 0; text-align: center;">
              <div style="display: inline-block; padding: 16px 40px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">
                ${otpCode}
              </div>
              <p style="margin: 12px 0 0 0; font-size: 13px; color: #64748b; font-style: italic;">
                This code expires in 5 minutes.
              </p>
            </div>

            <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 22px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 24px;">
              <strong>Security Notice:</strong> If you did not request a password reset, please contact the IT Services Office immediately.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
