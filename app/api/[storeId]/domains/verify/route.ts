import { NextRequest, NextResponse } from "next/server";

import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";
import dns from "dns";

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

    const wwwDomain = `www.${domain}`;
    dns.resolve(wwwDomain, "CNAME", async (err, addresses) => {
      if (err || !addresses.includes(`${params.storeId}.jamly.shop`)) {
        await prismadb.domain.update({
          where: { domain },
          data: { verificationStatus: "failed" },
        });

        return new NextResponse(
          JSON.stringify({
            message:
              "Failed to verify domain. Please ensure you have added the CNAME record correctly.",
          }),
          {
            status: 400,
          }
        );
      }

      const updatedDomain = await prismadb.domain.update({
        where: { domain },
        data: { verificationStatus: "verified" },
      });

      return NextResponse.json(updatedDomain);
    });
  } catch (error) {
    console.log("[DOMAIN_VERIFY_POST]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
