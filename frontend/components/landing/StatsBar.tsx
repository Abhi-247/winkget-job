"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Sparkles, Coins, Star } from "lucide-react";

const stats = [
  { value: 12, suffix: "+", label: "Years Experience", icon: Award, accent: "#1e3a5f" },
  { value: 200, suffix: "+", label: "Skills Available", icon: Sparkles, accent: "#d4a017" },
  { value: 0, prefix: "₹", suffix: "", label: "Platform Fee", icon: Coins, accent: "#059669" },
  { value: 4.9, suffix: "★", label: "User Rating", icon: Star, accent: "#7c3aed" },
];

function AnimatedNumber({ value, prefix, suffix }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1200;
          const steps = 40;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Number(current.toFixed(1)));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-black text-slate-900 leading-none tabular-nums">
      {prefix}{value === 4.9 ? count.toFixed(1) : Math.floor(count)}{suffix}
    </div>
  );
}

export function StatsBar() {
  return (
    <section
      className="py-0 -mt-10 relative z-20"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-slate-100">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center px-4 group"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: `${stat.accent}10`, color: stat.accent }}
                  >
                    <Icon size={22} />
                  </div>
                  <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-2">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
