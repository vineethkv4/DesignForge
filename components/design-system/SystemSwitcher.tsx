"use client";

import { IconChevronDown } from "@tabler/icons-react";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import type { DesignSystem } from "@/types/dashboard";

interface SystemSwitcherProps {
  currentId: string;
  currentName: string;
  systems: DesignSystem[];
}

export function SystemSwitcher({
  currentId,
  currentName,
  systems,
}: SystemSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="ds-switcher" ref={rootRef}>
      <button
        type="button"
        className="ds-switcher-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ds-topbar-name">{currentName}</span>
        <IconChevronDown size={14} className="ds-switcher-chevron" />
      </button>

      {open && (
        <ul
          id={listId}
          className="ds-switcher-menu"
          role="listbox"
          aria-label="Published design systems"
        >
          {systems.length === 0 ? (
            <li className="ds-switcher-empty">No other published systems</li>
          ) : (
            systems.map((sys) => {
              const active = sys.id === currentId;
              const swatch = sys.palette[0] ?? "#7733FF";
              return (
                <li key={sys.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    className={`ds-switcher-item${active ? " on" : ""}`}
                    disabled={active}
                    onClick={() => {
                      if (active) return;
                      setOpen(false);
                      router.push(ROUTES.systemView(sys.id));
                    }}
                  >
                    <span
                      className="ds-switcher-swatch"
                      style={{ background: swatch }}
                      aria-hidden
                    />
                    <span className="ds-switcher-item-name">{sys.name}</span>
                    {active && (
                      <span className="ds-switcher-active">Current</span>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
