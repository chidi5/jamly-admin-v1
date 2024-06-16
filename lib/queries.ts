"use server";

import { clerkClient, currentUser } from "@clerk/nextjs";
import { Invitation, Role, Store, User } from "@prisma/client";
import crypto from "crypto";
import { write } from "fast-csv";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { Writable } from "stream";
import prismadb from "./prismadb";
import { ProductData } from "./types";

const algorithm = "aes-256-cbc";

if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY environment variable is not set");
}

const key = crypto
  .createHash("sha256")
  .update(String(`${process.env.ENCRYPTION_KEY}`))
  .digest("base64")
  .slice(0, 32);

function generateRandomString(length: any) {
  return crypto.randomUUID().toString().slice(0, length);
}

export async function generateUniqueID() {
  let uniqueID;
  do {
    uniqueID = generateRandomString(6) + "-" + generateRandomString(2);
  } while (await prismadb.store.findFirst({ where: { id: uniqueID } }));
  return uniqueID;
}

// generate Handle
export const generateUniqueCategoryHandle = async (
  name: string
): Promise<string> => {
  let uniqueHandle = slugify(name, { lower: true, strict: true });
  let counter = 1;

  while (
    await prismadb.category.findFirst({ where: { handle: uniqueHandle } })
  ) {
    uniqueHandle = `${uniqueHandle}-${counter}`;
    counter++;
  }

  return uniqueHandle;
};

export const generateUniqueProductHandle = async (
  name: string
): Promise<string> => {
  let uniqueHandle = slugify(name, { lower: true, strict: true });
  let counter = 1;

  while (
    await prismadb.product.findFirst({ where: { handle: uniqueHandle } })
  ) {
    uniqueHandle = `${uniqueHandle}-${counter}`;
    counter++;
  }

  return uniqueHandle;
};

export const priceFormatter = async (locale: string, currency: string) => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  });

  return formatter;
};

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

export const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  return user;
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

export const getPaymentConfig = async (storeId: string) => {
  const paymentConfig = await prismadb.paymentConfig.findMany({
    where: {
      storeId,
    },
  });

  return paymentConfig;
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
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total revenue for the current month
  const currentMonthPaidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: startOfCurrentMonth,
      },
    },
    include: {
      orderItems: true,
    },
  });

  const currentMonthTotalRevenue = currentMonthPaidOrders.reduce(
    (total, order) => {
      const orderTotal = order.orderItems.reduce((orderSum, item) => {
        return orderSum + item.price.toNumber();
      }, 0);
      return total + orderTotal;
    },
    0
  );

  // Total revenue for the last month
  const lastMonthPaidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: lastMonth,
        lt: startOfCurrentMonth,
      },
    },
    include: {
      orderItems: true,
    },
  });

  const lastMonthTotalRevenue = lastMonthPaidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      return orderSum + item.price.toNumber();
    }, 0);
    return total + orderTotal;
  }, 0);

  const percentageChange = lastMonthTotalRevenue
    ? ((currentMonthTotalRevenue - lastMonthTotalRevenue) /
        lastMonthTotalRevenue) *
      100
    : 0;

  return {
    currentMonthTotalRevenue,
    percentageChange,
  };
};

export const getSalesCount = async (storeId: string) => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Sales count for the current month
  const currentMonthSalesCount = await prismadb.order.count({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: startOfCurrentMonth,
      },
    },
  });

  // Sales count for the last month
  const lastMonthSalesCount = await prismadb.order.count({
    where: {
      storeId,
      isPaid: true,
      createdAt: {
        gte: lastMonth,
        lt: startOfCurrentMonth,
      },
    },
  });

  const percentageChange = lastMonthSalesCount
    ? ((currentMonthSalesCount - lastMonthSalesCount) / lastMonthSalesCount) *
      100
    : 0;

  return {
    currentMonthSalesCount,
    percentageChange,
  };
};

export const getTotalStock = async (storeId: string) => {
  const products = await prismadb.product.findMany({
    where: {
      storeId,
    },
    include: {
      stock: true,
      variants: {
        include: {
          stock: true,
        },
      },
    },
  });

  const totalStock = products.reduce((total, product) => {
    // Calculate product stock
    const productStock = product.stock
      ? product.stock.trackInventory
        ? product.stock.quantity ?? 0
        : product.stock.inventoryStatus === "IN_STOCK"
        ? 1 ?? 0
        : 0
      : 0;

    // Calculate variants stock
    const variantsStock = product.variants.reduce((variantSum, variant) => {
      const variantStock = variant.stock
        ? variant.stock.trackInventory
          ? variant.stock.quantity ?? 0
          : variant.stock.inventoryStatus === "IN_STOCK"
          ? 1 ?? 0
          : 0
        : 0;

      return variantSum + variantStock;
    }, 0);

    return total + productStock + variantsStock;
  }, 0);

  return totalStock;
};

