import crypto from "crypto";
import { v4 as uuid } from "uuid";
import prismadb from "./prismadb";
import { getVerificationTokenByEmail } from "./queries/verification-token";
import { getPasswordResetTokenByEmail } from "./queries/password-reset-token";
import { getTwoFactorTokenByEmail } from "./queries/two-factor-token";
import { Role } from "@prisma/client";
import { getInvitationTokenByEmail } from "./queries/invitation-token";
import { connect } from "http2";

export const generateVerificationToken = async (email: string) => {
  const token = uuid();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000); //to expire in 5m

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await prismadb.verificationToken.delete({
      where: { id: existingToken.id },
    });
  }

  const verificationToken = await prismadb.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuid();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000); //to expire in 5m

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await prismadb.verificationToken.delete({
      where: { id: existingToken.id },
    });
  }

  const passwordResetToken = await prismadb.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000); //to expire in 5m

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await prismadb.twoFactorToken.delete({
      where: { id: existingToken.id },
    });
  }

  const twoFactorToken = await prismadb.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return twoFactorToken;
};

export const generateInvitationToken = async (
  email: string,
  role: Role,
  storeId: string
) => {
  const token = uuid();
  const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); //to expire in 24h

  const existingToken = await getInvitationTokenByEmail(email);

  if (existingToken) {
    await prismadb.invitation.delete({
      where: { id: existingToken.id },
    });
  }

  const invitationToken = await prismadb.invitation.create({
    data: {
      email,
      token,
      expires,
      role,
      storeId,
    },
  });

  return invitationToken;
};
