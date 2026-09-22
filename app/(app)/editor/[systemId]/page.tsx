import { TokenEditorView } from "@/components/editor/TokenEditorView";

export default function EditorPage({ params }: { params: { systemId: string } }) {
  return <TokenEditorView systemId={params.systemId} />;
}
