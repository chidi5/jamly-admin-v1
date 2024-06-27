import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prismadb from "./lib/prismadb";

import { SignInSchema } from "./schemas";
import { getUserbyEmail, getUserbyId } from "./lib/queries/user";
import { getTwoFactorConfirmationByUserId } from "./lib/queries/two-factor-confirmation";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prismadb),
  providers: [
    Credentials({
      id: "store-credentials",
      name: "Store Credentials",
      authorize: async (credentials) => {
        const validatedFields = SignInSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserbyEmail(email);

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(password, user.password);

          if (isValid) {
            return {
              ...user,
              firstName: user.firstName ?? "",
              lastName: user.lastName ?? "",
            };
          }
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  events: {
    async linkAccount({ user }) {
      await prismadb.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "store-credentials") return true;

      const existingUser = await getUserbyId(user.id!);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (!twoFactorConfirmation) return false;

        await prismadb.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.firstName && session.user) {
        session.user.firstName = token.firstName;
      }

      if (token.lastName && session.user) {
        session.user.lastName = token.lastName;
      }

      if (token.image && session.user) {
        session.user.image = token.image;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.image = user.image;
      } else if (token.sub) {
        // Subsequent use, token already exists
        const existingUser = await getUserbyId(token.sub);

        if (existingUser) {
          token.firstName = existingUser.firstName ?? "";
          token.lastName = existingUser.lastName ?? "";
          token.role = existingUser.role;
          token.image = existingUser.image;
        }
      }

      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
});
