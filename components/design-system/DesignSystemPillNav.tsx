"use client";

import {
  DESIGN_SYSTEM_SECTIONS,
  type DesignSystemSectionId,
} from "@/lib/publishedView";

interface DesignSystemPillNavProps {
  active: DesignSystemSectionId;
  onNavigate: (id: DesignSystemSectionId) => void;
}

export function DesignSystemPillNav({
  active,
  onNavigate,
}: DesignSystemPillNavProps) {
  return (
    <nav className="ds-pill-nav" aria-label="Design system sections">
      <div className="ds-pill-nav-track">
        {DESIGN_SYSTEM_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={`ds-pill${active === section.id ? " on" : ""}`}
            onClick={() => onNavigate(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
