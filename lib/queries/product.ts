"use server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";
import {
  createOptionsAndValues,
  generateUniqueProductHandle,
  validateProductData,
} from "@/lib/queries";
import { getSelectedOptionValues } from "../utils";

export async function validateAndInitialize(data: any) {
  const user = await currentUser();
  if (!user) {
    return { error: "Unauthenticated" };
  }

  const body = data;
  await validateProductData(body);

  return { user, body };
}

export async function fetchStoreAndGenerateHandle(storeId: string, body: any) {
  if (!storeId) {
    return { error: "Store id is required" };
  }

  const store = await prismadb.store.findUnique({
    where: { id: storeId },
    select: { defaultCurrency: true },
  });

  if (!store) {
    return { error: "Store not found" };
  }

  const handle = await generateUniqueProductHandle(body.name);

  return { store, handle };
}

export async function createProduct(
  storeId: string,
  body: any,
  store: any,
  handle: string
) {
  const product = await prismadb.product.create({
    data: {
      storeId,
      name: body.name,
      handle,
      description: body.description,
      isFeatured: body.isFeatured,
      isArchived: body.isArchived,
      manageVariants: body.manageVariants,
      weight: body.weight,
      priceData: {
        create: {
          price: body.price,
          discountedPrice: body.discountedPrice ?? null,
          currency: store.defaultCurrency,
        },
      },
      costAndProfitData: body.costProfit
        ? {
            create: {
              itemCost: body.costProfit.itemCost ?? 0,
              profit: body.costProfit.profit,
              profitMargin: body.costProfit.profitMargin,
              formattedItemCost:
                store.defaultCurrency +
                (body.costProfit.itemCost?.toFixed(2) || "0.00"),
              formattedProfit:
                store.defaultCurrency +
                (body.costProfit.profit?.toFixed(2) || "0.00"),
            },
          }
        : undefined,
      stock: body.stock
        ? {
            create: {
              trackInventory: body.stock.trackInventory,
              quantity: body.stock.quantity ?? null,
              inventoryStatus: body.stock.inventoryStatus ?? "IN_STOCK",
            },
          }
        : undefined,
      discount:
        body.discount.value !== undefined
          ? {
              create: {
                value: body.discount.value,
                type: body.discount.type,
              },
            }
          : undefined,
      images: {
        createMany: {
          data: body.images.map((image: { url: string }) => ({
            url: image.url,
          })),
        },
      },
      additionalInfoSections: {
        create: body.additionalInfoSections?.map(
          (info: { title: string; description: string }) => ({
            title: info.title,
            description: info.description,
          })
        ),
      },
      categories: {
        connect: body.categories?.map((id: string) => ({ id })),
      },
    },
  });

  return product;
}

export async function createVariants(
  body: any,
  product: any,
  store: any,
  optionValues: any[]
) {
  for (const variant of body.variants) {
    const selectedOptionValues = getSelectedOptionValues(
      variant.title,
      optionValues
    );

    await prismadb.variant.create({
      data: {
        title: variant.title,
        priceData: {
          create: {
            price: variant.price,
            discountedPrice: body.discountedPrice,
            currency: store.defaultCurrency,
          },
        },
        costAndProfitData: variant.costofgoods
          ? {
              create: {
                itemCost: variant.costofgoods,
                formattedItemCost:
                  store.defaultCurrency +
                  (variant.costofgoods.toFixed(2) || "0.00"),
                profit:
                  (body.discountedPrice
                    ? body.discountedPrice
                    : variant.price) - variant.costofgoods,
                profitMargin:
                  ((variant.price - variant.costofgoods) /
                    (body.discountedPrice
                      ? body.discountedPrice
                      : variant.price)) *
                    100 || 0,
                formattedProfit:
                  store.defaultCurrency +
                  (
                    (body.discountedPrice
                      ? body.discountedPrice
                      : variant.price) - variant.costofgoods
                  ).toFixed(2),
              },
            }
          : undefined,
        stock:
          variant.status || variant.inventory
            ? {
                create: {
                  trackInventory: variant.inventory ? true : false,
                  quantity: variant.inventory ?? 0,
                  inventoryStatus: variant.status ?? "IN_STOCK",
                },
              }
            : undefined,
        product: { connect: { id: product.id } },
        selectedOptions: { connect: selectedOptionValues },
      },
    });
  }
}

//update

