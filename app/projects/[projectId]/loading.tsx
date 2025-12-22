import { Spinner } from "@/components/ui/spinner";

export default function ProjectLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <Spinner />
      <p>Loading project...</p>
    </div>
  );
}
