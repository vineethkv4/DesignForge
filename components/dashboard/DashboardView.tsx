"use client";

import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { DashboardGreeting } from "@/components/app/DashboardGreeting";
import { ActivityPanel } from "@/components/dashboard/ActivityPanel";
import { NewSystemModal } from "@/components/dashboard/NewSystemModal";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { StatCardsRow } from "@/components/dashboard/StatCardsRow";
import { SystemsPanel } from "@/components/dashboard/SystemsPanel";
import { TokenUsageChart } from "@/components/dashboard/TokenUsageChart";
import { useDashboard } from "@/hooks/useDashboard";

export function DashboardView() {
  const {
    systems,
    allSystems,
    activity,
    stats,
    filter,
    setFilter,
    selectedSystemId,
    selectSystem,
    openEditor,
    openSystemView,
    isModalOpen,
    openModal,
    closeModal,
    addSystem,
    deleteSystemById,
  } = useDashboard();

  return (
    <>
      <div className="dash-header">
        <div>
          <div className="dash-greeting">
            <DashboardGreeting />
          </div>
          <h1 className="dash-title">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="app-btn-ghost">
            <IconRefresh size={14} />
            Refresh
          </button>
          <button type="button" className="app-btn-primary" onClick={openModal}>
            <IconPlus size={14} />
            New system
          </button>
        </div>
      </div>

      <StatCardsRow stats={stats} />

      <div className="dash-content-row">
        <SystemsPanel
          systems={systems}
          filter={filter}
          selectedSystemId={selectedSystemId}
          onFilterChange={setFilter}
          onSelectSystem={selectSystem}
          onContinueEditing={openEditor}
          onViewSystem={openSystemView}
          onEditTokens={openEditor}
          onDeleteSystem={deleteSystemById}
          onNewSystem={openModal}
        />
        <ActivityPanel items={activity} />
      </div>

      <div className="dash-bottom-row">
        <QuickActions />
        <TokenUsageChart systems={allSystems} />
      </div>

      <NewSystemModal isOpen={isModalOpen} onClose={closeModal} onCreate={addSystem} />
    </>
  );
}
