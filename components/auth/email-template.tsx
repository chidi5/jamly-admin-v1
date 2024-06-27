import * as React from "react";

interface EmailTemplateProps {
  confirmLink: string;
  name?: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  confirmLink,
}) => (
  <div className="space-y-5">
    <h1 className="text-2xl mb-3">Jamly</h1>
    <h1 className="font-bold text-3xl">Verification Link</h1>
    <p>click on the verification link below and follow the instructions</p>
    <a href={confirmLink} className="font-bold text-blue-500 underline">
      Confirm email.
    </a>
    <p>To protect your account, do not share this url.</p>
  </div>
);

export const ResetPasswordEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ confirmLink }) => (
  <div className="space-y-5">
    <h1 className="text-lg font-normal mb-3">Jamly</h1>
    <h1 className="font-bold text-3xl">Reset password</h1>
    <p>Click the link below to reset your password</p>
    <a href={confirmLink} className="font-bold text-blue-500 underline">
      Reset password.
    </a>
    <p>To protect your account, do not share this url.</p>
    <hr />
    <p>Please ignore this email if you did not initiate the request.</p>
  </div>
);

export const TwoFactorEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  confirmLink,
}) => (
  <div className="space-y-5">
    <h1 className="text-lg font-normal mb-3">Jamly</h1>
    <h1 className="font-bold text-3xl">Verification code</h1>
    <p>Enter the following verification code when prompted:</p>
    <h1 className="font-bold text-4xl">{confirmLink}</h1>
    <p>To protect your account, do not share this code.</p>
  </div>
);

export const InvitationEmailTemplate: React.FC<
  Readonly<EmailTemplateProps>
> = ({ confirmLink, name }) => (
  <div className="space-y-5">
    <h2 className="text-base font-normal mb-3">Jamly</h2>
    <h1 className="font-bold text-3xl">Your Invitation</h1>
    <p>{name} has invited you to join them on Jamly.</p>
    <button className="py-1 px-2 bg-indigo-600 hover:bg-indigo-700 text-white">
      <a href={confirmLink} className="decoration-transparent">
        {" "}
        Accept Invitation
      </a>
    </button>
    <p>
      If you're having trouble with the above button,
      <a href={confirmLink} className="text-indigo-600">
        {" "}
        click here.
      </a>
    </p>
  </div>
);
