import { IconTrash } from "@tabler/icons-react";
import { Badge } from "@/components/shared/Badge";
import { PaletteSwatches } from "@/components/shared/PaletteSwatches";
import type { DesignSystem } from "@/types/dashboard";

interface SystemRowProps {
  system: DesignSystem;
  isSelected: boolean;
  onSelect: () => void;
  onContinueEditing: () => void;
  onViewSystem: () => void;
  onEditTokens: () => void;
  onDelete: () => void;
}

export function SystemRow({
  system,
  isSelected,
  onSelect,
  onContinueEditing,
  onViewSystem,
  onEditTokens,
  onDelete,
}: SystemRowProps) {
  const meta = `Updated ${system.updatedAt} · ${system.tokenCount} tokens`;
  const isDraft = system.status === "draft";

  return (
    <div
      className={`dash-sys-row group${isSelected ? " selected" : ""}`}
      onClick={onSelect}
    >
      <PaletteSwatches colors={system.palette} />
      <div className="min-w-0 flex-1">
        <div className="dash-sys-name">{system.name}</div>
        <div className="dash-sys-meta">{meta}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Badge variant={system.status}>
          {system.status === "published" ? "Published" : "Draft"}
        </Badge>
        <Badge variant={system.plan}>{system.plan === "pro" ? "Pro" : "Free"}</Badge>
      </div>
      <div className="dash-sys-actions">
        {isDraft ? (
          <button
            type="button"
            className="app-btn-primary dash-sys-cta"
            onClick={(e) => {
              e.stopPropagation();
              onContinueEditing();
            }}
          >
            Continue editing
          </button>
        ) : (
          <>
            <button
              type="button"
              className="app-btn-primary dash-sys-cta"
              onClick={(e) => {
                e.stopPropagation();
                onViewSystem();
              }}
            >
              View design system
            </button>
            <button
              type="button"
              className="app-btn-ghost dash-sys-cta"
              onClick={(e) => {
                e.stopPropagation();
                onEditTokens();
              }}
            >
              Edit tokens
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        className="dash-sys-delete"
        aria-label={`Delete ${system.name}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <IconTrash size={15} stroke={1.75} />
      </button>
    </div>
  );
}
