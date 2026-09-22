"use client";

import { IconBell } from "@tabler/icons-react";
import { useAppSearch } from "@/components/app/AppSearchContext";
import { AppUserAvatar } from "@/components/app/AppUser";
import { AppLogo } from "@/components/shared/AppLogo";
import { SearchInput } from "@/components/shared/SearchInput";
import { ThemeToggleButton } from "@/components/shared/ThemeToggleButton";

export function DashboardTopbar() {
  const { searchQuery, setSearchQuery } = useAppSearch();

  return (
    <header className="app-topbar">
      <AppLogo />
      <div className="app-topbar-sep" />
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      <div className="app-topbar-right">
        <button type="button" className="app-icon-btn" aria-label="Notifications">
          <IconBell size={16} />
          <span className="app-notif-dot" />
        </button>
        <ThemeToggleButton />
        <AppUserAvatar />
      </div>
    </header>
  );
}
