import { AppShell } from "@/components/app/AppShell";
import "../app.css";
import "./systems.css";

export default function SystemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
