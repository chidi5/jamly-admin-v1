import { paystack } from "@/lib/paystack";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, first_name, last_name, phone } = await req.json();

  if (!email || !first_name || !last_name || !phone)
    return new NextResponse("Missing data", {
      status: 400,
    });
  try {
    const customer = await paystack.customer.create({
      email,
      first_name,
      last_name,
      phone,
    });
    return Response.json({ customerId: customer.data?.customer_code });
  } catch (error) {
    console.log("🔴 Error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
