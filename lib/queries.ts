"use server";

import { clerkClient, currentUser } from "@clerk/nextjs";
import {
  Invitation,
  Prisma,
  PrismaClient,
  Role,
  Store,
  User,
} from "@prisma/client";
import { redirect } from "next/navigation";
import prismadb from "./prismadb";
import { ProductData } from "./types";
import { DefaultArgs } from "@prisma/client/runtime/library";

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

/*export const updateUser = async (data: {
  firstName: string;
  lastName: string;
  imageUrl: string;
  phoneNumber: string;
}) => {
  console.log(data.firstName + data.lastName);
  //const user = await currentUser();
  //if (!user) return;

  const urlToBlob = async (imageUrl: string | globalThis.URL | Request) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return blob;
  };

  const res = await urlToBlob(data.imageUrl);
  /*const response = await prismadb.user.update({
    where: { email: user?.emailAddresses[0].emailAddress },
    data: { avatarUrl: data.imageUrl, name: data.firstName + data.lastName },
  });
  await clerkClient.users.updateUser("iisinx", {
    firstName: data.firstName,
    lastName:data.lastName,
  })

  await clerkClient.users.updateUserProfileImage("iii", {file: blob})*/

/*await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: {
      role: user.role || "STAFF_USER",
    },
  });
  //console.log(users);
  return res;
};*/

export const updateUser = async (data: {
  firstName: string;
  lastName: string;
  imageUrl: string;
}) => {
  const user = await currentUser();
  if (!user) return;

  const urlToBlob = async (imageUrl: string): Promise<Blob> => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error("Error fetching image:", error);
      throw error;
    }
  };

  try {
    const imageBlob = await urlToBlob(data.imageUrl);
    const response = await prismadb.user.update({
      where: { email: user?.emailAddresses[0].emailAddress },
      data: {
        avatarUrl: data.imageUrl,
        name: `${data.firstName} ${data.lastName}`,
      },
    });

    await clerkClient.users.updateUser(response.id, {
      firstName: data.firstName,
      lastName: data.lastName,
    });

    await clerkClient.users.updateUserProfileImage(response.id, {
      file: imageBlob,
    });

    return response;
  } catch (error) {
    console.error("Error in updateUser function:", error);
    throw error;
  }
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

export const getTotalRevenue = async (storeId: string) => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: true,
    },
  });

  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      return orderSum + item.price.toNumber();
    }, 0);
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};

export const getSalesCount = async (storeId: string) => {
  const salesCount = await prismadb.order.count({
    where: {
      storeId,
      isPaid: true,
    },
  });

  return salesCount;
};

export const getTotalStock = async (storeId: string) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId,
    },
    include: {
      variants: true,
    },
  });

  const totalStock = products.reduce((total, product) => {
    const inventory = product.variants.reduce((variantSum, item) => {
      return variantSum + item.inventory;
    }, 0);
    return total + inventory;
  }, 0);

  return totalStock;
};

export async function validateProductData(
  body: ProductData
): Promise<ProductData> {
  const {
    name,
    price,
    handle,
    description,
    categoryId,
    isFeatured,
    isArchived,
    images,
    variants,
    options,
  } = body;

  if (!name) throw new Error("Name is required");
  if (!price) throw new Error("Price is required");
  if (!handle) throw new Error("Handle is required");
  if (!description) throw new Error("Description is required");
  if (!categoryId) throw new Error("Category id is required");
  if (!images || !images.length) throw new Error("Images are required");
  if (!variants || !variants.length) throw new Error("Variants are required");
  if (!options || !options.length) throw new Error("Options are required");

  return body;
}

export async function getStoreByUserId(storeId: string, userId: string) {
  const store = await prismadb.store.findFirst({
    where: {
      AND: [{ id: storeId }, { users: { some: { id: userId } } }],
    },
  });
  if (!store) throw new Error("Unauthorized");
  return store;
}

export async function createOrUpdateProduct(
  prisma: Omit<
    PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    "$on" | "$connect" | "$disconnect" | "$use" | "$transaction" | "$extends"
  >,
  data: ProductData,
  isNew = true
) {
  const { productId, options, variants, images, ...rest } = data;

  if (!isNew) {
    // Delete existing options and variants
    const productVariants = await prisma.variant.findMany({
      where: { productId },
      select: { selectedOptions: true },
    });
    const optionIds = new Set<string>();
    productVariants.forEach((variant) => {
      variant.selectedOptions.forEach((option) =>
        optionIds.add(option.optionId)
      );
    });
    const optionIdsArray = Array.from(optionIds);
    for (const optionId of optionIdsArray) {
      await prisma.optionValue.deleteMany({ where: { optionId } });
    }
    await prisma.option.deleteMany({
      where: { id: { in: optionIdsArray }, productId },
    });
    await prisma.variant.deleteMany({ where: { productId } });
  }

  const product = isNew
    ? await prisma.product.create({
        data: {
          ...rest,
          images: {
            createMany: {
              data: images.map((image: { url: string }) => image),
            },
          },
        },
      })
    : await prisma.product.update({
        where: { id: productId },
        data: {
          ...rest,
          images: {
            deleteMany: {},
            createMany: {
              data: images.map((image: { url: string }) => image),
            },
          },
        },
      });

  const optionData: any[] = [];
  for (const option of data.options) {
    const newOption = await prisma.option.create({
      data: { productId: product.id, name: option.optionName },
    });
    optionData.push(
      ...option.optionValues.map((value) => ({
        value: value.name,
        optionId: newOption.id,
      }))
    );
  }
  if (optionData.length) {
    await prisma.optionValue.createMany({
      data: optionData,
      skipDuplicates: true,
    });
  }

  const promises = optionData.map((optionValue) =>
    prisma.optionValue.findFirst({ where: optionValue })
  );
  const optionValues = await Promise.all(promises);

  const variantData = data.variants.map((variant) => {
    const selectedOptionValues = variant.title.includes("/")
      ? variant.title.split("/").map((value) => {
          const matchingOptionValue = optionValues.find(
            (data) => data!.value === value
          );
          if (!matchingOptionValue)
            throw new Error(`Option value "${value}" not found`);
          return { id: matchingOptionValue.id };
        })
      : [
          {
            id: optionValues.find((data) => data!.value === variant.title)!.id,
          },
        ];

    return {
      title: variant.title,
      price: variant.price,
      inventory: variant.inventory,
      productId: product.id,
      selectedOptions: { connect: selectedOptionValues },
    };
  });

  await Promise.all(
    variantData.map((variant: any) => prisma.variant.create({ data: variant }))
  );

  return product;
}
