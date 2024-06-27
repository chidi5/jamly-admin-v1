"use server";

import bcrypt from "bcryptjs";
import { NewPasswordSchema } from "@/schemas";
import { z } from "zod";
import {
  getPasswordResetTokenByEmail,
  getPasswordResetTokenByToken,
} from "./password-reset-token";
import prismadb from "../prismadb";
import { getUserbyEmail } from "./user";

export const NewPassword = async (
  value: z.infer<typeof NewPasswordSchema>,
  token: string | null
) => {
  if (!token) return { error: "Missing token!" };

  const validatedFields = NewPasswordSchema.safeParse(value);

  if (!validatedFields.success) return { error: "Invalid fields!" };

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) return { error: "Invalid token!" };

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) return { error: "Token has expired!" };

  const existingUser = await getUserbyEmail(existingToken.email);

  if (!existingUser) return { error: "Email does not exist!" };

  const hashedPassword = await bcrypt.hash(password, 10);

  await prismadb.user.update({
    where: { id: existingUser.id },
    data: {
      password: hashedPassword,
    },
  });

  await prismadb.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password succesfully updated!" };
};
