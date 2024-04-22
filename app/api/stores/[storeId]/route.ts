import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
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

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (
      !name ||
      !companyEmail ||
      !companyPhone ||
      !address ||
      !city ||
      !zipCode ||
      !state ||
      !country
    ) {
      return new NextResponse(
        "Name | companyEmail | companyPhone | address | city | state | zip code | country is required",
        { status: 400 }
      );
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
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
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
