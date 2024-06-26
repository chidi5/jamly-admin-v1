import bcrypt from "bcryptjs";
import { getCustomerbyEmail } from "@/lib/queries/user";
import jwt from "jsonwebtoken";
import { AuthError } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const origin = req.headers.get("origin") ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required!" },
        { status: 400 }
      );
    }

    const customer = await getCustomerbyEmail(email);

    if (!customer || !customer.password) {
      return NextResponse.json(
        { error: "Invalid credentials!" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, customer.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials!" },
        { status: 401 }
      );
    }

    // Create a JWT token for the session
    const token = jwt.sign(
      {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        role: "CUSTOMER",
      },
      JWT_SECRET,
      { expiresIn: "2d" }
    );

    const response = NextResponse.json(
      { success: "Customer signed in!", token },
      { status: 200 }
    );

    response.cookies.set("auth-session", token, {
      sameSite: "none",
      secure: true,
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 2,
    });

    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return NextResponse.json(
            { error: "Invalid credentials!" },
            { status: 401 }
          );
        default:
          return NextResponse.json(
            { error: "Something went wrong!" },
            { status: 500 }
          );
      }
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
