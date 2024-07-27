"use server";

import { signIn } from "@/auth";
import { currentUser } from "@/hooks/use-current-user";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { SignInSchema, SignUpSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { z } from "zod";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "../mail";
import prismadb from "../prismadb";
import { generateTwoFactorToken, generateVerificationToken } from "../tokens";
import { getTwoFactorConfirmationByUserId } from "./two-factor-confirmation";
import { getTwoFactorTokenByEmail } from "./two-factor-token";
import { getInvitationTokenByToken } from "./invitation-token";
import { Role } from "@prisma/client";

export const SignIn = async (data: z.infer<typeof SignInSchema>) => {
  const validatedFields = SignInSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserbyEmail(email);

  if (!existingUser || !existingUser.password)
    return { error: "Invalid credentials!" };

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) return { error: "Invalide OTP!" };

      if (twoFactorToken.token !== code) return { error: "Invalide OTP!" };

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) return { error: "OTP expired!" };

      await prismadb.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (existingConfirmation) {
        await prismadb.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await prismadb.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(existingUser.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  try {
    await signIn("store-credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }

  return { success: "Logged in successfully!" };
};

export const SignUp = async (data: z.infer<typeof SignUpSchema>) => {
  const validatedFields = SignUpSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { first_name, last_name, email, password, token } =
    validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserbyEmail(email);

  if (existingUser) {
    return { error: "Email already exists" };
  }

  let emailVerified = null;
  let role: Role = Role.STORE_OWNER;

  if (token) {
    const existingToken = await getInvitationTokenByToken(token);

    if (!existingToken) {
      return { error: "Token does not exist!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
      return { error: "Token has expired!" };
    }

    emailVerified = new Date(); // Automatically verify the email
    role = existingToken.role;
  }

  await prismadb.user.create({
    data: {
      firstName: first_name,
      lastName: last_name,
      email,
      password: hashedPassword,
      emailVerified,
      role,
    },
  });

  if (!emailVerified) {
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
  }

  return {
    success: emailVerified
      ? "User added and email verified!"
      : "Confirmation email sent!",
  };
};

export const getUserbyEmail = async (email: string) => {
  try {
    const user = await prismadb.user.findUnique({
      where: { email },
      include: {
        stores: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export const getUserbyId = async (id: string) => {
  try {
    const user = await prismadb.user.findUnique({
      where: { id },
      include: {
        stores: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export const getAuthUserDetails = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const userData = await prismadb.user.findUnique({
    where: {
      email: user.email!,
    },
    include: {
      stores: true,
    },
  });

  return userData;
};

export const getStoreOwnerbyStoreId = async (storeId: string) => {
  try {
    const store = await prismadb.store.findUnique({
      where: { id: storeId },
      include: { users: { where: { role: "STORE_OWNER" } } },
    });
    return store?.users?.[0] ?? null;
  } catch (error) {
    return null;
  }
};

export const updateUser = async (data: {
  userId: string;
  firstName: string;
  lastName: string;
  image?: string;
  isTwoFactorEnabled: boolean;
}) => {
  const user = await getUserbyId(data.userId);

  if (!user) return { error: "User not found!" };

  try {
    await prismadb.user.update({
      where: { email: user.email! },
      data: {
        image: data.image || null,
        firstName: data.firstName,
        lastName: data.lastName,
        isTwoFactorEnabled: data.isTwoFactorEnabled,
      },
    });

    return { success: "Profile updated successfully!" };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};

//customers
export const getCustomerbyEmail = async (email: string) => {
  try {
    const user = await prismadb.customer.findUnique({
      where: { email },
      include: {
        stores: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};

export const getCustomerbyId = async (id: string) => {
  try {
    const user = await prismadb.customer.findUnique({
      where: { id },
      include: {
        stores: true,
      },
    });
    return user;
  } catch (error) {
    return null;
  }
};
