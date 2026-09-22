"use client";

interface CategoryPlaceholderProps {
  title: string;
  description: string;
  /** When provided, shows a "Reset to defaults" action */
  onReset?: () => void;
  resetLabel?: string;
}

export function CategoryPlaceholder({
  title,
  description,
  onReset,
  resetLabel = "Reset to defaults",
}: CategoryPlaceholderProps) {
  return (
    <div className="ed-category-placeholder">
      <h3>{title}</h3>
      <p>{description}</p>
      {onReset && (
        <button type="button" className="ed-empty-reset-btn" onClick={onReset}>
          {resetLabel}
        </button>
      )}
    </div>
  );
}
