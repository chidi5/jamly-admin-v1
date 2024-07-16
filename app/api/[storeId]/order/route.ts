import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

function addressObjectToString(address: {
  address: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
}) {
  const { address: street, city, zipCode, state, country } = address;
  return `${street}, ${city}, ${zipCode}, ${state}, ${country}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await request.json();
    const { products, address, phone, customerId } = body;

    if (!products || products.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "Products are required" }),
        { status: 400 }
      );
    }

    if (!params.storeId) {
      return new NextResponse(
        JSON.stringify({ message: "Store ID is required" }),
        { status: 400 }
      );
    }

    if (!phone) {
      return new NextResponse(
        JSON.stringify({ message: "Phone is required" }),
        { status: 400 }
      );
    }

    if (!address) {
      return new NextResponse(
        JSON.stringify({ message: "Address is required" }),
        { status: 400 }
      );
    }

    const formattedAddress = addressObjectToString(address);

    const productData = await prismadb.product.findMany({
      where: {
        id: {
          in: products.map((product: { id: string }) => product.id),
        },
      },
      include: {
        variants: true,
        stock: true,
      },
    });

    if (productData.length !== products.length) {
      return new NextResponse(
        JSON.stringify({ message: "One or more products not found" }),
        { status: 404 }
      );
    }

    const orderItemsData = await Promise.all(
      products.map(
        async (product: {
          id: string;
          variant?: string;
          variantQuantity: number;
          variantPrice: number;
        }) => {
          const productInfo = productData.find((p) => p.id === product.id);

          if (!productInfo) {
            throw new Error(`Product with id ${product.id} not found`);
          }

          let stock;
          if (
            productInfo.variants &&
            productInfo.variants.length > 0 &&
            product.variant
          ) {
            const variant = productInfo.variants.find(
              (v) => v.id === product.variant
            );

            if (!variant) {
              throw new Error(
                `Variant with id ${product.variant} not found for product ${product.id}`
              );
            }

            stock = await prismadb.stock.findUnique({
              where: { variantId: product.variant },
            });

            if (!stock) {
              throw new Error(`Stock not found for variant ${variant.id}`);
            }

            if (
              stock.trackInventory &&
              stock.quantity! < product.variantQuantity
            ) {
              throw new Error(
                `Insufficient stock for variant ${variant.id} of product ${product.id}`
              );
            }
          } else {
            stock = await prismadb.stock.findUnique({
              where: { productId: product.id },
            });

            if (!stock) {
              throw new Error(`Stock not found for product ${product.id}`);
            }

            if (
              stock.trackInventory &&
              stock.quantity! < product.variantQuantity
            ) {
              throw new Error(`Insufficient stock for product ${product.id}`);
            }
          }
          return {
            product: {
              connect: { id: product.id },
            },
            variant: product.variant
              ? {
                  connect: { id: product.variant },
                }
              : undefined,
            quantity: product.variantQuantity,
            price: product.variantPrice,
          };
        }
      )
    );

    const order = await prismadb.order.create({
      data: {
        storeId: params.storeId,
        isPaid: true,
        customerId: customerId || null,
        phone,
        address: formattedAddress,
        status: "PROCESSING",
        orderItems: {
          create: orderItemsData,
        },
      },
    });

    // Reduce stock after order is created
    await Promise.all(
      products.map(
        async (product: {
          id: string;
          variant?: string;
          variantQuantity: number;
        }) => {
          let stock;
          if (product.variant) {
            stock = await prismadb.stock.findUnique({
              where: { variantId: product.variant },
            });

            if (stock?.trackInventory) {
              await prismadb.stock.update({
                where: { variantId: product.variant },
                data: { quantity: { decrement: product.variantQuantity } },
              });

              if (stock.quantity! - product.variantQuantity <= 0) {
                await prismadb.stock.update({
                  where: { variantId: product.variant },
                  data: { inventoryStatus: "OUT_OF_STOCK" },
                });
              }
            } else {
              await prismadb.stock.update({
                where: { variantId: product.variant },
                data: { inventoryStatus: "OUT_OF_STOCK" },
              });
            }
          } else {
            stock = await prismadb.stock.findUnique({
              where: { productId: product.id },
            });

            if (stock?.trackInventory) {
              await prismadb.stock.update({
                where: { productId: product.id },
                data: { quantity: { decrement: product.variantQuantity } },
              });

              if (stock.quantity! - product.variantQuantity <= 0) {
                await prismadb.stock.update({
                  where: { productId: product.id },
                  data: { inventoryStatus: "OUT_OF_STOCK" },
                });
              }
            } else {
              await prismadb.stock.update({
                where: { productId: product.id },
                data: { inventoryStatus: "OUT_OF_STOCK" },
              });
            }
          }
        }
      )
    );

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("[ORDER_POST]", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      {
        status: 500,
      }
    );
  }
}
