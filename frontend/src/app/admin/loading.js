import { WorkspaceRouteLoading } from "@/components/common/LoadingShells";

export default function Loading() {
  return (
    <WorkspaceRouteLoading
      eyebrow="Admin Workspace"
      label="Loading admin page..."
      accent="sky"
    />
  );
}
