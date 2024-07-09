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

    if (!user)
      return new NextResponse(JSON.stringify({ message: "Unauthenticated" }), {
        status: 403,
      });

    const body = await request.json();
    await validateProductData(body);

    const handle = await generateUniqueProductHandle(body.name);

    if (!params.storeId)
      throw new Error(JSON.stringify({ message: "Store id is required" }));

    // Fetch the store's default currency
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

    const product = await prismadb.product.create({
      data: {
        storeId: params.storeId,
        name: body.name,
        handle: handle,
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
                    body.costProfit.itemCost?.toFixed(2) ||
                  store.defaultCurrency + "0.00",
                formattedProfit:
                  store.defaultCurrency + body.costProfit.profit?.toFixed(2) ||
                  store.defaultCurrency + "0.00",
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
            : {},
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

    const optionValues = await createOptionsAndValues(body, product.id);

    if (body.variants) {
      for (const variant of body.variants) {
        const selectedOptionValues = variant.title.includes("|")
          ? variant.title.split("|").map((value: string) => {
              const matchingOptionValue = optionValues.find(
                (data) => data!.value === value
              );
              if (!matchingOptionValue)
                throw new Error(
                  JSON.stringify({
                    message: `Option value "${value}" not found`,
                  })
                );
              return { id: matchingOptionValue.id };
            })
          : [
              {
                id: optionValues.find((data) => data!.value === variant.title)!
                  .id,
              },
            ];

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
                      store.defaultCurrency + variant.costofgoods.toFixed(2) ||
                      store.defaultCurrency + "0.00",
                    profit:
                      (body.discountedPrice!
                        ? body.discountedPrice
                        : variant.price) - variant.costofgoods,
                    profitMargin:
                      ((variant.price - variant.costofgoods) /
                        (body.discountedPrice!
                          ? body.discountedPrice
                          : variant.price)) *
                        100 ?? 0,
                    formattedProfit:
                      store.defaultCurrency +
                      (
                        (body.discountedPrice!
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

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
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
