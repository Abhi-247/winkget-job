import Link from "next/link";
import {
  Code2,
  Paintbrush,
  TrendingUp,
  PenTool,
  Smartphone,
  BarChart2,
  Search,
  ArrowUpRight,
} from "lucide-react";

const categories = [
  {
    name: "Web & Software Dev",
    sub: "Full-stack, APIs, SaaS",
    icon: Code2,
    jobs: "2,400+",
    gradient: "from-blue-600 to-indigo-600",
    category: "Web Development",
  },
  {
    name: "UI/UX Design",
    sub: "Interfaces, Branding, Motion",
    icon: Paintbrush,
    jobs: "1,800+",
    gradient: "from-purple-600 to-pink-600",
    category: "Design",
  },
  {
    name: "Digital Marketing",
    sub: "PPC, Social, Email",
    icon: TrendingUp,
    jobs: "950+",
    gradient: "from-amber-500 to-orange-600",
    category: "Marketing",
  },
  {
    name: "Content Writing",
    sub: "Blogs, Copywriting, SEO",
    icon: PenTool,
    jobs: "1,200+",
    gradient: "from-rose-500 to-red-600",
    category: "Writing",
  },
  {
    name: "Data Science & AI",
    sub: "ML, Analytics, Python",
    icon: BarChart2,
    jobs: "780+",
    gradient: "from-indigo-600 to-blue-700",
    category: "Data Science",
  },
  {
    name: "Mobile App Dev",
    sub: "iOS, Android, Flutter",
    icon: Smartphone,
    jobs: "640+",
    gradient: "from-orange-500 to-red-600",
    category: "Mobile Development",
  },
  {
    name: "SEO & SEM",
    sub: "Rankings, Ads, Growth",
    icon: Search,
    jobs: "520+",
    gradient: "from-teal-500 to-emerald-600",
    category: "Marketing",
  },
];

export function CategoryGrid() {
  return (
    <section
      id="categories"
      className="py-10 bg-white relative overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header — left aligned */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-1 rounded-full bg-[#d4a017]" />
              <span className="text-xs font-bold tracking-widest text-[#d4a017] uppercase">
                Explore Categories
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Browse by Expertise
            </h2>
          </div>
          <Link href="/jobs">
            <button className="text-sm font-bold text-[#1e3a5f] hover:text-[#d4a017] transition-colors flex items-center gap-1.5 cursor-pointer">
              View all categories <ArrowUpRight size={15} />
            </button>
          </Link>
        </div>

        {/* 2 columns on mobile, 3 on lg, 4 on xl */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/jobs?category=${encodeURIComponent(cat.category)}`}
                className="group relative bg-slate-50/80 hover:bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-3.5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/40 hover:-translate-y-1 overflow-hidden"
              >
                {/* Hover gradient reveal */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 rounded-2xl`} />

                <div className="relative z-10">
                  {/* Icon + job count */}
                  <div className="flex items-center justify-between mb-3 sm:mb-5">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                      <Icon size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <span className="hidden sm:inline-block text-[9px] sm:text-[10px] font-extrabold text-slate-400 bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider group-hover:bg-[#edf2f7] group-hover:text-[#1e3a5f] transition-colors duration-300">
                      {cat.jobs} jobs
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs sm:text-lg font-extrabold text-slate-800 group-hover:text-[#1e3a5f] transition-colors duration-300 mb-0.5 sm:mb-1 truncate">
                    {cat.name}
                  </h3>
                  <p className="hidden sm:block text-[10px] sm:text-xs text-slate-400 font-medium mb-2 sm:mb-4 truncate">
                    {cat.sub}
                  </p>

                  {/* Arrow indicator */}
                  <div className="hidden sm:flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-400 group-hover:text-[#1e3a5f] transition-colors duration-300">
                    <span>Browse</span>
                    <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* CTA Card — matches category card structure */}
          <Link href="/register?role=employer" className="group relative bg-[#1e3a5f] rounded-2xl p-3.5 sm:p-6 text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a017]/20 rounded-full blur-[50px] pointer-events-none" />

            <div className="relative z-10">
              {/* Icon */}
              <div className="flex items-center justify-between mb-3 sm:mb-5">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#d4a017] flex items-center justify-center text-white shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                  <ArrowUpRight size={18} className="sm:w-5 sm:h-5" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xs sm:text-lg font-extrabold text-white mb-0.5 sm:mb-1 truncate">
                Post a Job
              </h3>
              <p className="hidden sm:block text-[10px] sm:text-xs text-slate-300 font-medium mb-2 sm:mb-4 truncate">
                Let freelancers come to you
              </p>

              {/* Arrow indicator — desktop only */}
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-300 group-hover:text-[#d4a017] transition-colors duration-300">
                <span>Get Started</span>
                <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}