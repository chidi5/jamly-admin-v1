"use server";

import { ResetSchema } from "@/schemas";
import { z } from "zod";
import { getUserbyEmail } from "./user";
import { generatePasswordResetToken } from "../tokens";
import { sendPasswordResetEmail } from "../mail";

export const Reset = async (value: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(value);

  if (!validatedFields.success) {
    return { error: "Invalid email" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserbyEmail(email);

  if (!existingUser) return { error: "Email not found" };

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Reset email sent" };
};
