import bcrypt from "bcryptjs";
import { getCustomerbyEmail } from "@/lib/queries/user";
import jwt from "jsonwebtoken";
import { AuthError } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const parseKey = (key: string) => {
  return key.split("\\n").join("\n");
};

const privateKey = parseKey(process.env.JWT_SECRET!);

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
      privateKey,
      { algorithm: "RS256", expiresIn: "2d" }
    );

    const response = NextResponse.json(
      { success: "Customer signed in!", token },
      { status: 200 }
    );

    // const twoDays = 24 * 60 * 60 * 1000 * 2;

    // response.cookies.set("auth-session", token, {
    //   domain: ".google.com",
    //   sameSite: "none",
    //   secure: true,
    //   path: "/",
    //   expires: new Date(Date.now() + twoDays),
    // });

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
    console.log({ error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
