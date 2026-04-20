import { WorkspaceRouteLoading } from "@/components/common/LoadingShells";

export default function Loading() {
  return (
    <WorkspaceRouteLoading
      eyebrow="Instructor Workspace"
      label="Loading instructor page..."
      accent="amber"
    />
  );
}