export async function validateProductData(
  body: ProductData
): Promise<ProductData> {
  const { name, price, description, images } = body;

  if (!name) throw new Error("Name is required");
  if (!price) throw new Error("Price is required");
  if (!description) throw new Error("Description is required");
  if (!images || !images.length) throw new Error("Images are required");

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

export async function createOptionsAndValues(
  data: { options: any },
  productId: string
) {
  const optionData: any[] = [];
  for (const option of data.options) {
    const newOption = await prismadb.option.create({
      data: { productId: productId, name: option.name },
    });
    optionData.push(
      ...option.values.map((value: { value: any }) => ({
        value: value.value,
        optionId: newOption.id,
      }))
    );
  }
  if (optionData.length) {
    await prismadb.optionValue.createMany({
      data: optionData,
      skipDuplicates: true,
    });
  }

  const promises = optionData.map((optionValue) =>
    prismadb.optionValue.findFirst({ where: optionValue })
  );
  const optionValues = await Promise.all(promises);

  return optionValues;
}

const flattenJSON = (data: any) => {
  const result: any = {};

  const recurse = (cur: any, prop: string) => {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for (let i = 0; i < cur.length; i++) {
        recurse(cur[i], prop + "[" + i + "]");
      }
      if (cur.length === 0) {
        result[prop] = [];
      }
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop + "." + p : p);
      }
      if (isEmpty && prop) {
        result[prop] = {};
      }
    }
  };

  recurse(data, "");
  return result;
};

export const exportProduct = async (products: []): Promise<string> => {
  const productIdsArray = products.map((product: { id: string }) => product.id);

  const fetchedProducts = await prismadb.product.findMany({
    where: {
      id: {
        in: productIdsArray,
      },
    },
    include: {
      images: true,
      priceData: true,
      costAndProfitData: true,
      discount: true,
      stock: true,
      categories: true,
      additionalInfoSections: true,
      options: true,
      variants: {
        include: {
          priceData: true,
          costAndProfitData: true,
          stock: true,
          selectedOptions: {
            include: {
              option: true,
            },
          },
        },
      },
    },
  });

  const flattenedProducts = fetchedProducts.map((product) =>
    flattenJSON(product)
  );

  return new Promise((resolve, reject) => {
    const chunks: string[] = [];

    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    });

    write(flattenedProducts, { headers: true })
      .on("error", reject)
      .on("finish", () => {
        resolve(chunks.join(""));
      })
      .pipe(writable);
  });
};

export const exportCategory = async (category: []): Promise<string> => {
  const categoryIdsArray = category.map(
    (category: { id: string }) => category.id
  );

  const fetchedCategory = await prismadb.category.findMany({
    where: {
      id: {
        in: categoryIdsArray,
      },
    },
    include: {
      products: true,
    },
  });

  const flattenedCategory = fetchedCategory.map((category) =>
    flattenJSON(category)
  );

  return new Promise((resolve, reject) => {
    const chunks: string[] = [];

    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    });

    write(flattenedCategory, { headers: true })
      .on("error", reject)
      .on("finish", () => {
        resolve(chunks.join(""));
      })
      .pipe(writable);
  });
};

export const exportBillboard = async (billboard: []): Promise<string> => {
  const billboardIdsArray = billboard.map(
    (billboard: { id: string }) => billboard.id
  );

  const fetchedBillboard = await prismadb.billboard.findMany({
    where: {
      id: {
        in: billboardIdsArray,
      },
    },
  });

  const flattenedBillboard = fetchedBillboard.map((billboard) =>
    flattenJSON(billboard)
  );

  return new Promise((resolve, reject) => {
    const chunks: string[] = [];

    const writable = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    });

    write(flattenedBillboard, { headers: true })
      .on("error", reject)
      .on("finish", () => {
        resolve(chunks.join(""));
      })
      .pipe(writable);
  });
};

export const encrypt = async (text: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: iv.toString("hex"),
    content: encrypted,
  };
};

export const decrypt = async (text: string) => {
  const hash = JSON.parse(text);
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(hash.iv, "hex")
  );
  let decrypted = decipher.update(hash.content, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
