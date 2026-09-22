"use client";

import { AppSearchProvider } from "@/components/app/AppSearchContext";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <AppSearchProvider>
      <div className="app-root">
        <DashboardTopbar />
        <div className="app-shell">
          <AppSidebar />
          <main className="app-main">{children}</main>
        </div>
      </div>
    </AppSearchProvider>
  );
}
