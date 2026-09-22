interface PanelProps {
  id?: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Panel({
  id,
  title,
  action,
  children,
  className = "",
}: PanelProps) {
  return (
    <div id={id} className={`app-panel ${className}`}>
      <div className="app-panel-header">
        <span className="app-panel-title">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}
