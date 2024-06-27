import { currentUser } from "@/hooks/use-current-user";
import prismadb from "@/lib/prismadb";
import { encrypt } from "@/lib/queries";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { paymentConfigId: string; storeId: string } }
) {
  try {
    const user = await currentUser();

    const body = await request.json();

    const { provider, publicKey, secretKey, isActive } = body;

    const encryptedSecretKey = await encrypt(secretKey);

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthenticated user!" }),
        { status: 403 }
      );
    }

    if (!provider) {
      return new NextResponse("Provider is required", { status: 400 });
    }

    if (!publicKey) {
      return new NextResponse(
        JSON.stringify({ message: "Public key is required" }),
        { status: 400 }
      );
    }

    if (!secretKey) {
      return new NextResponse(
        JSON.stringify({ message: "Secret key is required" }),
        { status: 400 }
      );
    }

    if (!params.paymentConfigId) {
      return new NextResponse(
        JSON.stringify({ message: "Payment Config. ID is required" }),
        {
          status: 400,
        }
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
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized access!" }),
        { status: 405 }
      );
    }

    const result = await prismadb.$transaction([
      // Deactivate all existing payment configurations for the store
      prismadb.paymentConfig.updateMany({
        where: { storeId: params.storeId },
        data: { isActive: false },
      }),

      prismadb.paymentConfig.update({
        where: {
          id: params.paymentConfigId,
        },
        data: {
          provider,
          publicKey,
          secretKey: JSON.stringify(encryptedSecretKey),
          isActive: true,
        },
      }),
    ]);

    const paymentConfig = result[1];

    return NextResponse.json(paymentConfig);
  } catch (error) {
    console.log("Error creating payment configuration:", error);
    return new NextResponse(
      JSON.stringify({ message: "Failed to create payment configuration" }),
      {
        status: 500,
      }
    );
  }
}
