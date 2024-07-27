import { InvitationEmail } from "@/components/email/invitation-email";
import { ResetPasswordEmail } from "@/components/email/reset-password-email";
import { TwoFactorEmail } from "@/components/email/two-factor-email";
import { VerificationEmail } from "@/components/email/verification-email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const url = process.env.NEXT_PUBLIC_URL;

const fromAddress = "support@getjamly.com"; // Updated the from address

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${url}new-verification?token=${token}`;

  await resend.emails.send({
    from: `Jamly <${fromAddress}>`,
    to: email,
    subject: "Email Confirmation",
    text: `Please click the following link to confirm your email: ${confirmLink}`,
    react: VerificationEmail({ confirmLink }),
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const confirmLink = `${url}new-password?token=${token}`;

  await resend.emails.send({
    from: `Jamly <${fromAddress}>`,
    to: email,
    subject: "Reset Password",
    text: `Please click the following link to reset password: ${confirmLink}`,
    react: ResetPasswordEmail({ confirmLink }),
  });
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: `Jamly <${fromAddress}>`,
    to: email,
    subject: "2FA Code",
    text: `Your 2FA code: ${token}`,
    react: TwoFactorEmail({ confirmLink: token }),
  });
};

export const sendInvitationEmail = async (
  name: string,
  from: string,
  email: string,
  token: string
) => {
  const confirmLink = `${url}sign-up?token=${token}`;

  await resend.emails.send({
    from: `Jamly <${fromAddress}>`,
    to: email,
    subject: "Invitation to join a team on Jamly",
    react: InvitationEmail({ confirmLink, name, from }),
  });
};
