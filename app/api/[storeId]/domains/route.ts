import { NextResponse } from "next/server";

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

    const domains = await prismadb.domain.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(domains);
  } catch (error) {
    console.log("[DOMAINS_GET]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
