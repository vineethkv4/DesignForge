"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_SYSTEMS } from "@/lib/demoData";
import { ROUTES } from "@/lib/routes";
import {
  createDraftDesignSystem,
  deleteSystem,
  hydrateSystemFromTokenStorage,
  loadDeletedSystemIds,
  loadStoredSystems,
} from "@/lib/systemStorage";
import type { DesignSystem, NewSystemData, SystemFilter } from "@/types/dashboard";

export type SystemsSort = "updated" | "name";

function withoutDeleted(systems: DesignSystem[]): DesignSystem[] {
  const deleted = new Set(loadDeletedSystemIds());
  if (deleted.size === 0) return systems;
  return systems.filter((s) => !deleted.has(s.id));
}

function mergeSystems(stored: DesignSystem[], demo: DesignSystem[]): DesignSystem[] {
  const storedIds = new Set(stored.map((s) => s.id));
  return withoutDeleted([
    ...stored,
    ...demo.filter((s) => !storedIds.has(s.id)),
  ]);
}

function withLivePalettes(systems: DesignSystem[]): DesignSystem[] {
  return systems.map(hydrateSystemFromTokenStorage);
}

export function useSystemsPage() {
  const router = useRouter();
  const [systems, setSystems] = useState<DesignSystem[]>(DEMO_SYSTEMS);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SystemFilter>("all");
  const [sortBy, setSortBy] = useState<SystemsSort>("updated");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const stored = loadStoredSystems();
    setSystems(
      withLivePalettes(
        stored.length > 0
          ? mergeSystems(stored, DEMO_SYSTEMS)
          : withoutDeleted(DEMO_SYSTEMS)
      )
    );
  }, []);

  const counts = useMemo(() => {
    const draft = systems.filter((s) => s.status === "draft").length;
    const published = systems.filter((s) => s.status === "published").length;
    return { all: systems.length, draft, published };
  }, [systems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = systems.filter((s) => {
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      const matchF =
        filter === "all" ||
        (filter === "draft" && s.status === "draft") ||
        (filter === "published" && s.status === "published") ||
        (filter === "pro" && s.plan === "pro");
      return matchQ && matchF;
    });

    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const at = Date.parse(a.publishedAt ?? a.createdAt ?? "") || 0;
      const bt = Date.parse(b.publishedAt ?? b.createdAt ?? "") || 0;
      if (at || bt) return bt - at;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [systems, query, filter, sortBy]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditor = (id: string) => router.push(ROUTES.editor(id));
  const openSystemView = (id: string) => router.push(ROUTES.systemView(id));

  const deleteSystemById = (id: string) => {
    deleteSystem(id);
    setSystems((prev) => prev.filter((s) => s.id !== id));
  };

  const addSystem = (data: NewSystemData) => {
    const { systemId, system } = createDraftDesignSystem({
      name: data.name,
      brandColor: data.brandColor,
    });
    setSystems((prev) => [system, ...prev]);
    closeModal();
    router.push(ROUTES.editor(systemId));
  };

  const duplicateSystem = (id: string) => {
    const src = systems.find((s) => s.id === id);
    if (!src) return;
    const color = src.palette[0] ?? "#7733FF";
    const { systemId, system } = createDraftDesignSystem({
      name: `${src.name} copy`,
      brandColor: color,
    });
    setSystems((prev) => [system, ...prev]);
    router.push(ROUTES.editor(systemId));
  };

  return {
    systems: filtered,
    totalCount: systems.length,
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
  };
}
