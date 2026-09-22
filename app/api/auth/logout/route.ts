import { NextResponse } from "next/server";
import { ONBOARDING_COOKIE } from "@/lib/onboardingCookie";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ONBOARDING_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