export async function updateProduct(
  productId: string,
  body: any,
  store: any,
  handle: string
) {
  const existingProduct = await prismadb.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      priceData: true,
      costAndProfitData: true,
      stock: true,
      discount: true,
      additionalInfoSections: true,
      categories: true,
      options: true,
      variants: true,
    },
  });

  if (!existingProduct)
    throw new Error(JSON.stringify({ message: "Product not found" }));

  const updatedProduct = await prismadb.product.update({
    where: { id: productId },
    data: {
      name: body.name,
      handle:
        body.name !== existingProduct.name ? handle : existingProduct.handle,
      description: body.description,
      isFeatured: body.isFeatured,
      isArchived: body.isArchived,
      manageVariants: body.manageVariants,
      weight: body.weight,
      priceData: {
        update: {
          price: body.price,
          discountedPrice: body.discountedPrice ?? null,
          currency: store.defaultCurrency,
        },
      },
      costAndProfitData: body.costProfit
        ? {
            upsert: {
              create: {
                itemCost: body.costProfit.itemCost ?? 0,
                profit: body.costProfit.profit,
                profitMargin: body.costProfit.profitMargin,
                formattedItemCost:
                  store.defaultCurrency +
                  (body.costProfit.itemCost?.toFixed(2) || "0.00"),
                formattedProfit:
                  store.defaultCurrency +
                  (body.costProfit.profit?.toFixed(2) || "0.00"),
              },
              update: {
                itemCost: body.costProfit.itemCost ?? 0,
                profit: body.costProfit.profit,
                profitMargin: body.costProfit.profitMargin,
                formattedItemCost:
                  store.defaultCurrency +
                  (body.costProfit.itemCost?.toFixed(2) || "0.00"),
                formattedProfit:
                  store.defaultCurrency +
                  (body.costProfit.profit?.toFixed(2) || "0.00"),
              },
            },
          }
        : undefined,
      stock: body.manageVariants
        ? {
            delete: existingProduct.stock ? true : undefined,
          }
        : body.stock
        ? {
            upsert: {
              create: {
                trackInventory: body.stock.trackInventory,
                quantity: body.stock.quantity ?? null,
                inventoryStatus: body.stock.inventoryStatus ?? "IN_STOCK",
              },
              update: {
                trackInventory: body.stock.trackInventory,
                quantity: body.stock.quantity ?? null,
                inventoryStatus: body.stock.inventoryStatus ?? "IN_STOCK",
              },
            },
          }
        : undefined,
      discount:
        body.discount && body.discount.value !== undefined
          ? {
              upsert: {
                create: {
                  value: body.discount.value,
                  type: body.discount.type,
                },
                update: {
                  value: body.discount.value,
                  type: body.discount.type,
                },
              },
            }
          : {},
      images: {
        deleteMany: {},
        createMany: {
          data: body.images.map((image: { url: string }) => ({
            url: image.url,
          })),
        },
      },
      additionalInfoSections: {
        deleteMany: {},
        create: body.additionalInfoSections?.map(
          (info: { title: string; description: string }) => ({
            title: info.title,
            description: info.description,
          })
        ),
      },
      categories: {
        set: body.categories?.map((id: string) => ({ id })),
      },
    },
  });

  return updatedProduct;
}

export async function updateOptionsAndValues(body: any, productId: string) {
  if (body.options) {
    await prismadb.option.deleteMany({
      where: { productId: productId },
    });
  }

  const optionValues = await createOptionsAndValuess(body, productId);

  return optionValues;
}

export async function updateVariants(
  body: any,
  product: any,
  store: any,
  optionValues: any
) {
  if (body.variants) {
    await prismadb.variant.deleteMany({
      where: { productId: product.id },
    });

    await createVariants(body, product, store, optionValues);
  }
}

export async function createOptionsAndValuess(
  data: { options: any },
  productId: string
) {
  // Prepare data for options and optionValues
  const optionsData = data.options.map((option: any) => ({
    name: option.name,
    productId: productId,
  }));

  // Create options in bulk
  const createdOptions = await prismadb.option.createMany({
    data: optionsData,
    skipDuplicates: true,
  });

  // Fetch the created options to get their IDs
  const fetchedOptions = await prismadb.option.findMany({
    where: { productId: productId },
  });

  // Prepare data for optionValues with the correct option IDs
  const optionValuesData: any[] = [];
  fetchedOptions.forEach((option) => {
    const matchingOption = data.options.find(
      (opt: any) => opt.name === option.name
    );
    if (matchingOption) {
      optionValuesData.push(
        ...matchingOption.values.map((value: any) => ({
          value: value.value,
          optionId: option.id,
        }))
      );
    }
  });

  // Create option values in bulk
  if (optionValuesData.length) {
    await prismadb.optionValue.createMany({
      data: optionValuesData,
      skipDuplicates: true,
    });
  }

  // Fetch and return the created option values
  const optionValues = await prismadb.optionValue.findMany({
    where: {
      optionId: {
        in: fetchedOptions.map((option) => option.id),
      },
    },
  });

  return optionValues;
}
