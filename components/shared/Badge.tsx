interface BadgeProps {
  variant: "published" | "draft" | "free" | "pro";
  children: React.ReactNode;
}

const VARIANT_CLASS: Record<BadgeProps["variant"], string> = {
  published: "app-badge app-badge-pub",
  draft: "app-badge app-badge-draft",
  free: "app-badge app-badge-free",
  pro: "app-badge app-badge-pro",
};

export function Badge({ variant, children }: BadgeProps) {
  return <span className={VARIANT_CLASS[variant]}>{children}</span>;
}
