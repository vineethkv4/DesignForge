import "./editor.css";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="editor-root">{children}</div>;
}
