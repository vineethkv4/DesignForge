"use client";

import { IconLogout } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { AvatarInitial } from "@/components/shared/AvatarInitial";

interface UserAvatarMenuProps {
  name: string;
  onLogout: () => void | Promise<void>;
}

export function UserAvatarMenu({ name, onLogout }: UserAvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setOpen(false);
    await onLogout();
  };

  return (
    <div className="app-avatar-wrap" ref={wrapRef}>
      <button
        type="button"
        className="app-avatar-trigger"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
      >
        <AvatarInitial name={name} />
      </button>

      {open && (
        <div className="app-avatar-dropdown" role="menu">
          <div className="app-avatar-dropdown-header">
            <span className="app-avatar-dropdown-name">{name}</span>
            <span className="app-avatar-dropdown-label">Signed in</span>
          </div>
          <button
            type="button"
            role="menuitem"
            className="app-avatar-menu-item"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
          >
            <IconLogout size={15} stroke={1.75} />
            {isLoggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
