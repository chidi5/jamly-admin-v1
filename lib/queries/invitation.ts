"use server";

import { currentUser } from "@/hooks/use-current-user";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { sendInvitationEmail } from "../mail";
import prismadb from "../prismadb";
import { generateInvitationToken } from "../tokens";
import {
  getInvitationTokenByEmail,
  getInvitationTokenById,
  getInvitationTokenByToken,
} from "./invitation-token";
import { getStoreById } from "./store";
import { getStoreOwnerbyStoreId, getUserbyEmail, getUserbyId } from "./user";

export const sendInvitation = async (
  email: string,
  role: Role,
  storeId: string
) => {
  const store = await prismadb.store.findUnique({
    where: { id: storeId },
    include: { users: true },
  });

  const storeOwner = await getStoreOwnerbyStoreId(storeId);

  const name = `${storeOwner?.firstName} ${storeOwner?.lastName}`;

  if (!store) return { error: "Store does not exist!" };

  const userAlreadyInStore = store.users.some((user) => user.email === email); // Check if the user is already in the team

  if (userAlreadyInStore) {
    return { error: "User is already a member of the team" };
  }

  const invitationToken = await generateInvitationToken(email, role, storeId);
  await sendInvitationEmail(name, invitationToken.email, invitationToken.token);

  return { success: "Invitaion sent!" };
};

export const saveActivityLogsNotification = async ({
  storeId,
  description,
}: {
  storeId: string;
  description: string;
}) => {
  const user = await currentUser();

  if (!user) return { error: "User not found!" };

  const userData = await getUserbyId(user.id);

  if (!userData) {
    return { error: "User not found!" };
  }

  if (!storeId) return { error: "You need to provide a valid store ID" };

  const store = await getStoreById(storeId);

  if (!store) return { error: "Store not found!" };

  await prismadb.notification.create({
    data: {
      notification: `${userData.firstName} ${userData.lastName} | ${description}`,
      Store: {
        connect: {
          id: storeId,
        },
      },
    },
  });

  return { success: "Notification created!" };
};

export const checkInvitation = async (token: string) => {
  const existingToken = await getInvitationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const user = await getUserbyEmail(existingToken.email);

  return { userExists: !!user };
};

export const joinTeam = async (token: string) => {
  const existingToken = await getInvitationTokenByToken(token);

  if (!existingToken) {
    return { error: "Token does not exist!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  const existingUser = await getUserbyEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email does not exist!" };
  }

  await prismadb.store.update({
    where: { id: existingToken.storeId },
    data: {
      users: {
        connect: { email: existingToken.email },
      },
    },
  });

  await prismadb.invitation.delete({
    where: { token },
  });

  return { success: "User successfully added to the team" };
};

export const revokeInvitation = async (id: string) => {
  const user = await currentUser();

  if (!user) return { error: "User not authenticated!" };

  const existingToken = await getInvitationTokenById(id);

  if (!existingToken) {
    return { error: "Invitation does not exist!" };
  }

  const storeOwner = await getStoreOwnerbyStoreId(existingToken.storeId);

  if (!storeOwner)
    return { error: "Only the team owner can revoke invitations" };

  await prismadb.invitation.delete({
    where: { token: existingToken.token },
  });

  return { success: "Invitation revoked successfully" };
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
    return null;
  }

  const existingToken = await getInvitationTokenByEmail(user.email!);

  if (!existingToken) {
    const userStore = await getUserbyId(user.id);
    return userStore?.stores.length ? userStore.stores[0].id : null;
  }

  const storeId = existingToken.storeId;

  try {
    await prismadb.store.update({
      where: { id: storeId },
      data: {
        users: {
          connect: { email: existingToken.email },
        },
      },
    });

    await saveActivityLogsNotification({
      storeId,
      description: `${existingToken.email} | Joined`,
    });

    await prismadb.invitation.delete({
      where: { id: existingToken.id },
    });

    return storeId;
  } catch (error) {
    console.error("Error verifying and accepting invitation:", error);
    return { error: "An error occurred while processing the invitation." };
  }
};

export const deleteTeamUser = async (userId: string, storeId: string) => {
  const session = await currentUser();

  if (!session) return { error: "User is not authenticated!" };

  const user = await getStoreOwnerbyStoreId(storeId);

  if (!user) return { error: "Store not found!" };

  if (user.id !== session.id) {
    return { error: "Only the store owner can remove members" };
  }

  // Check if the user is a member of the team
  const isMember = await prismadb.store.findFirst({
    where: {
      id: storeId,
      users: {
        some: {
          id: userId,
        },
      },
    },
  });

  if (!isMember) {
    return { error: "User is not a member of the team" };
  }

  await prismadb.store.update({
    where: { id: storeId },
    data: {
      users: {
        disconnect: { id: userId },
      },
    },
  });

  return { success: "User removed from team successfully" };
};

export const getInvitation = async (storeId: string) => {
  try {
    const response = await prismadb.invitation.findMany({
      where: { storeId },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
