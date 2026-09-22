import Link from "next/link";
import { getSystemName } from "@/lib/systemStorage";

interface EditorBreadcrumbProps {
  systemId: string;
}

export function EditorBreadcrumb({ systemId }: EditorBreadcrumbProps) {
  const systemName = getSystemName(systemId);

  return (
    <nav className="ed-breadcrumb" aria-label="Breadcrumb">
      <Link href="/dashboard">Dashboard</Link>
      <span className="ed-breadcrumb-sep" aria-hidden>
        /
      </span>
      <span className="ed-breadcrumb-current">{systemName}</span>
    </nav>
  );
}
