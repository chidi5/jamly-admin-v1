"use server";

import { auth } from "@/auth";
import { User } from "@prisma/client";
import crypto from "crypto";
import { write } from "fast-csv";
import slugify from "slugify";
import { Writable } from "stream";
import prismadb from "./prismadb";
import { ProductData } from "./types";

const algorithm = "aes-256-cbc";

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

// PriceFormatter
export const priceFormatter = async (locale: string, currency: string) => {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  });

  return formatter;
};

export const initUser = async (newUser: Partial<User>) => {
  const session = await auth();
  if (!session) return;

  const userData = await prismadb.user.upsert({
    where: {
      email: session.user?.email!,
    },
    update: newUser,
    create: {
      id: session.user?.id,
      image: session.user?.image,
      email: session.user?.email!,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
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

// Dashboard query
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

export const getCustomerCount = async (storeId: string) => {
  const customerCount = await prismadb.customer.count({
    where: { stores: { some: { id: storeId } } },
  });

  return customerCount;
};

export const recentSales = async (storeId: string) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get recent sales
  const recentSales = await prismadb.orderItem.findMany({
    where: {
      order: {
        storeId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
        isPaid: true,
      },
    },
    select: {
      product: {
        select: {
          name: true,
          images: {
            select: {
              url: true,
            },
            take: 1, // Get the first image
          },
        },
      },
      price: true,
      quantity: true,
    },
    orderBy: {
      order: {
        createdAt: "desc",
      },
    },
  });

  // Calculate the total amount paid and format the result
  const salesData = recentSales.map((item) => ({
    productName: item.product.name,
    productImage: item.product.images[0]?.url ?? "",
    totalAmountPaid: item.price.toNumber() * (item.quantity ?? 1),
    quantity: item.quantity ?? 1,
  }));

  return salesData;
};

//product setup
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

//CSV formatter
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

//payment config
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

export const getPaymentConfig = async (storeId: string) => {
  const paymentConfig = await prismadb.paymentConfig.findMany({
    where: {
      storeId,
    },
  });

  return paymentConfig;
};

export const getActivePaymentConfig = async (storeId: string) => {
  const activePaymentConfig = await prismadb.paymentConfig.findFirst({
    where: {
      storeId,
      isActive: true,
    },
  });

  return activePaymentConfig;
};
