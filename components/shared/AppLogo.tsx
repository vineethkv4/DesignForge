import Link from "next/link";
import { Logo } from "@/components/landing/Logo";

interface AppLogoProps {
  href?: string;
}

export function AppLogo({ href = "/dashboard" }: AppLogoProps) {
  return (
    <Link href={href} className="app-topbar-logo">
      <Logo size={26} />
      <span className="app-topbar-brand">DesignForge</span>
    </Link>
  );
}
