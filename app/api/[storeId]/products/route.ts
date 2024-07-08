import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";
import {
  createOptionsAndValues,
  generateUniqueProductHandle,
  getStoreByUserId,
  validateProductData,
} from "@/lib/queries";

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthenticated" }), {
        status: 403,
      });
    }

    const body = await request.json();
    await validateProductData(body);

    if (!params.storeId) {
      throw new Error(JSON.stringify({ message: "Store id is required" }));
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

    const product = await createProduct(
      body,
      params.storeId,
      store.defaultCurrency
    );

    if (body.variants) {
      await createVariants(body.variants, product.id, store.defaultCurrency);
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}

async function createProduct(
  body: any,
  storeId: string,
  defaultCurrency: string
) {
  const handle = await generateUniqueProductHandle(body.name);

  return prismadb.product.create({
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
          currency: defaultCurrency,
        },
      },
      costAndProfitData: body.costProfit
        ? {
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
}

async function createVariants(
  variants: any,
  productId: string,
  defaultCurrency: string
) {
  const optionValues = await createOptionsAndValues(variants, productId);

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
          variant.status || variant.inventory
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

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryIds = searchParams.get("categoryId")?.split(",") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!params.storeId) {
      return new NextResponse(
        JSON.stringify({ message: "Store id is required" }),
        { status: 400 }
      );
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
        categories: categoryIds
          ? {
              some: {
                id: {
                  in: categoryIds,
                },
              },
            }
          : undefined,
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
            }, // Include selectedOptions within variants
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
