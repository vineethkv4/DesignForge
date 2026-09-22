"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { UserAvatarMenu } from "@/components/app/UserAvatarMenu";
import { isClerkEnabled } from "@/lib/clerkEnabled";
import { clearSessionAndRedirect } from "@/lib/logout";
import { API_ROUTES, ROUTES } from "@/lib/routes";

function ClerkUserAvatar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const name = user?.firstName || user?.fullName || "Designer";

  const handleLogout = async () => {
    try {
      await fetch(API_ROUTES.logout, {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      /* continue with Clerk sign-out */
    }

    await signOut({ redirectUrl: ROUTES.landing });
  };

  return <UserAvatarMenu name={name} onLogout={handleLogout} />;
}

function DemoUserAvatar() {
  return (
    <UserAvatarMenu
      name="Designer"
      onLogout={clearSessionAndRedirect}
    />
  );
}

export function AppUserAvatar() {
  if (!isClerkEnabled()) {
    return <DemoUserAvatar />;
  }

  return <ClerkUserAvatar />;
}
