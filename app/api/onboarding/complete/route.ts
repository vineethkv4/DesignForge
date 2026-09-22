import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ONBOARDING_COOKIE } from "@/lib/onboardingCookie";
import type { SavedOnboardingData } from "@/types/onboarding";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = (await req.json()) as SavedOnboardingData;
    const client = await clerkClient();

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        systemId: data.systemId,
        systemName: data.systemName,
        brandColor: data.brandColor,
        radiusStyle: data.radiusStyle,
        spacingDensity: data.spacingDensity,
        fontPairing: data.fontPairing,
        completedAt: data.completedAt,
      },
    });

    const response = NextResponse.json({ success: true, systemId: data.systemId });
    response.cookies.set(ONBOARDING_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    console.error("Onboarding complete error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}
