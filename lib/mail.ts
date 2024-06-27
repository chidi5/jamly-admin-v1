import {
  EmailTemplate,
  InvitationEmailTemplate,
  ResetPasswordEmailTemplate,
  TwoFactorEmailTemplate,
} from "@/components/auth/email-template";
import { InvitationEmail } from "@/components/email/invitation-email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const url = process.env.NEXT_PUBLIC_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${url}new-verification?token=${token}`;

  await resend.emails.send({
    from: "Jamly <onboarding@resend.dev>",
    to: email,
    subject: "Email Confirmation",
    text: `Please click the following link to confirm your email: ${confirmLink}`,
    react: EmailTemplate({ confirmLink }),
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const confirmLink = `${url}new-password?token=${token}`;

  await resend.emails.send({
    from: "Jamly <onboarding@resend.dev>",
    to: email,
    subject: "Reset Password",
    text: `Please click the following link to reset password: ${confirmLink}`,
    react: ResetPasswordEmailTemplate({ confirmLink }),
  });
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "Jamly <onboarding@resend.dev>",
    to: email,
    subject: "2FA Code",
    text: `your 2FA code: ${token}`,
    react: TwoFactorEmailTemplate({ confirmLink: token }),
  });
};

export const sendInvitationEmail = async (
  name: string,
  email: string,
  token: string
) => {
  const confirmLink = `${url}sign-up?token=${token}`;

  await resend.emails.send({
    from: "Jamly <onboarding@resend.dev>",
    to: "joshdash.ji@gmail.com",
    subject: "Invitation to join a team on Jamly",
    react: InvitationEmail({ confirmLink, name, email }),
  });
};
