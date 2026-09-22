"use client";

export type CategoryPanelTab = "tokens" | "scale" | "aliases";

export function TokenCategoryTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: CategoryPanelTab[];
  active: CategoryPanelTab;
  onChange: (tab: CategoryPanelTab) => void;
}) {
  if (tabs.length === 0) return null;

  return (
    <div className="ed-cp-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`ed-cp-tab${active === tab ? " on" : ""}`}
          onClick={() => onChange(tab)}
        >
          {tab[0].toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}

/** Categories that support Tokens / Aliases (and Scale when applicable). */
export function categoryPanelTabs(
  category: string
): CategoryPanelTab[] {
  if (category === "color") return ["tokens", "scale", "aliases"];
  if (
    category === "typography" ||
    category === "shadow" ||
    category === "themes"
  ) {
    return ["tokens", "aliases"];
  }
  return [];
}
