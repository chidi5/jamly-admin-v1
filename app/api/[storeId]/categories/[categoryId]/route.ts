import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string; storeId: string } }
) {
  try {
    if (!params.categoryId) {
      return new NextResponse(
        JSON.stringify({ message: "Category id is required" }),
        { status: 400 }
      );
    }

    const category = await prismadb.category.findFirst({
      where: {
        OR: [
          { id: params.categoryId },
          { AND: [{ handle: params.categoryId }, { storeId: params.storeId }] },
        ],
      },
      include: {
        products: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string; storeId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthenticated" }), {
        status: 403,
      });
    }

    if (!params.categoryId) {
      return new NextResponse(
        JSON.stringify({ message: "Category id is required" }),
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

    const category = await prismadb.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { categoryId: string; storeId: string } }
) {
  try {
    const user = await currentUser();

    const body = await request.json();

    const { name, imageUrl, products, isFeatured } = body;

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthenticated user!" }),
        { status: 403 }
      );
    }

    if (!name) {
      return new NextResponse(
        JSON.stringify({ message: "Label is required" }),
        { status: 400 }
      );
    }

    if (!params.categoryId) {
      return new NextResponse(
        JSON.stringify({ message: "Category ID is required" }),
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

    const category = await prismadb.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        isFeatured,
        imageUrl: imageUrl || null,
        products: {
          set: products?.map((id: string) => ({ id })),
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
