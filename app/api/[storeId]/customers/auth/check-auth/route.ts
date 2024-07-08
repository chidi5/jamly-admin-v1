// pages/api/check-auth.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("token");

  if (!tokenCookie || !tokenCookie.value) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const token = tokenCookie.value;

  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ["RS256"] });
    return NextResponse.json({ user: decoded });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
