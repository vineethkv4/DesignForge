/** Demo login — no backend; accepted on /sign-in in demo mode. */
export const DEMO_CREDENTIALS = {
  email: "demo@designforge.app",
  password: "demo1234",
} as const;

export const DEMO_CREDENTIALS_LABEL = `${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`;
