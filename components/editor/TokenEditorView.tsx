"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  IconChevronRight,
  IconPalette,
  IconTypography,
  IconLayoutGrid,
  IconCircleDot,
  IconShadow,
  IconBox,
  IconComponents,
} from "@tabler/icons-react";
import { useScrollTokenCardIntoView } from "@/hooks/useScrollTokenCardIntoView";
import { useSyncTypographyFontEmbeds } from "@/hooks/useSyncTypographyFontEmbeds";
import {
  TokenStoreProvider,
  useTokenStore,
  type TokenStoreCategory,
} from "@/stores/tokenStore";
import type { TokenCategory } from "@/types/tokens";
import { CategoryPlaceholder } from "./CategoryPlaceholder";
import { CodeOutputPanel } from "./CodeOutputPanel";
import { ColorCardsPanel } from "./ColorCardsPanel";
import { ColorScalePanel } from "./ColorScalePanel";
import { ComponentCardsPanel } from "./ComponentCardsPanel";
import { EditorTopbar } from "./EditorTopbar";
import { LeftIconRail } from "./LeftIconRail";
import { LivePreviewPanel } from "./LivePreviewPanel";
import { RadiusCardsPanel } from "./RadiusCardsPanel";
import { ShadowCardsPanel } from "./ShadowCardsPanel";
import { SpacingCardsPanel } from "./SpacingCardsPanel";
import {
  categoryPanelTabs,
  TokenCategoryTabs,
  type CategoryPanelTab,
} from "./TokenCategoryTabs";
import { TokenAliasesPanel } from "./TokenAliasesPanel";
import { ThemeAliasesPanel } from "./ThemeAliasesPanel";
import { ThemeCardsPanel } from "./ThemeCardsPanel";
import { TypographyCardsPanel } from "./TypographyCardsPanel";
import { TokenSidePanel } from "./TokenSidePanel";

const EMPTY_COPY: Record<
  Exclude<TokenStoreCategory, "theme" | "component">,
  { title: string; description: string }
> = {
  color: {
    title: "No color tokens",
    description: "Reset to restore the demo color palette.",
  },
  typography: {
    title: "No typography tokens",
    description: "Reset to restore the demo type scale.",
  },
  spacing: {
    title: "No spacing tokens",
    description: "Reset to restore the demo spacing scale.",
  },
  radius: {
    title: "No border radius tokens",
    description: "Reset to restore the demo radius scale.",
  },
  shadow: {
    title: "No shadow tokens",
    description: "Reset to restore the demo elevation scale.",
  },
};

const CAT_META: Record<
  TokenCategory,
  { title: string; icon: typeof IconPalette }
> = {
  color: { title: "Colors", icon: IconPalette },
  typography: { title: "Typography", icon: IconTypography },
  spacing: { title: "Spacing", icon: IconLayoutGrid },
  radius: { title: "Radius", icon: IconCircleDot },
  shadow: { title: "Shadows", icon: IconShadow },
  themes: { title: "Themes", icon: IconBox },
  components: { title: "Components", icon: IconComponents },
};

interface TokenEditorViewProps {
  systemId: string;
}

export function TokenEditorView({ systemId }: TokenEditorViewProps) {
  return (
    <TokenStoreProvider systemId={systemId}>
      <TokenEditorInner systemId={systemId} />
    </TokenStoreProvider>
  );
}

