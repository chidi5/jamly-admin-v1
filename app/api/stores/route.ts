import prismadb from "@/lib/prismadb";
import { getUser, initUser } from "@/lib/queries";
import { auth, currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const body = await request.json();

    const { name, customerId } = body;

    if (!user) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const userData =
      (await getUser(user.id)) ?? (await initUser({ role: "STORE_OWNER" }));

    //const newUserData = await initUser({ role: "STORE_OWNER" });

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!customerId) {
      return new NextResponse("customer ID is required", { status: 400 });
    }

    const store = await prismadb.store.create({
      data: {
        name,
        customerId,
        users: { connect: { id: userData?.id } },
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
