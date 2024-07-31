import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { domainId: string; storeId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthenticated user" }),
        { status: 403 }
      );
    }

    if (!params.domainId) {
      return new NextResponse(
        JSON.stringify({ message: "Domain id is required" }),
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

    const domain = await prismadb.domain.delete({
      where: {
        id: params.domainId,
      },
    });

    return NextResponse.json(domain);
  } catch (error) {
    console.log("[DOMAIN_DELETE]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
