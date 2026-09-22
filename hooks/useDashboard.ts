"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSearch } from "@/components/app/AppSearchContext";
import { DEMO_ACTIVITY, DEMO_STATS, DEMO_SYSTEMS } from "@/lib/demoData";
import { ROUTES } from "@/lib/routes";
import {
  createDraftDesignSystem,
  deleteSystem,
  hydrateSystemFromTokenStorage,
  loadDeletedSystemIds,
  loadStoredSystems,
} from "@/lib/systemStorage";
import type { DesignSystem, NewSystemData, SystemFilter } from "@/types/dashboard";

function withoutDeleted(systems: DesignSystem[]): DesignSystem[] {
  const deleted = new Set(loadDeletedSystemIds());
  if (deleted.size === 0) return systems;
  return systems.filter((s) => !deleted.has(s.id));
}

function mergeSystems(stored: DesignSystem[], demo: DesignSystem[]): DesignSystem[] {
  const storedIds = new Set(stored.map((s) => s.id));
  return withoutDeleted([...stored, ...demo.filter((s) => !storedIds.has(s.id))]);
}

/** Apply editor token colors onto every dashboard row's swatch strip. */
function withLivePalettes(systems: DesignSystem[]): DesignSystem[] {
  return systems.map(hydrateSystemFromTokenStorage);
}

export function useDashboard() {
  const router = useRouter();
  const { searchQuery } = useAppSearch();
  const [systems, setSystems] = useState<DesignSystem[]>(DEMO_SYSTEMS);
  const [filter, setFilter] = useState<SystemFilter>("all");
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const stored = loadStoredSystems();
    const next = withLivePalettes(
      stored.length > 0
        ? mergeSystems(stored, DEMO_SYSTEMS)
        : withoutDeleted(DEMO_SYSTEMS)
    );
    setSystems(next);
    if (stored.length > 0) {
      setSelectedSystemId(stored[0]?.id ?? null);
    }
  }, []);

  const filteredSystems = useMemo(() => {
    return systems.filter((system) => {
      const matchesSearch =
        !searchQuery ||
        system.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "published" && system.status === "published") ||
        (filter === "draft" && system.status === "draft") ||
        (filter === "pro" && system.plan === "pro");

      return matchesSearch && matchesFilter;
    });
  }, [systems, searchQuery, filter]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const selectSystem = (id: string) => {
    setSelectedSystemId(id);
  };

  const openEditor = (id: string) => {
    setSelectedSystemId(id);
    router.push(ROUTES.editor(id));
  };

  const openSystemView = (id: string) => {
    setSelectedSystemId(id);
    router.push(ROUTES.systemView(id));
  };

  const deleteSystemById = (id: string) => {
    deleteSystem(id);
    setSystems((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (selectedSystemId === id) {
        setSelectedSystemId(next[0]?.id ?? null);
      }
      return next;
    });
  };

  const addSystem = (data: NewSystemData) => {
    const { systemId, system } = createDraftDesignSystem({
      name: data.name,
      brandColor: data.brandColor,
    });
    setSystems((prev) => [system, ...prev]);
    setSelectedSystemId(systemId);
    closeModal();
    router.push(ROUTES.editor(systemId));
  };

  return {
    systems: filteredSystems,
    allSystems: systems,
    activity: DEMO_ACTIVITY,
    stats: DEMO_STATS,
    filter,
    setFilter,
    selectedSystemId,
    selectSystem,
    openEditor,
    openSystemView,
    deleteSystemById,
    isModalOpen,
    openModal,
    closeModal,
    addSystem,
  };
}
