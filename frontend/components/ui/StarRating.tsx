import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;          // 0–5, supports .5 increments
  count?: number;          // review count shown as "(N)"
  size?: "sm" | "md";
  className?: string;
}

const sizeMap = { sm: 12, md: 16 };

export function StarRating({ rating, count, size = "sm", className }: StarRatingProps) {
  const px = sizeMap[size];

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rating >= n;
        const half   = !filled && rating >= n - 0.5;
        return (
          <span key={n} className="relative inline-block" style={{ width: px, height: px }}>
            {/* Empty star (base) */}
            <Star
              size={px}
              className="text-gray-300"
              strokeWidth={1.5}
            />
            {/* Filled overlay — full or half-width clip */}
            {(filled || half) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: half ? "50%" : "100%" }}
              >
                <Star
                  size={px}
                  className="text-yellow-400 fill-yellow-400"
                  strokeWidth={1.5}
                />
              </span>
            )}
          </span>
        );
      })}
      {count !== undefined && (
        <span className={cn("ml-1 text-gray-500", size === "sm" ? "text-xs" : "text-sm")}>
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
}
