import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";
import { generateUniqueCategoryHandle } from "@/lib/queries";

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const user = await currentUser();

    const body = await request.json();

    const { name, imageUrl, products, isFeatured } = body;

    const handle = await generateUniqueCategoryHandle(name);

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthenticated user!" }),
        { status: 403 }
      );
    }

    if (!name) {
      return new NextResponse(JSON.stringify({ message: "Name is required" }), {
        status: 400,
      });
    }

    if (!params.storeId) {
      return new NextResponse(
        JSON.stringify({ message: "Store id is required" }),
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

    const category = await prismadb.category.create({
      data: {
        name,
        handle,
        isFeatured: isFeatured || false,
        imageUrl: imageUrl || null,
        products:
          products && products.length > 0
            ? {
                connect: products.map((productId: string) => ({
                  id: productId,
                })),
              }
            : undefined,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORIES_POST]", error);
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
    if (!params.storeId) {
      return new NextResponse(
        JSON.stringify({ message: "Store id is required" }),
        { status: 400 }
      );
    }

    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
