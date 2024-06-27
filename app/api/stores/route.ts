import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";
import { generateUniqueID } from "@/lib/queries";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    const body = await request.json();

    const id = await generateUniqueID();

    const { name, customerId, country, currency, language } = body;

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized user!" }),
        { status: 403 }
      );
    }

    /*const userData =
      (await getUserbyId(user.id)) ?? (await initUser({ role: "STORE_OWNER" }));*/

    //const newUserData = await initUser({ role: "STORE_OWNER" });

    if (!name) {
      return new NextResponse(JSON.stringify({ message: "Name is required" }), {
        status: 400,
      });
    }

    if (!customerId) {
      return new NextResponse(
        JSON.stringify({ message: "customer ID is required" }),
        { status: 400 }
      );
    }

    const store = await prismadb.store.create({
      data: {
        id: id,
        name,
        customerId,
        locale: language,
        defaultCurrency: currency,
        country: country,
        users: { connect: { id: user.id } },
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORES_POST]", error);
    return new NextResponse(JSON.stringify({ message: "Internal error" }), {
      status: 500,
    });
  }
}
