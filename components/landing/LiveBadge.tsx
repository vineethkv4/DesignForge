interface LiveBadgeProps {
  label: string;
  color?: string;
}

export function LiveBadge({ label, color }: LiveBadgeProps) {
  return (
    <div className="landing-live-badge" style={color ? { color } : undefined}>
      <span aria-hidden />
      {label}
    </div>
  );
}
