import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const user = await currentUser();

    const body = await request.json();

    const { domain } = body;

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthenticated user" }),
        { status: 403 }
      );
    }

    if (!domain) {
      return new NextResponse(
        JSON.stringify({ message: "Domain is required" }),
        { status: 400 }
      );
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
      return new NextResponse(JSON.stringify({ message: "Unauthorized!" }), {
        status: 405,
      });
    }

    await prismadb.domain.create({
      data: {
        domain,
        storeId: params.storeId,
      },
    });

    const instructions = `
        To set up your custom domain, please follow these steps:

        1. Log in to your domain registrar's control panel.
        2. Find the DNS settings for your domain.
        3. Add a new CNAME record with the following details:
           - Name: www
           - Type: CNAME
           - Value: ${params.storeId}.jamly.shop

        Once you've added the CNAME record, click the 'Verify Domain' button.
      `;

    return NextResponse.json(instructions);
  } catch (error) {
    console.log("[DOMAIN_POST]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
