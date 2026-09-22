import { DesignSystemView } from "@/components/design-system/DesignSystemView";

export default function DesignSystemPage({
  params,
}: {
  params: { systemId: string };
}) {
  return (
    <DesignSystemView key={params.systemId} systemId={params.systemId} />
  );
}
