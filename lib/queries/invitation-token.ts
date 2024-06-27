import prismadb from "@/lib/prismadb";

export const getInvitationTokenByToken = async (token: string) => {
  try {
    const invitationToken = await prismadb.invitation.findUnique({
      where: { token },
    });

    return invitationToken;
  } catch (error) {}
};

export const getInvitationTokenByEmail = async (email: string) => {
  try {
    const invitationToken = await prismadb.invitation.findFirst({
      where: { email },
    });

    return invitationToken;
  } catch (error) {}
};

export const getInvitationTokenById = async (id: string) => {
  try {
    const invitationToken = await prismadb.invitation.findFirst({
      where: { id },
    });

    return invitationToken;
  } catch (error) {}
};
