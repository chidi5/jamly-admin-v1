import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";
import {
  createOrUpdateProduct,
  getStoreByUserId,
  validateProductData,
} from "@/lib/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
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
        category: true,
        options: {
          include: {
            values: true,
          },
        },
        variants: {
          include: {
            selectedOptions: {
              include: {
                option: true,
              },
            }, // Include selectedOptions within variants
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        AND: [{ id: params.storeId }, { users: { some: { id: userId } } }],
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const product = await prismadb.product.delete({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });

    const body = await request.json();
    await validateProductData(body);

    if (!params.productId) throw new Error("Product id is required");
    if (!params.storeId) throw new Error("Store id is required");

    await getStoreByUserId(params.storeId, userId);

    const product = await prismadb.$transaction(
      (prisma) =>
        createOrUpdateProduct(
          prisma,
          { ...body, productId: params.productId, storeId: params.storeId },
          false
        ),
      {
        maxWait: 8000, // default: 2000
        timeout: 10000, // default: 5000
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
      }
    );

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("[PRODUCT_PATCH]", error);
    return new NextResponse(error.message || "Internal error", { status: 500 });
  }
}
