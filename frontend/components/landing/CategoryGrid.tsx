import Link from "next/link";
import {
  Code2,
  Paintbrush,
  TrendingUp,
  PenTool,
  Smartphone,
  BarChart2,
  Film,
  Search,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    name: "Web Development",
    icon: Code2,
    count: "12,400+ freelancers",
    color: "bg-[#edf2f7] text-[#1e3a5f]",
  },
  {
    name: "UI/UX Design",
    icon: Paintbrush,
    count: "8,200+ freelancers",
    color: "bg-purple-50 text-purple-600",
  },
  {
    name: "Digital Marketing",
    icon: TrendingUp,
    count: "6,800+ freelancers",
    color: "bg-amber-50 text-amber-600",
  },
  {
    name: "Content Writing",
    icon: PenTool,
    count: "9,100+ freelancers",
    color: "bg-pink-50 text-pink-600",
  },
  {
    name: "Mobile App Dev",
    icon: Smartphone,
    count: "5,600+ freelancers",
    color: "bg-amber-50 text-amber-600",
  },
  {
    name: "Data Science",
    icon: BarChart2,
    count: "4,300+ freelancers",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    name: "Video Editing",
    icon: Film,
    count: "3,700+ freelancers",
    color: "bg-red-50 text-red-600",
  },
  {
    name: "SEO & SEM",
    icon: Search,
    count: "5,200+ freelancers",
    color: "bg-teal-50 text-teal-600",
  },
];

export function CategoryGrid() {
  return (
    <section
      id="categories"
      className="py-16 bg-white relative overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* faint corner glow to echo hero section */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 bg-[#1e3a5f] rounded-full opacity-[0.03] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#d4a017] rounded-full opacity-[0.03] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-wider text-[#d4a017] uppercase mb-3">
            Explore
          </span>
          <h2 className="text-3xl font-bold text-[#0f172a] mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Find skilled professionals across every domain — from tech to creative.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const isFeatured = cat.name === "Digital Marketing";
            return (
              <Link
                key={cat.name}
                href={`/jobs?category=${encodeURIComponent(cat.name)}`}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`category-card group relative flex flex-col items-start p-6 rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 ${isFeatured
                    ? "border-[#1e3a5f] shadow-md"
                    : "border-gray-200 hover:border-[#1e3a5f]/40 hover:shadow-lg"
                  }`}
              >
                {isFeatured && (
                  <span className="absolute -top-2.5 right-4 bg-[#d4a017] text-white text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm">
                    Trending
                  </span>
                )}

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.color} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                >
                  <Icon size={22} />
                </div>

                <span
                  className={`text-sm font-semibold mb-1 transition-colors ${isFeatured ? "text-[#1e3a5f]" : "text-gray-800 group-hover:text-[#1e3a5f]"
                    }`}
                >
                  {cat.name}
                </span>

                <span className="text-xs text-gray-400 mb-3">{cat.count}</span>

                <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-[#1e3a5f] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Explore
                  <ArrowRight size={12} />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center mt-10">
          <Link href="/jobs">
            <button className="group border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2">
              View All Categories
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes categoryFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .category-card {
          animation: categoryFadeIn 0.5s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .category-card {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}