import { Shield, Zap, Users, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure Payments",
    description:
      "Funds held in escrow until work is delivered and approved. Your money is always safe.",
  },
  {
    icon: Zap,
    title: "Fast Matching",
    description:
      "Our smart algorithm connects you with the right talent or job in minutes, not days.",
  },
  {
    icon: Users,
    title: "Verified Talent",
    description:
      "Every freelancer is verified with skills assessments and identity checks.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description:
      "Our dedicated support team is available round-the-clock to resolve any issues.",
  },
];

export function WhyChooseUs() {
  return (
    <section
      className="relative py-16 bg-[#1e3a5f] overflow-hidden"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      {/* dot-grid texture, echoes hero section */}
      <div
        className="absolute inset-0 opacity-[0.5] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* soft glows */}
      <div
        className="absolute -top-24 -left-16 w-72 h-72 bg-[#d4a017] rounded-full opacity-[0.08] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -right-16 w-72 h-72 bg-[#2c5282] rounded-full opacity-30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-wider text-[#d4a017] uppercase mb-3">
            Why us
          </span>
          <h2 className="text-3xl font-bold text-white mb-4">
            Why Choose WinkGetJob?
          </h2>
          <p className="text-[#94a3b8] max-w-xl mx-auto text-lg">
            We make freelancing easy, safe, and rewarding for both clients and
            freelancers
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                style={{ animationDelay: `${i * 90}ms` }}
                className="why-card group relative bg-white/[0.06] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#d4a017]/40 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
              >
                {/* top accent line, appears on hover */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#d4a017]/0 group-hover:via-[#d4a017]/70 to-transparent transition-all duration-300" />

                <div className="w-12 h-12 bg-[#d4a017]/15 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#d4a017]/25">
                  <Icon size={22} className="text-[#d4a017]" />
                </div>
                <h3 className="font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-base text-[#94a3b8] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes whyCardFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .why-card {
          animation: whyCardFadeIn 0.5s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .why-card {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}