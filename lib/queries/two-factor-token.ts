import prismadb from "../prismadb";

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await prismadb.twoFactorToken.findUnique({
      where: { token },
    });

    return twoFactorToken;
  } catch (error) {}
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactorToken = await prismadb.twoFactorToken.findFirst({
      where: { email },
    });

    return twoFactorToken;
  } catch (error) {}
};
