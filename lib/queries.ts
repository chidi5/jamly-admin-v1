"use server";

import { clerkClient, currentUser } from "@clerk/nextjs";
import prismadb from "./prismadb";
import { redirect } from "next/navigation";
import { Store, Role, User, Invitation } from "@prisma/client";

function generateRandomString(length: any) {
  return crypto.randomUUID().toString().slice(0, length);
}

export async function generateUniqueID() {
  let uniqueID;
  do {
    uniqueID = generateRandomString(6) + "-" + generateRandomString(2);
  } while (await prismadb.store.findFirst({ where: { id: uniqueID } }));
  //await prismadb.store('unique_ids').insertOne({ id: uniqueID });
  return uniqueID;
}

export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const userData = await prismadb.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Store: true,
    },
  });

  return userData;
};

export const saveActivityLogsNotification = async ({
  storeId,
  description,
}: {
  storeId?: string;
  description: string;
}) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    const response = await prismadb.user.findFirst({
      where: {
        storeId,
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await prismadb.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    });
  }

  if (!userData) {
    console.log("Could not find a user");
    return;
  }

  let foundStoreId = storeId;
  if (!foundStoreId) {
    throw new Error(
      "You need to provide atleast an agency Id or subaccount Id"
    );
  } else {
    await prismadb.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        Store: {
          connect: {
            id: foundStoreId,
          },
        },
      },
    });
  }
};

export const createTeamUser = async (storeId: string, user: User) => {
  if (user.role === "STORE_OWNER") return null;
  const response = await prismadb.user.create({ data: { ...user } });
  return response;
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  const invitationExists = await prismadb.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.storeId, {
      email: invitationExists.email,
      storeId: invitationExists.storeId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await saveActivityLogsNotification({
      storeId: invitationExists?.storeId,
      description: `Joined`,
    });

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || "STAFF_USER",
        },
      });

      await prismadb.invitation.delete({
        where: { email: userDetails.email },
      });

      return userDetails.storeId;
    } else return null;
  } else {
    const store = await prismadb.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });
    return store ? store.storeId : null;
  }
};

export const updateStoreDetails = async (
  storeId: string,
  storeDetails: Partial<Store>
) => {
  const response = await prismadb.store.update({
    where: { id: storeId },
    data: { ...storeDetails },
  });
  return response;
};

export const deleteStore = async (storeId: string) => {
  const response = await prismadb.store.delete({ where: { id: storeId } });
  return response;
};

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();
  if (!user) return;

  const userData = await prismadb.user.upsert({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || "STAFF_USER",
    },
  });

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || "STAFF_USER",
    },
  });

  return userData;
};

export const getNotification = async (storeId: string) => {
  try {
    const response = await prismadb.notification.findMany({
      where: { storeId },
      orderBy: {
        createdAt: "desc",
      },
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

export const updateUser = async (user: Partial<User>) => {
  const response = await prismadb.user.update({
    where: { email: user.email },
    data: { ...user },
  });

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || "STAFF_USER",
    },
  });

  return response;
};

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  });
  await clerkClient.users.deleteUser(userId);
  const deletedUser = await prismadb.user.delete({ where: { id: userId } });

  return deletedUser;
};

export const getUser = async (id: string) => {
  const user = await prismadb.user.findUnique({
    where: {
      id,
    },
  });

  return user;
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

export const getInviteId = async (data: Invitation[]) => {
  try {
    const response = await clerkClient.invitations.getInvitationList();

    for (const value of data) {
      const matchingInvitation = response.find(
        (res) => res?.emailAddress === value.email
      );

      if (matchingInvitation) {
        return { id: matchingInvitation.id }; // Return an object with the ID
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return null;
  }
};

export const sendInvitation = async (
  role: Role,
  email: string,
  storeId: string
) => {
  let response;

  try {
    await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_SIGN_UP_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });

    response = await prismadb.invitation.create({
      data: { email, storeId, role },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }

  return response;
};

export const revokeInvitation = async (
  invitationId: string,
  matchingIds?: string
) => {
  let response;
  try {
    await clerkClient.invitations.revokeInvitation(matchingIds!);

    response = await prismadb.invitation.delete({
      where: {
        id: invitationId,
      },
    });
  } catch (error) {
    console.log(error);
    throw error;
  }

  return response;
};
