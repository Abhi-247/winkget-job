import { Award, Sparkles, Coins, Star } from "lucide-react";

const stats = [
  { 
    value: "12+", 
    label: "Years Experience", 
    icon: Award, 
    color: "text-[#1e3a5f] bg-[#edf2f7]" 
  },
  { 
    value: "200+", 
    label: "Skills Available", 
    icon: Sparkles, 
    color: "text-[#d4a017] bg-amber-50" 
  },
  { 
    value: "₹0", 
    label: "Platform Fee", 
    icon: Coins, 
    color: "text-emerald-600 bg-emerald-50" 
  },
  { 
    value: "4.9★", 
    label: "User Rating", 
    icon: Star, 
    color: "text-blue-500 bg-blue-50" 
  },
];

export function StatsBar() {
  return (
    <section
      className="bg-[#f8fafc] border-y border-slate-200/60 py-10"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="group bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 hover:border-[#1e3a5f]/30 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color} transition-transform duration-300 group-hover:scale-105`}>
                  <Icon size={20} />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-2xl font-black text-slate-800 leading-none mb-1.5 group-hover:text-[#1e3a5f] transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
