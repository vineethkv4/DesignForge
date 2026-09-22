"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState, type ReactNode } from "react";

/** One-line code under a component demo card, with Copy. */
export function DemoSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="ds-demo-code-row">
      <code className="ds-demo-code">{code}</code>
      <button
        type="button"
        className="ds-snippet-copy"
        aria-label="Copy snippet"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            /* ignore */
          }
        }}
      >
        {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function DemoCard({
  title,
  children,
  code,
}: {
  title: string;
  children: ReactNode;
  code: string;
}) {
  return (
    <div className="ds-demo-card">
      <div className="ds-demo-card-title">{title}</div>
      <div className="ds-demo-stage">{children}</div>
      <DemoSnippet code={code} />
    </div>
  );
}
