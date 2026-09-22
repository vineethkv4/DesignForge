import type { Metadata } from "next";
import { AuthProviders } from "@/components/providers/AuthProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "DesignForge — Complete Design System Generation",
  description:
    "DesignForge builds your full design system from scratch — color scales, type ramps, spacing grids, component tokens, themes, and docs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProviders>{children}</AuthProviders>
      </body>
    </html>
  );
}
