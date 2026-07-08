import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-200 border-t-blue-600",
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
