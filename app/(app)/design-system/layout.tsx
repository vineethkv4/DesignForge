import "../app.css";
import "./design-system.css";

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="app-root ds-root">{children}</div>;
}
