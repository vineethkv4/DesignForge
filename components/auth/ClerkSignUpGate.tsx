"use client";

import dynamic from "next/dynamic";
import { AuthClerkLoading } from "@/components/auth/AuthClerkLoading";

const ClerkSignUp = dynamic(
  () => import("@/components/auth/ClerkSignUp").then((mod) => mod.ClerkSignUp),
  { ssr: false, loading: () => <AuthClerkLoading /> }
);

export function ClerkSignUpGate() {
  return <ClerkSignUp />;
}
