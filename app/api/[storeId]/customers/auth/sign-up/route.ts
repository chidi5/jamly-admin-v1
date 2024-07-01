import prismadb from "@/lib/prismadb";
import { getCustomerbyEmail } from "@/lib/queries/user";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, storeId } =
      await request.json();

    const existingCustomer = await getCustomerbyEmail(email);

    if (existingCustomer) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prismadb.customer.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        stores: {
          connect: { id: storeId },
        },
      },
      include: {
        stores: true,
      },
    });

    return NextResponse.json({ success: "Customer created!", customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
