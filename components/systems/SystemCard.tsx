"use client";

import {
  IconClock,
  IconCopy,
  IconDots,
  IconPencil,
  IconTag,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { genScale } from "@/lib/colorScale";
import type { DesignSystem } from "@/types/dashboard";

interface SystemCardProps {
  system: DesignSystem;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SystemCard({
  system,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: SystemCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const color = system.palette[0] ?? "#7733FF";
  const scale = genScale(color);
  const isPub = system.status === "published";

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <div className="syslib-card" ref={rootRef}>
      <div
        className="syslib-card-top"
        style={{
          background: `linear-gradient(135deg, ${color}cc, ${color}88)`,
        }}
      >
        <span
          className={`syslib-status ${isPub ? "st-published" : "st-draft"}`}
        >
          {isPub ? "Published" : "Draft"}
        </span>
        <button
          type="button"
          className="syslib-card-menu"
          aria-label="More actions"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          <IconDots size={15} />
        </button>
        {menuOpen && (
          <div className="syslib-menu-pop" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="syslib-cm-item"
              onClick={() => {
                setMenuOpen(false);
                onDuplicate();
              }}
            >
              <IconCopy size={14} />
              Duplicate
            </button>
            {!isPub && (
              <button
                type="button"
                className="syslib-cm-item"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
              >
                <IconUpload size={14} />
                Open to publish
              </button>
            )}
            <div className="syslib-cm-sep" />
            <button
              type="button"
              className="syslib-cm-item danger"
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
            >
              <IconTrash size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="syslib-card-body">
        <div className="syslib-name">{system.name}</div>
        <div className="syslib-org">
          {system.plan === "pro" ? "Pro plan" : "Personal"}
        </div>
        <div className="syslib-scale-strip">
          {scale.map((c, i) => (
            <div key={`${c}-${i}`} style={{ background: c }} />
          ))}
        </div>
        <div className="syslib-meta-row">
          <span>
            <IconTag size={11} />
            {system.tokenCount} tokens
          </span>
          <span>
            <IconClock size={11} />
            {system.updatedAt}
          </span>
        </div>
        <div className="syslib-actions">
          {isPub ? (
            <>
              <button
                type="button"
                className="syslib-btn-primary"
                style={{ background: color }}
                onClick={onView}
              >
                View design system
              </button>
              <button
                type="button"
                className="syslib-btn-secondary"
                aria-label="Edit tokens"
                onClick={onEdit}
              >
                <IconPencil size={13} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="syslib-btn-primary"
                style={{ background: color }}
                onClick={onEdit}
              >
                Continue editing
              </button>
              <button
                type="button"
                className="syslib-btn-secondary"
                aria-label="Open editor to publish"
                title="Open editor to convert"
                onClick={onEdit}
              >
                <IconUpload size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
