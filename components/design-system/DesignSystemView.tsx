"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DesignSystemDocument } from "@/components/design-system/DesignSystemDocument";
import { DesignSystemHeader } from "@/components/design-system/DesignSystemHeader";
import { DesignSystemPillNav } from "@/components/design-system/DesignSystemPillNav";
import { slugifySystemName } from "@/lib/colorScale";
import { downloadDesignSystemCss } from "@/lib/downloadCss";
import { downloadElementAsPdf } from "@/lib/downloadPdf";
import {
  DESIGN_SYSTEM_SECTIONS,
  publishedToEditorSystem,
  type DesignSystemSectionId,
} from "@/lib/publishedView";
import { ROUTES } from "@/lib/routes";
import {
  canViewPublishedSystem,
  formatRelativeTime,
  getEditorNamespace,
  getSystemMeta,
  getSystemName,
  loadPublishedSnapshot,
  loadPublishedSwitcherSystems,
} from "@/lib/systemStorage";
import type { DesignSystem } from "@/types/dashboard";

interface DesignSystemViewProps {
  systemId: string;
}

const HEADER_OFFSET = 112; // sticky header + pill nav approx

export function DesignSystemView({ systemId }: DesignSystemViewProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<DesignSystemSectionId>("overview");
  const [systemName, setSystemName] = useState("Design system");
  const [publishedAtLabel, setPublishedAtLabel] = useState("Just now");
  const [snapshotJson, setSnapshotJson] = useState<string | null>(null);
  const [publishedSystems, setPublishedSystems] = useState<DesignSystem[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [namespace, setNamespace] = useState("ds");

  useEffect(() => {
    setReady(false);
    setSnapshotJson(null);
    setActive("overview");

    if (!canViewPublishedSystem(systemId)) {
      router.replace(`${ROUTES.editor(systemId)}?needConvert=1`);
      return;
    }

    const meta = getSystemMeta(systemId);
    const snap = loadPublishedSnapshot(systemId);
    if (!snap) {
      router.replace(`${ROUTES.editor(systemId)}?needConvert=1`);
      return;
    }

    const name = meta?.name ?? getSystemName(systemId);
    setSystemName(name);
    setPublishedAtLabel(
      formatRelativeTime(meta?.publishedAt ?? meta?.updatedAt)
    );
    setSnapshotJson(JSON.stringify(snap));
    setPublishedSystems(loadPublishedSwitcherSystems());
    setNamespace(
      getEditorNamespace(systemId) || slugifySystemName(name)
    );
    setReady(true);
  }, [router, systemId]);

  const designSystem = useMemo(() => {
    if (!snapshotJson) return null;
    try {
      return publishedToEditorSystem(JSON.parse(snapshotJson));
    } catch {
      return null;
    }
  }, [snapshotJson]);

  const updateActiveFromScroll = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    const rootTop = root.getBoundingClientRect().top;
    let current: DesignSystemSectionId = DESIGN_SYSTEM_SECTIONS[0].id;

    for (const section of DESIGN_SYSTEM_SECTIONS) {
      const el = root.querySelector<HTMLElement>(`#ds-sec-${section.id}`);
      if (!el) continue;
      // Section offset within the scroll container (offsetTop-equivalent).
      const sectionTop =
        el.getBoundingClientRect().top - rootTop + root.scrollTop;
      if (sectionTop <= root.scrollTop + HEADER_OFFSET + 8) {
        current = section.id;
      }
    }
    setActive((prev) => (prev === current ? prev : current));
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !ready) return;
    updateActiveFromScroll();
    root.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    return () => root.removeEventListener("scroll", updateActiveFromScroll);
  }, [ready, updateActiveFromScroll, systemId]);

  const scrollToSection = useCallback((id: DesignSystemSectionId) => {
    const root = scrollRef.current;
    const el = root?.querySelector<HTMLElement>(`#ds-sec-${id}`);
    if (!root || !el) return;
    setActive(id);
    const rootTop = root.getBoundingClientRect().top;
    const sectionTop =
      el.getBoundingClientRect().top - rootTop + root.scrollTop;
    root.scrollTo({
      top: Math.max(0, sectionTop - HEADER_OFFSET + 4),
      behavior: "smooth",
    });
  }, []);

  const handleExportCss = useCallback(() => {
    if (!designSystem) return;
    downloadDesignSystemCss(designSystem, namespace);
  }, [designSystem, namespace]);

  const handleDownloadPdf = useCallback(async () => {
    if (!docRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      await downloadElementAsPdf(
        docRef.current,
        `${slugifySystemName(systemName)}-design-system.pdf`
      );
    } catch {
      /* ignore */
    } finally {
      setPdfLoading(false);
    }
  }, [pdfLoading, systemName]);

  if (!ready || !designSystem) {
    return (
      <div className="ds-loading" style={{ color: "var(--app-text-muted)" }}>
        Loading design system…
      </div>
    );
  }

  return (
    <div className="ds-page">
      <DesignSystemHeader
        systemId={systemId}
        systemName={systemName}
        publishedSystems={publishedSystems}
        onExportCss={handleExportCss}
        onDownloadPdf={handleDownloadPdf}
        pdfLoading={pdfLoading}
      />
      <DesignSystemPillNav active={active} onNavigate={scrollToSection} />
      <div className="ds-scroll" ref={scrollRef}>
        <div ref={docRef}>
          <DesignSystemDocument
            systemId={systemId}
            systemName={systemName}
            publishedAtLabel={publishedAtLabel}
            designSystem={designSystem}
            namespace={namespace}
            onNamespaceChange={setNamespace}
          />
        </div>
      </div>
    </div>
  );
}
