import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";

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

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
      },
      include: {
        billboards: true,
        paymentConfigs: {
          select: {
            id: true,
            provider: true,
            publicKey: true,
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_GET]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const user = await currentUser();

    const body = await request.json();

    const {
      name,
      storeLogo,
      companyEmail,
      companyPhone,
      address,
      city,
      zipCode,
      state,
      country,
    } = body;

    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthenticated" }), {
        status: 403,
      });
    }

    if (
      !name ||
      !companyEmail ||
      !companyPhone ||
      !address ||
      !city ||
      !zipCode ||
      !state
    ) {
      return new NextResponse(
        JSON.stringify({
          message:
            "Name | companyEmail | companyPhone | address | city | state | zip code is required",
        }),
        { status: 400 }
      );
    }

    if (!params.storeId) {
      return new NextResponse(
        JSON.stringify({ message: "Store id is required" }),
        { status: 400 }
      );
    }

    const store = await prismadb.store.updateMany({
      where: {
        id: params.storeId,
      },
      data: {
        name,
        storeLogo,
        companyEmail,
        companyPhone,
        address,
        city,
        zipCode,
        state,
        country,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_PATCH]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthenticated user!" }),
        { status: 403 }
      );
    }

    if (!params.storeId) {
      return new NextResponse(
        JSON.stringify({ message: "Store id is required" }),
        { status: 400 }
      );
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_DELETE]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
