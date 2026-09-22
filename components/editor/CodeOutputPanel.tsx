"use client";

import { IconCopy } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import {
  generateDesignSystemCode,
  type EditorDesignSystem,
} from "@/lib/codeGen";
import { highlightCode } from "@/lib/codeHighlight";
import type { CodeTab } from "@/types/tokens";

const TABS: { id: CodeTab; label: string }[] = [
  { id: "css", label: "CSS vars" },
  { id: "tailwind", label: "Tailwind" },
  { id: "json", label: "JSON" },
  { id: "typescript", label: "TypeScript" },
  { id: "markdown", label: "Markdown" },
];

interface CodeOutputPanelProps {
  designSystem: EditorDesignSystem;
  activeTab: CodeTab;
  namespace: string;
  onTabChange: (tab: CodeTab) => void;
  onNamespaceChange: (namespace: string) => void;
}

/**
 * Global code dock — rendered once below the center content for every rail category.
 * Exports the full design-system bundle; namespace prefixes all generated names.
 */
export function CodeOutputPanel({
  designSystem,
  activeTab,
  namespace,
  onTabChange,
  onNamespaceChange,
}: CodeOutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const code = useMemo(
    () => generateDesignSystemCode(designSystem, namespace, activeTab),
    [designSystem, namespace, activeTab]
  );
  const highlighted = useMemo(
    () => highlightCode(code, activeTab),
    [code, activeTab]
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [code]);

  return (
    <div className="ed-code-panel">
      <div className="ed-code-ns-row">
        <label className="ed-code-ns-label" htmlFor="ed-code-namespace">
          Namespace
        </label>
        <input
          id="ed-code-namespace"
          type="text"
          className="ed-namespace-input"
          value={namespace}
          spellCheck={false}
          onChange={(e) => onNamespaceChange(e.target.value)}
          aria-label="Token namespace"
        />
        <button type="button" className="ed-copy-btn" onClick={handleCopy}>
          <IconCopy size={12} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="ed-code-toolbar">
        <div className="ed-code-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`ed-code-tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <pre className="ed-code-block" aria-label={`${activeTab} export`}>
        {highlighted}
      </pre>
    </div>
  );
}
