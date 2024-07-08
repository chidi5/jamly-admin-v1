import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";
import {
  createOptionsAndValues,
  generateUniqueProductHandle,
  getStoreByUserId,
  validateProductData,
} from "@/lib/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse(
        JSON.stringify({ message: "Product id is required" }),
        { status: 400 }
      );
    }

    const product = await prismadb.product.findFirst({
      where: {
        OR: [
          { id: params.productId },
          { AND: [{ handle: params.productId }, { storeId: params.storeId }] },
        ],
      },
      include: {
        images: true,
        priceData: true,
        costAndProfitData: true,
        discount: true,
        stock: true,
        categories: true,
        additionalInfoSections: true,
        options: {
          include: {
            values: true,
          },
        },
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

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthenticated user!" }),
        { status: 403 }
      );
    }

    if (!params.productId) {
      return new NextResponse(
        JSON.stringify({ message: "Billboard id is required" }),
        { status: 400 }
      );
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        AND: [{ id: params.storeId }, { users: { some: { id: user.id } } }],
      },
    });

    if (!storeByUserId) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized access!" }),
        { status: 405 }
      );
    }

    const product = await prismadb.product.delete({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthenticated user!" }),
        { status: 403 }
      );
    }

    const body = await request.json();
    await validateProductData(body);

    if (!params.storeId) {
      throw new Error(JSON.stringify({ message: "Store id is required" }));
    }

    if (!params.productId) {
      throw new Error(JSON.stringify({ message: "Product id is required" }));
    }

    const store = await prismadb.store.findUnique({
      where: { id: params.storeId },
      select: { defaultCurrency: true },
    });

    if (!store) {
      return new NextResponse(JSON.stringify({ message: "Store not found" }), {
        status: 404,
      });
    }

    await getStoreByUserId(params.storeId, user.id);

    const existingProduct = await prismadb.product.findUnique({
      where: { id: params.productId },
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

    if (!existingProduct) {
      return new NextResponse(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }

    const updatedProduct = await updateProduct(
      body,
      params.productId,
      store.defaultCurrency,
      existingProduct
    );

    if (body.options) {
      await prismadb.option.deleteMany({
        where: { productId: params.productId },
      });
    }

    const optionValues = await createOptionsAndValues(body, updatedProduct.id);

    if (body.variants) {
      await updateVariants(
        body.variants,
        updatedProduct.id,
        optionValues,
        store.defaultCurrency
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("[PRODUCTS_PATCH]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}

async function updateProduct(
  body: any,
  productId: string,
  defaultCurrency: string,
  existingProduct: any
) {
  const handle =
    body.name !== existingProduct.name
      ? await generateUniqueProductHandle(body.name)
      : existingProduct.handle;

  return prismadb.product.update({
    where: { id: productId },
    data: {
      name: body.name,
      handle,
      description: body.description,
      isFeatured: body.isFeatured,
      isArchived: body.isArchived,
      manageVariants: body.manageVariants,
      weight: body.weight,
      priceData: {
        update: {
          price: body.price,
          discountedPrice: body.discountedPrice ?? null,
          currency: defaultCurrency,
        },
      },
      costAndProfitData: body.costProfit
        ? {
            upsert: {
              create: {
                itemCost: body.costProfit.itemCost ?? 0,
                profit: body.costProfit.profit,
                profitMargin: body.costProfit.profitMargin,
                formattedItemCost: formatCurrency(
                  body.costProfit.itemCost,
                  defaultCurrency
                ),
                formattedProfit: formatCurrency(
                  body.costProfit.profit,
                  defaultCurrency
                ),
              },
              update: {
                itemCost: body.costProfit.itemCost ?? 0,
                profit: body.costProfit.profit,
                profitMargin: body.costProfit.profitMargin,
                formattedItemCost: formatCurrency(
                  body.costProfit.itemCost,
                  defaultCurrency
                ),
                formattedProfit: formatCurrency(
                  body.costProfit.profit,
                  defaultCurrency
                ),
              },
            },
          }
        : undefined,
      stock: body.manageVariants
        ? existingProduct.stock
          ? { delete: true }
          : undefined
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
          : undefined,
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
}

async function updateVariants(
  variants: any[],
  productId: string,
  optionValues: any[],
  defaultCurrency: string
) {
  await prismadb.variant.deleteMany({
    where: { productId: productId },
  });

  for (const variant of variants) {
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
            discountedPrice: variant.discountedPrice,
            currency: defaultCurrency,
          },
        },
        costAndProfitData: variant.costofgoods
          ? {
              create: {
                itemCost: variant.costofgoods,
                formattedItemCost: formatCurrency(
                  variant.costofgoods,
                  defaultCurrency
                ),
                profit: calculateProfit(variant, defaultCurrency),
                profitMargin: calculateProfitMargin(variant),
                formattedProfit: formatCurrency(
                  calculateProfit(variant, defaultCurrency),
                  defaultCurrency
                ),
              },
            }
          : undefined,
        stock:
          variant.inventory || variant.status
            ? {
                create: {
                  trackInventory: variant.inventory ? true : false,
                  quantity: variant.inventory ?? 0,
                  inventoryStatus: variant.status ?? "IN_STOCK",
                },
              }
            : undefined,
        product: { connect: { id: productId } },
        selectedOptions: { connect: selectedOptionValues },
      },
    });
  }
}

function formatCurrency(value: number | undefined, currency: string): string {
  return value !== undefined ? currency + value.toFixed(2) : currency + "0.00";
}

function calculateProfit(variant: any, defaultCurrency: string): number {
  return (variant.discountedPrice ?? variant.price) - variant.costofgoods;
}

function calculateProfitMargin(variant: any): number {
  return (
    ((variant.price - variant.costofgoods) /
      (variant.discountedPrice ?? variant.price)) *
    100
  );
}

function getSelectedOptionValues(title: string, optionValues: any[]): any[] {
  return title.includes("|")
    ? title.split("|").map((value: string) => {
        const matchingOptionValue = optionValues.find(
          (data) => data!.value === value
        );
        if (!matchingOptionValue) {
          throw new Error(
            JSON.stringify({ message: `Option value "${value}" not found` })
          );
        }
        return { id: matchingOptionValue.id };
      })
    : [{ id: optionValues.find((data) => data!.value === title)!.id }];
}
