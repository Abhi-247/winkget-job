import { cn, getInitials, getAvatarColor } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: { container: "w-6 h-6", text: "text-xs" },
  sm: { container: "w-8 h-8", text: "text-xs" },
  md: { container: "w-10 h-10", text: "text-sm" },
  lg: { container: "w-12 h-12", text: "text-base" },
  xl: { container: "w-16 h-16", text: "text-lg" },
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const { container, text } = sizeMap[size];
  const colorClass = getAvatarColor(name);

  if (src) {
    return (
      <div
        className={cn(
          container,
          "relative rounded-full overflow-hidden flex-shrink-0",
          className
        )}
      >
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        container,
        colorClass,
        "rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold select-none",
        text,
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
