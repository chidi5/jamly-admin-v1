import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";

export async function GET(
  request: NextRequest,
  { params }: { params: { billboardId: string } }
) {
  try {
    if (!params.billboardId) {
      return new NextResponse(
        JSON.stringify({ message: "Billboard id is required" }),
        { status: 400 }
      );
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_GET]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { billboardId: string; storeId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthenticated user" }),
        { status: 403 }
      );
    }

    if (!params.billboardId) {
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

    const billboard = await prismadb.billboard.delete({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { billboardId: string; storeId: string } }
) {
  try {
    const user = await currentUser();

    const body = await request.json();

    const { label, isBanner, imageUrl } = body;

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthenticated" }), {
        status: 403,
      });
    }

    if (!label) {
      return new NextResponse(
        JSON.stringify({ message: "Label is required" }),
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return new NextResponse(
        JSON.stringify({ message: "Image URL is required" }),
        { status: 400 }
      );
    }

    if (!params.billboardId) {
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

    const billboard = await prismadb.billboard.update({
      where: {
        id: params.billboardId,
      },
      data: {
        label,
        isBanner,
        imageUrl,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
