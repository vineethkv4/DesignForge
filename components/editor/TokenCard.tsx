import type { ColorToken, WcagLevel } from "@/types/tokens";

interface TokenCardProps {
  token: ColorToken;
  selected: boolean;
  onSelect: (id: string) => void;
}

function wcagClass(level: WcagLevel): string {
  return level;
}

export function TokenCard({ token, selected, onSelect }: TokenCardProps) {
  const isLightBorder =
    token.value.startsWith("#") &&
    parseInt(token.value.slice(1, 3), 16) > 200;

  return (
    <button
      type="button"
      className={`ed-token-card${selected ? " selected" : ""}`}
      onClick={() => onSelect(token.id)}
    >
      <div
        className="ed-token-swatch"
        style={{
          background: token.value,
          borderColor: isLightBorder ? "var(--ed-border2)" : undefined,
        }}
      />
      <div className="ed-token-info">
        <div className="ed-token-name">{token.name}</div>
        <div className="ed-token-alias">{token.alias}</div>
      </div>
      <span className="ed-token-value">{token.value}</span>
      <span className={`ed-wcag-badge ${wcagClass(token.wcag ?? "fail")}`}>
        {(token.wcag ?? "fail") === "fail" ? "—" : token.wcag}
      </span>
    </button>
  );
}
