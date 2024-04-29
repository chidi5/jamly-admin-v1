import { subscriptionCreate, subscriptionCreated } from "@/lib/paystack/action";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.text();

  const API_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

  function verify(body: any, signature: string): boolean {
    const hash = crypto
      .createHmac("sha512", API_SECRET_KEY)
      .update(body, "utf-8")
      .digest("hex");
    return hash === signature;
  }
  try {
    const eventData = JSON.parse(body);
    const signature = request.headers.get("x-paystack-signature")!;

    if (!verify(body, signature)) {
      return new NextResponse("Webhook Error", { status: 400 });
    }

    switch (eventData.event) {
      case "charge.success": {
        const data = eventData.data;

        if (data.status === "success") {
          const subscription = await subscriptionCreate(
            data.customer.id,
            data.customer.customer_code as string
          );
          console.log("CREATED FROM WEBHOOK 💳", subscription);
        } else {
          console.log(
            "SKIPPED AT CREATED FROM WEBHOOK 💳 because subscription status is not active",
            data
          );
          break;
        }
      }
      case "subscription.create": {
        const subscription = eventData.data;

        if (subscription.status === "active") {
          await subscriptionCreated(
            subscription,
            subscription.customer.customer_code as string
          );
          console.log("CREATED FROM WEBHOOK 💳", subscription);
        } else {
          console.log(
            "SKIPPED AT CREATED FROM WEBHOOK 💳 because subscription status is not active",
            subscription
          );
          break;
        }
      }
      default:
        console.log("👉🏻 Unhandled relevant event!", eventData.event);
    }

    return NextResponse.json(
      {
        webhookActionReceived: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse("🔴 Webhook Error", { status: 400 });
  }
}
