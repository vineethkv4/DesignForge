"use client";

import {
  IconArrowLeft,
  IconDownload,
  IconFileTypePdf,
} from "@tabler/icons-react";
import Link from "next/link";
import { SystemSwitcher } from "@/components/design-system/SystemSwitcher";
import { Logo } from "@/components/landing/Logo";
import { ThemeToggleButton } from "@/components/shared/ThemeToggleButton";
import { ROUTES } from "@/lib/routes";
import type { DesignSystem } from "@/types/dashboard";

interface DesignSystemHeaderProps {
  systemId: string;
  systemName: string;
  publishedSystems: DesignSystem[];
  onExportCss: () => void;
  onDownloadPdf: () => void;
  pdfLoading: boolean;
}

export function DesignSystemHeader({
  systemId,
  systemName,
  publishedSystems,
  onExportCss,
  onDownloadPdf,
  pdfLoading,
}: DesignSystemHeaderProps) {
  return (
    <header className="ds-sticky-header">
      <div className="ds-sticky-header-inner">
        <Link href={ROUTES.systemsList} className="ds-back-link">
          <IconArrowLeft size={14} />
          Design systems
        </Link>

        <div className="ds-header-brand">
          <Logo size={20} />
          <SystemSwitcher
            currentId={systemId}
            currentName={systemName}
            systems={publishedSystems}
          />
          <span className="ds-pub-badge">Published</span>
        </div>

        <div className="ds-header-actions">
          <ThemeToggleButton />
          <button
            type="button"
            className="ds-btn-ghost"
            onClick={onExportCss}
          >
            <IconDownload size={14} />
            Export CSS
          </button>
          <button
            type="button"
            className="ds-btn-primary"
            onClick={onDownloadPdf}
            disabled={pdfLoading}
          >
            <IconFileTypePdf size={14} />
            {pdfLoading ? "Generating…" : "Download PDF"}
          </button>
        </div>
      </div>
    </header>
  );
}
