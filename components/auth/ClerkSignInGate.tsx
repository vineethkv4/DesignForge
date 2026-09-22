"use client";

import dynamic from "next/dynamic";
import { AuthClerkLoading } from "@/components/auth/AuthClerkLoading";

const ClerkSignIn = dynamic(
  () => import("@/components/auth/ClerkSignIn").then((mod) => mod.ClerkSignIn),
  { ssr: false, loading: () => <AuthClerkLoading /> }
);

export function ClerkSignInGate() {
  return <ClerkSignIn />;
}
