import { sendVerificationEmail } from "@/lib/mail";
import { getVerificationTokenByToken } from "@/lib/queries/verification-token";
import { generateVerificationToken } from "@/lib/tokens";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { token } = body;

  if (!token) {
    return new NextResponse("Missing email or token", { status: 400 });
  }

  try {
    const existingToken = await getVerificationTokenByToken(token);
    console.log(existingToken);
    if (!existingToken) {
      return new NextResponse("Token not found", { status: 400 });
    }

    const verificationToken = await generateVerificationToken(
      existingToken.email
    );

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return NextResponse.json({ success: "Confirmation email sent!" });
  } catch (error) {
    return new NextResponse("Something went wrong!", { status: 500 });
  }
}
