import { decrypt, getActivePaymentConfig } from "@/lib/queries";
import { NextRequest, NextResponse } from "next/server";
import { Paystack } from "paystack-sdk";

const fetchPaystackKey = async (storeId: string) => {
  const payment = await getActivePaymentConfig(storeId);

  if (!payment) {
    throw new Error("Payment configuration not found");
  }

  const secretKey = await decrypt(payment.secretKey);
  return secretKey;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "Reference is required" },
      { status: 400 }
    );
  }

  try {
    const secretKey = await fetchPaystackKey(params.storeId);
    const paystack = new Paystack(secretKey);

    try {
      const response = await paystack.transaction.verify(reference);

      if (response.data?.status === "success") {
        return NextResponse.json(
          { success: true, amount: response.data.amount / 100 },
          { status: 200 }
        );
      } else {
        return NextResponse.json({ success: false }, { status: 400 });
      }
    } catch (error) {
      console.error("Error verifying transaction with Paystack:", error);
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching Paystack key:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payment configuration" },
      { status: 500 }
    );
  }
}
