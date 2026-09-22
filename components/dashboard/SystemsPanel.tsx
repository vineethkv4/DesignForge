import { Panel } from "@/components/shared/Panel";
import { SystemRow } from "@/components/dashboard/SystemRow";
import type { DesignSystem, SystemFilter } from "@/types/dashboard";

const FILTERS: { id: SystemFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "pro", label: "Pro plan" },
];

interface SystemsPanelProps {
  systems: DesignSystem[];
  filter: SystemFilter;
  selectedSystemId: string | null;
  onFilterChange: (filter: SystemFilter) => void;
  onSelectSystem: (id: string) => void;
  onContinueEditing: (id: string) => void;
  onViewSystem: (id: string) => void;
  onEditTokens: (id: string) => void;
  onDeleteSystem: (id: string) => void;
  onNewSystem: () => void;
}

export function SystemsPanel({
  systems,
  filter,
  selectedSystemId,
  onFilterChange,
  onSelectSystem,
  onContinueEditing,
  onViewSystem,
  onEditTokens,
  onDeleteSystem,
  onNewSystem,
}: SystemsPanelProps) {
  return (
    <Panel
      id="design-systems"
      title="Your design systems"
      action={
        <button type="button" className="app-panel-action" onClick={onNewSystem}>
          + New system
        </button>
      }
    >
      <div
        className="flex gap-1.5 overflow-x-auto border-b px-[18px] py-2.5"
        style={{ borderColor: "var(--app-border)" }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`app-filter-pill${filter === f.id ? " active" : ""}`}
            onClick={() => onFilterChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div>
        {systems.length === 0 ? (
          <p
            className="p-6 text-center text-[13px]"
            style={{ color: "var(--app-text-muted)" }}
          >
            No systems match this filter.
          </p>
        ) : (
          systems.map((system) => (
            <SystemRow
              key={system.id}
              system={system}
              isSelected={selectedSystemId === system.id}
              onSelect={() => onSelectSystem(system.id)}
              onContinueEditing={() => onContinueEditing(system.id)}
              onViewSystem={() => onViewSystem(system.id)}
              onEditTokens={() => onEditTokens(system.id)}
              onDelete={() => onDeleteSystem(system.id)}
            />
          ))
        )}
      </div>
    </Panel>
  );
}
