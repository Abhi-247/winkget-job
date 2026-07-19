import { Shield, Zap, Users, Headphones, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Shield,
    title: "100% Escrow Protection",
    description:
      "Funds are held securely in escrow and only released when the deliverables meet your expectations.",
    badge: "Payments",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description:
      "Our AI algorithms match your project specifications with the most competent freelancers within minutes.",
    badge: "Matching",
    badgeColor: "bg-[#fdf8e8] text-[#d4a017] border-amber-100",
  },
  {
    icon: Users,
    title: "Highly Screened Talent",
    description:
      "Freelancers go through identity validation and technical screening before claiming tasks.",
    badge: "Trust",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    icon: Headphones,
    title: "Dedicated Human Support",
    description:
      "Get round-the-clock assistance from a real support representative for dispute resolution or queries.",
    badge: "Support",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
  },
];

export function WhyChooseUs() {
  return (
    <section
      className="py-10 bg-[#fafbfc] relative overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* Background elements */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-[#d4a017]/[0.03] rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[450px] h-[450px] bg-[#1e3a5f]/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: sticky intro block */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#edf2f7] text-[#1e3a5f] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              <span>Why WinkGetJob</span>
            </div>
            <h2 className="text-3.5xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              A brand new era of secure freelancing
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              We did away with the old freelancing models. No hidden commissions, no endless waiting for matching talent, and no uncertainty with payments.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Zero commission taken from freelancers",
                "Robust automated milestone tracking",
                "Instant payouts upon client validation",
              ].map((bullet) => (
                <div key={bullet} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-700 text-xs sm:text-sm font-semibold">{bullet}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/register?role=jobseeker">
                <button className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#1e3a5f] hover:text-[#d4a017] group transition-colors cursor-pointer">
                  <span>Learn more about security terms</span>
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT: Stacked Cards list */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-6 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300 hover:-translate-y-1 relative"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-[#1e3a5f] group-hover:scale-105 group-hover:bg-[#1e3a5f]/5 transition-all duration-300">
                      <Icon size={20} className="group-hover:text-[#d4a017] transition-colors" />
                    </div>
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${feature.badgeColor}`}>
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base mb-2 group-hover:text-[#1e3a5f] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-[11px] sm:text-xs font-semibold leading-relaxed">
                    {feature.description}
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