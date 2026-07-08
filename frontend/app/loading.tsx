import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}
