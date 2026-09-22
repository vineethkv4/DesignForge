import { isDemoMode } from "@/lib/demoMode";

const PLACEHOLDER_PATTERN = /REPLACE|your_key|xxx/i;

function hasValidPublishableKey(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return key.startsWith("pk_") && !PLACEHOLDER_PATTERN.test(key);
}

function hasValidSecretKey(): boolean {
  const key = process.env.CLERK_SECRET_KEY ?? "";
  return key.startsWith("sk_") && !PLACEHOLDER_PATTERN.test(key);
}

/** Client-safe — uses publishable key only (secret key is server-only). */
export function isClerkEnabled(): boolean {
  return !isDemoMode() && hasValidPublishableKey();
}

/** Server-only — middleware, API routes, server components. */
export function isClerkServerEnabled(): boolean {
  return isClerkEnabled() && hasValidSecretKey();
}

async function reloadClerkSession(): Promise<void> {
  if (typeof window === "undefined" || !isClerkEnabled()) return;

  const clerk = (
    window as Window & {
      Clerk?: {
        session?: { reload: () => Promise<void> };
        user?: { publicMetadata?: Record<string, unknown> };
      };
    }
  ).Clerk;

  if (!clerk?.session) return;

  for (let attempt = 0; attempt < 6; attempt++) {
    await clerk.session.reload();
    const complete = clerk.user?.publicMetadata?.onboardingComplete === true;
    if (complete) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

export { reloadClerkSession };
