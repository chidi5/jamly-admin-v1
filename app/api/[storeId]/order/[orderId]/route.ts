import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string; storeId: string } }
) {
  try {
    const user = await currentUser();

    const body = await request.json();

    const { status } = body;

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthenticated" }), {
        status: 403,
      });
    }

    if (!status) {
      return new NextResponse(
        JSON.stringify({ message: "Status is required" }),
        { status: 400 }
      );
    }

    if (!params.orderId) {
      return new NextResponse(
        JSON.stringify({ message: "Order id is required" }),
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

    const order = await prismadb.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDER_PATCH]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