function TokenEditorInner({ systemId }: TokenEditorViewProps) {
  const store = useTokenStore();
  const [cpTab, setCpTab] = useState<CategoryPanelTab>("tokens");

  useSyncTypographyFontEmbeds();

  useEffect(() => {
    setCpTab("tokens");
  }, [store.state.activeCategory]);

  const scrollTargetId = useMemo(() => {
    const category = store.state.activeCategory;
    if (category === "color") return store.state.selectedColorId;
    if (category === "typography") return store.state.selectedTypographyId;
    if (category === "spacing") return store.state.selectedSpacingId;
    if (category === "radius") return store.state.selectedRadiusId;
    if (category === "shadow") return store.state.selectedShadowId;
    if (category === "themes") return store.state.selectedThemeId;
    if (category === "components") return store.state.selectedComponentId;
    return null;
  }, [
    store.state.activeCategory,
    store.state.selectedColorId,
    store.state.selectedTypographyId,
    store.state.selectedSpacingId,
    store.state.selectedRadiusId,
    store.state.selectedShadowId,
    store.state.selectedThemeId,
    store.state.selectedComponentId,
  ]);

  useScrollTokenCardIntoView(scrollTargetId);

  if (!store.hydrated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ color: "var(--ed-text-muted)" }}
      >
        Loading editor…
      </div>
    );
  }

  const category = store.state.activeCategory;
  const panelTabs = categoryPanelTabs(category);
  const activeTab =
    panelTabs.includes(cpTab) ? cpTab : ("tokens" as CategoryPanelTab);
  const meta = CAT_META[category];
  const CatIcon = meta.icon;
  const selectedName =
    category === "color"
      ? store.selectedColor?.name ?? "Semantic"
      : category === "typography"
        ? store.selectedTypography?.name ?? "Typography"
        : category === "spacing"
          ? store.selectedSpacing?.name ?? "Spacing"
          : category === "radius"
            ? store.selectedRadius?.name ?? "Radius"
            : category === "shadow"
              ? store.selectedShadow?.name ?? "Shadows"
              : category === "themes"
                ? store.selectedTheme?.name ?? "Themes"
                : category === "components"
                  ? store.selectedComponent?.name ?? "Components"
                  : meta.title;

  function emptyState(
    cat: Exclude<TokenStoreCategory, "theme" | "component">
  ): ReactNode {
    const copy = EMPTY_COPY[cat];
    return (
      <CategoryPlaceholder
        title={copy.title}
        description={copy.description}
        onReset={() => store.resetCategory(cat)}
      />
    );
  }

  let categoryContent: ReactNode;
  switch (category) {
    case "color":
      categoryContent =
        store.state.color.length === 0 ? (
          emptyState("color")
        ) : (
          <ColorCardsPanel />
        );
      break;
    case "typography":
      categoryContent =
        store.state.typography.length === 0 ? (
          emptyState("typography")
        ) : (
          <TypographyCardsPanel />
        );
      break;
    case "spacing":
      categoryContent =
        store.state.spacing.length === 0 ? (
          emptyState("spacing")
        ) : (
          <SpacingCardsPanel />
        );
      break;
    case "radius":
      categoryContent =
        store.state.radius.length === 0 ? (
          emptyState("radius")
        ) : (
          <RadiusCardsPanel />
        );
      break;
    case "shadow":
      categoryContent =
        store.state.shadow.length === 0 ? (
          emptyState("shadow")
        ) : (
          <ShadowCardsPanel />
        );
      break;
    case "themes":
      categoryContent = <ThemeCardsPanel />;
      break;
    case "components":
      categoryContent =
        store.state.component.length === 0 ? (
          <CategoryPlaceholder
            title="No component tokens"
            description="Reset to restore the demo component dimensions."
            onReset={() => store.resetCategory("component")}
          />
        ) : (
          <ComponentCardsPanel />
        );
      break;
    default: {
      const _exhaustive: never = category;
      categoryContent = null;
      void _exhaustive;
    }
  }

  let centerContent = categoryContent;
  if (activeTab === "scale" && category === "color") {
    centerContent = <ColorScalePanel />;
  } else if (activeTab === "aliases" && category === "themes") {
    centerContent = <ThemeAliasesPanel />;
  } else if (
    activeTab === "aliases" &&
    (category === "color" ||
      category === "typography" ||
      category === "shadow")
  ) {
    centerContent = <TokenAliasesPanel category={category} />;
  }

  return (
    <>
      <EditorTopbar
        systemId={systemId}
        canUndo={store.canUndo}
        canRedo={store.canRedo}
        onUndo={store.undo}
        onRedo={store.redo}
        onResetAll={store.resetAll}
      />

      <div className="ed-body">
        <LeftIconRail
          active={store.state.activeCategory}
          onSelect={store.setActiveCategory}
        />

        <TokenSidePanel />

        <section className="ed-center">
          <div className="ed-cp-topbar">
            <div className="ed-cp-breadcrumb">
              <CatIcon size={13} />
              <span>{meta.title}</span>
              <IconChevronRight size={12} />
              <span className="ed-cp-cur">{selectedName}</span>
            </div>
            <TokenCategoryTabs
              tabs={panelTabs}
              active={activeTab}
              onChange={setCpTab}
            />
          </div>
          <div className="ed-center-scroll">{centerContent}</div>
          <CodeOutputPanel
            designSystem={store.designSystem}
            activeTab={store.state.codeTab}
            namespace={store.state.namespace}
            onTabChange={store.setCodeTab}
            onNamespaceChange={store.setNamespace}
          />
        </section>

        <LivePreviewPanel />
      </div>
    </>
  );
}
