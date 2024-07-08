import { NextRequest, NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

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

    console.log({ body });

    if (!products || products.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "Products are required" }),
        { status: 400 }
      );
    }

    if (!customerId) {
      return new NextResponse(
        JSON.stringify({ message: "Customer ID is required" }),
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
    });

    if (productData.length !== products.length) {
      return new NextResponse(
        JSON.stringify({ message: "One or more products not found" }),
        { status: 404 }
      );
    }

    const order = await prismadb.order.create({
      data: {
        storeId: params.storeId,
        isPaid: true,
        customerId,
        phone,
        address: formattedAddress,
        status: "PROCESSING",
        orderItems: {
          create: products.map(
            (product: { id: string; variantPrice: number }) => ({
              product: {
                connect: { id: product.id },
              },
              price: product.variantPrice,
            })
          ),
        },
      },
    });

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
