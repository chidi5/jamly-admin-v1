import { paystack } from "@/lib/paystack";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { customerId, plan } = await req.json();

  if (!customerId || !plan)
    return new NextResponse("Customer Id or plan is missing", {
      status: 400,
    });

  const subscriptionExists = await prismadb.store.findFirst({
    where: { customerId },
    include: { Subscription: true },
  });

  try {
    console.log("Creating a sub");
    const subscription = await paystack.subscription.create({
      customer: customerId,
      plan: plan,
    });
    if (subscription.status === false) {
      console.log("Error creating subscription: ", subscription.message);
      return new NextResponse(
        `Error creating subscription: ${subscription.message}`
      );
    }
    return NextResponse.json({
      //@ts-ignore
      subscriptionId: subscription.subscription_code,
    });
  } catch (error) {
    console.log("🔴 Error", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
