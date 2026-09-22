"use client";

import {
  IconMoodEmpty,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { NewSystemModal } from "@/components/dashboard/NewSystemModal";
import { SystemCard } from "@/components/systems/SystemCard";
import { useSystemsPage } from "@/hooks/useSystemsPage";

export function DesignSystemsPage() {
  const {
    systems,
    totalCount,
    counts,
    query,
    setQuery,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    isModalOpen,
    openModal,
    closeModal,
    openEditor,
    openSystemView,
    deleteSystemById,
    addSystem,
    duplicateSystem,
  } = useSystemsPage();

  return (
    <div className="syslib-page">
      <div className="syslib-page-hd">
        <div>
          <h1 className="syslib-page-title">Design systems</h1>
          <p className="syslib-page-sub">
            Every system you&apos;re building, draft or published — {totalCount}{" "}
            total.
          </p>
        </div>
        <button type="button" className="app-btn-primary" onClick={openModal}>
          <IconPlus size={14} />
          New design system
        </button>
      </div>

      <div className="syslib-ctrl-row">
        <div className="syslib-ctrl-search">
          <IconSearch size={13} style={{ color: "var(--app-text-muted)" }} />
          <input
            type="search"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="syslib-filter-tabs">
          {(
            [
              ["all", "All", counts.all],
              ["draft", "Draft", counts.draft],
              ["published", "Published", counts.published],
            ] as const
          ).map(([id, label, cnt]) => (
            <button
              key={id}
              type="button"
              className={`syslib-filter-tab${filter === id ? " on" : ""}`}
              onClick={() => setFilter(id)}
            >
              {label} <span className="cnt">{cnt}</span>
            </button>
          ))}
        </div>
        <select
          className="syslib-sort-select"
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value === "name" ? "name" : "updated")
          }
        >
          <option value="updated">Recently updated</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {systems.length === 0 ? (
        <div className="syslib-empty">
          <IconMoodEmpty size={32} />
          <h3>No systems match this view</h3>
          <p>Try a different search term or switch the status filter.</p>
          <button type="button" className="app-btn-primary" onClick={openModal}>
            <IconPlus size={14} />
            New design system
          </button>
        </div>
      ) : (
        <div className="syslib-grid">
          {systems.map((system) => (
            <SystemCard
              key={system.id}
              system={system}
              onView={() => openSystemView(system.id)}
              onEdit={() => openEditor(system.id)}
              onDuplicate={() => duplicateSystem(system.id)}
              onDelete={() => {
                if (
                  window.confirm(
                    `Delete "${system.name}"? This can't be undone.`
                  )
                ) {
                  deleteSystemById(system.id);
                }
              }}
            />
          ))}
        </div>
      )}

      <NewSystemModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreate={addSystem}
      />
    </div>
  );
}
