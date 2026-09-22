"use client";

import { useUser } from "@clerk/nextjs";
import { isClerkEnabled } from "@/lib/clerkEnabled";

function ClerkGreeting() {
  const { user } = useUser();
  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "there";
  return <>Good morning, {firstName}</>;
}

export function DashboardGreeting() {
  if (!isClerkEnabled()) {
    return <>Good morning, there</>;
  }
  return <ClerkGreeting />;
}
