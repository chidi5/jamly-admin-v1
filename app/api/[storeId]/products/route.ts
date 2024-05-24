import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";
import {
  createOrUpdateProduct,
  getStoreByUserId,
  validateProductData,
} from "@/lib/queries";

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });

    const body = await request.json();
    await validateProductData(body);

    if (!params.storeId) throw new Error("Store id is required");

    await getStoreByUserId(params.storeId, userId);

    const product = await prismadb.$transaction(
      (prisma) =>
        createOrUpdateProduct(
          prisma,
          { ...body, storeId: params.storeId },
          true
        ),
      {
        maxWait: 8000, // default: 2000
        timeout: 10000, // default: 5000
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
      }
    );

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("[PRODUCTS_POST]", error);
    return new NextResponse(error.message || "Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
