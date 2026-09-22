"use client";

import {
  IconArrowBackUp,
  IconChevronDown,
  IconDownload,
  IconEye,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { PreviewOverlay } from "@/components/editor/PreviewOverlay";
import { Logo } from "@/components/landing/Logo";
import { ThemeToggleButton } from "@/components/shared/ThemeToggleButton";
import {
  downloadDesignSystemExport,
  EXPORT_DOWNLOAD_OPTIONS,
  type ExportDownloadFormat,
} from "@/lib/downloadCss";
import { ROUTES } from "@/lib/routes";
import {
  convertToDesignSystem,
  getSystemName,
  getSystemStatus,
} from "@/lib/systemStorage";
import type { PublishedSnapshot } from "@/types/dashboard";
import { useTokenStore } from "@/stores/tokenStore";

interface EditorTopbarProps {
  systemId: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetAll: () => void;
}

export function EditorTopbar({
  systemId,
  canUndo,
  onUndo,
  onResetAll,
}: EditorTopbarProps) {
  const router = useRouter();
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [republishConfirmOpen, setRepublishConfirmOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const resetTitleId = useId();
  const republishTitleId = useId();
  const exportMenuId = useId();
  const resetCancelRef = useRef<HTMLButtonElement>(null);
  const republishCancelRef = useRef<HTMLButtonElement>(null);
  const exportBtnRef = useRef<HTMLButtonElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const store = useTokenStore();
  const systemName = getSystemName(systemId);
  const tokenCount =
    store.state.color.length +
    store.state.typography.length +
    store.state.spacing.length +
    store.state.radius.length +
    store.state.shadow.length +
    store.state.theme.length +
    store.state.component.length;

  useEffect(() => {
    if (!resetConfirmOpen) return;
    resetCancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setResetConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetConfirmOpen]);

  useEffect(() => {
    if (!republishConfirmOpen) return;
    republishCancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRepublishConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [republishConfirmOpen]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!exportOpen) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (exportMenuRef.current?.contains(target)) return;
      if (exportBtnRef.current?.contains(target)) return;
      setExportOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExportOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [exportOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("needConvert") !== "1") return;
    setExportToast("Convert this system to a design system first.");
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setExportToast(null), 4000);
    router.replace(ROUTES.editor(systemId), { scroll: false });
  }, [router, systemId]);

  const buildLiveSnapshot = useCallback((): PublishedSnapshot => {
    return {
      tokens: store.state.color,
      typography: store.state.typography,
      spacing: store.state.spacing,
      radius: store.state.radius,
      shadow: store.state.shadow,
      theme: store.state.theme,
      component: store.state.component,
    };
  }, [store.state]);

  const runConvert = useCallback(() => {
    convertToDesignSystem(systemId, buildLiveSnapshot());
    setRepublishConfirmOpen(false);
    router.push(ROUTES.systemView(systemId));
  }, [buildLiveSnapshot, router, systemId]);

  const handleConvertClick = useCallback(() => {
    const status = getSystemStatus(systemId);
    if (status === "published") {
      setRepublishConfirmOpen(true);
      return;
    }
    runConvert();
  }, [runConvert, systemId]);

  const showExportToast = useCallback((filename: string) => {
    setExportToast(`Downloaded ${filename}`);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setExportToast(null), 2000);
  }, []);

  const handleExport = useCallback(
    (format: ExportDownloadFormat) => {
      const filename = downloadDesignSystemExport(
        store.designSystem,
        store.state.namespace,
        format
      );
      showExportToast(filename);
      setExportOpen(false);
    },
    [showExportToast, store.designSystem, store.state.namespace]
  );

  return (
    <>
      <header className="ed-topbar">
        <Link href="/dashboard" className="ed-topbar-logo">
          <Logo size={22} />
          <span className="ed-topbar-brand">DesignForge</span>
        </Link>
        <span className="ed-topbar-slash" aria-hidden>
          /
        </span>
        <span className="ed-topbar-sys">{systemName}</span>
        <span className="ed-topbar-ver">v1.3</span>
        <div className="ed-topbar-vsep" aria-hidden />
        <span className="ed-topbar-tcount">{tokenCount} tokens</span>

        <div className="ed-topbar-actions">
          <button
            type="button"
            className="ed-icon-btn"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo last change"
          >
            <IconArrowBackUp size={15} />
          </button>
          <button
            type="button"
            className="ed-icon-btn"
            onClick={() => setResetConfirmOpen(true)}
            aria-label="Reset all tokens"
            title="Reset all tokens"
          >
            <IconRefresh size={14} />
          </button>
          <ThemeToggleButton />
          <button
            type="button"
            className="ed-tb-btn"
            onClick={() => setPreviewOpen(true)}
            title="Open full system preview"
          >
            <IconEye size={13} />
            Preview
          </button>
          <div className="ed-export-wrap">
            <button
              ref={exportBtnRef}
              type="button"
              className="ed-tb-btn ed-export-btn"
              onClick={() => setExportOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={exportOpen}
              aria-controls={exportMenuId}
              title="Download tokens"
            >
              <IconDownload size={13} />
              Export
              <IconChevronDown
                size={12}
                className={`ed-export-chevron${exportOpen ? " open" : ""}`}
                aria-hidden
              />
            </button>
            {exportOpen && (
              <div
                ref={exportMenuRef}
                id={exportMenuId}
                className="ed-export-menu"
                role="menu"
                aria-label="Export formats"
              >
                {EXPORT_DOWNLOAD_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    role="menuitem"
                    className="ed-export-item"
                    onClick={() => handleExport(opt.id)}
                  >
                    <IconDownload size={13} aria-hidden />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="ed-tb-btn ed-tb-btn-pub"
            onClick={handleConvertClick}
            title="Snapshot tokens and open the published design system"
          >
            <IconSparkles size={13} />
            Convert to Design System
          </button>
        </div>
      </header>

      {exportToast && (
        <div className="ed-export-toast" role="status" aria-live="polite">
          {exportToast}
        </div>
      )}

      <PreviewOverlay
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {resetConfirmOpen && (
        <div
          className="ed-confirm-backdrop"
          role="presentation"
          onClick={() => setResetConfirmOpen(false)}
        >
          <div
            className="ed-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={resetTitleId}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={resetTitleId} className="ed-confirm-title">
              Reset all tokens?
            </h2>
            <p className="ed-confirm-body">
              This restores colors, typography, spacing, border radius, and
              shadows to the demo design system defaults. Undo history will be
              cleared.
            </p>
            <div className="ed-confirm-actions">
              <button
                ref={resetCancelRef}
                type="button"
                className="ed-btn-ghost"
                onClick={() => setResetConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ed-btn-danger"
                onClick={() => {
                  onResetAll();
                  setResetConfirmOpen(false);
                }}
              >
                Reset all tokens
              </button>
            </div>
          </div>
        </div>
      )}

      {republishConfirmOpen && (
        <div
          className="ed-confirm-backdrop"
          role="presentation"
          onClick={() => setRepublishConfirmOpen(false)}
        >
          <div
            className="ed-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={republishTitleId}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={republishTitleId} className="ed-confirm-title">
              Re-publish with your latest changes?
            </h2>
            <p className="ed-confirm-body">
              A shared view already exists. This will replace the published
              snapshot with your current editor tokens. Draft edits stay in the
              editor either way.
            </p>
            <div className="ed-confirm-actions">
              <button
                ref={republishCancelRef}
                type="button"
                className="ed-btn-ghost"
                onClick={() => setRepublishConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ed-btn-primary"
                onClick={runConvert}
              >
                Re-publish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
