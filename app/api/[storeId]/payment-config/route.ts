import prismadb from "@/lib/prismadb";
import { encrypt } from "@/lib/queries";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await request.json();

    const { provider, publicKey, secretKey, isActive } = body;

    const encryptedSecretKey = await encrypt(secretKey);

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!provider) {
      return new NextResponse("Provider is required", { status: 400 });
    }

    if (!publicKey) {
      return new NextResponse("Public key is required", { status: 400 });
    }

    if (!secretKey) {
      return new NextResponse("Secret key is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        AND: [{ id: params.storeId }, { users: { some: { id: userId } } }],
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const result = await prismadb.$transaction([
      // Deactivate all existing payment configurations for the store
      prismadb.paymentConfig.updateMany({
        where: { storeId: params.storeId },
        data: { isActive: false },
      }),

      prismadb.paymentConfig.create({
        data: {
          storeId: params.storeId,
          provider,
          publicKey,
          secretKey: JSON.stringify(encryptedSecretKey),
          isActive,
        },
      }),
    ]);

    const paymentConfig = result[1];

    return NextResponse.json(paymentConfig);
  } catch (error) {
    console.log("Error creating payment configuration:", error);
    return new NextResponse("Failed to create payment configuration", {
      status: 500,
    });
  }
}
