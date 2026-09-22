"use client";

import type { IconProps } from "@tabler/icons-react";
import {
  IconBox,
  IconCircleDot,
  IconComponents,
  IconLayoutGrid,
  IconPalette,
  IconShadow,
  IconTypography,
} from "@tabler/icons-react";
import { ENABLED_CATEGORIES } from "@/lib/config/categories";
import type { TokenCategory } from "@/types/tokens";

const CATEGORY_DEFINITIONS: {
  id: TokenCategory;
  label: string;
  icon: React.ComponentType<IconProps>;
  section: "primary" | "secondary";
}[] = [
  { id: "color", label: "Colors", icon: IconPalette, section: "primary" },
  { id: "typography", label: "Typography", icon: IconTypography, section: "primary" },
  { id: "spacing", label: "Spacing", icon: IconLayoutGrid, section: "primary" },
  { id: "radius", label: "Radius", icon: IconCircleDot, section: "primary" },
  { id: "shadow", label: "Shadows", icon: IconShadow, section: "primary" },
  { id: "themes", label: "Themes", icon: IconBox, section: "secondary" },
  { id: "components", label: "Components", icon: IconComponents, section: "secondary" },
];

const enabledSet = new Set<TokenCategory>(ENABLED_CATEGORIES);
const visibleCategories = CATEGORY_DEFINITIONS.filter((c) => enabledSet.has(c.id));
const primaryCategories = visibleCategories.filter((c) => c.section === "primary");
const secondaryCategories = visibleCategories.filter((c) => c.section === "secondary");

interface LeftIconRailProps {
  active: TokenCategory;
  onSelect: (category: TokenCategory) => void;
}

export function LeftIconRail({ active, onSelect }: LeftIconRailProps) {
  return (
    <nav className="ed-rail" aria-label="Token categories">
      {primaryCategories.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`ed-rail-btn${active === id ? " active" : ""}`}
          onClick={() => onSelect(id)}
          aria-label={label}
        >
          <Icon size={17} />
          <span className="ed-rail-tip">{label}</span>
        </button>
      ))}

      {secondaryCategories.length > 0 && (
        <>
          <div className="ed-rail-divider" aria-hidden />
          {secondaryCategories.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`ed-rail-btn${active === id ? " active" : ""}`}
              onClick={() => onSelect(id)}
              aria-label={label}
            >
              <Icon size={17} />
              <span className="ed-rail-tip">{label}</span>
            </button>
          ))}
        </>
      )}
    </nav>
  );
}
