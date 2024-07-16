import prismadb from "@/lib/prismadb";
import { decrypt, getActivePaymentConfig } from "@/lib/queries";
import { NextResponse } from "next/server";
import { Paystack } from "paystack-sdk";

const fetchPaystackKey = async (storeId: string): Promise<string> => {
  const payment = await getActivePaymentConfig(storeId);
  if (!payment) {
    throw new Error("Payment configuration not found");
  }

  const secretKey = await decrypt(payment.secretKey);
  return secretKey;
};

function addressObjectToString(address: {
  address: string;
  city: string;
  zipCode: string;
  state: string;
  country: string;
}): string {
  const { address: street, city, zipCode, state, country } = address;
  return `${street}, ${city}, ${zipCode}, ${state}, ${country}`;
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { products, amount, customerId, email, phone, address } =
      await req.json();
    const origin = req.headers.get("origin") ?? "";

    if (!products || products.length === 0) {
      return new NextResponse("Products are required", { status: 400 });
    }

    if (!amount) {
      return new NextResponse("Amount is required", { status: 400 });
    }

    const secretKey = await fetchPaystackKey(params.storeId);
    const paystack = new Paystack(secretKey);

    let customer;
    if (customerId) {
      customer = await prismadb.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return new NextResponse("Customer not found", { status: 404 });
      }
    }

    const productIds = products.map((product: any) => product.id);
    const productData = await prismadb.product.findMany({
      where: { id: { in: productIds } },
    });

    if (productData.length !== productIds.length) {
      return new NextResponse("One or more products not found", {
        status: 404,
      });
    }

    const formattedProducts = products.map((product: any) => ({
      productId: product.id,
      name: product.name,
      quantity: product.variantQuantity,
      price: product.variantPrice,
      image: product.images[0].url,
    }));

    if (phone && address) {
      const formattedAddress = addressObjectToString(address);
      await prismadb.customer.update({
        where: { id: customerId },
        data: { phone, address: formattedAddress },
      });
    }

    const paymentData = {
      amount: (amount * 100).toString(), // Paystack expects amount in kobo
      email: customerId ? customer?.email : email,
      metadata: { products: formattedProducts },
      callback_url: `${origin}/checkout/success`,
    };

    const response = await paystack.transaction.initialize(paymentData);
    const authorizationUrl = response.data?.authorization_url;

    if (!authorizationUrl) {
      throw new Error("Failed to retrieve authorization URL");
    }

    return NextResponse.json({ authorizationUrl });
  } catch (error) {
    console.error("Payment initialization failed:", error);
    return new NextResponse("Payment initialization failed", { status: 500 });
  }
}
