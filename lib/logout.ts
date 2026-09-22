import { API_ROUTES, ROUTES } from "@/lib/routes";

export async function clearSessionAndRedirect(): Promise<void> {
  try {
    await fetch(API_ROUTES.logout, {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    /* proceed to redirect even if cookie clear fails */
  }

  window.location.assign(ROUTES.landing);
}
