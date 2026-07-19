import Link from "next/link";
import { ArrowRight, Briefcase, UserCheck, Shield } from "lucide-react";

export function CTASection() {
  return (
    <section 
      className="pt-12 pb-6 bg-white relative" 
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Unified Premium Banner Card */}
        <div className="bg-gradient-to-br from-[#1e3a5f] via-[#23436d] to-[#12233a] rounded-[3rem] p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
          
          {/* Decorative glows */}
          <div className="absolute top-[-30%] left-[-10%] w-[300px] h-[300px] bg-[#d4a017]/10 rounded-full blur-[65px] pointer-events-none" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1 bg-white/10 border border-white/10 rounded-full px-4.5 py-1.5 text-xs font-bold uppercase tracking-wider">
              <Shield size={12} className="text-[#d4a017]" />
              <span>Zero Risk Escrow</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Ready to start your next milestone?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              Join thousands of verified developers, designers, copywriters, and businesses collaborating securely with zero platform fee.
            </p>

            {/* Split Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href="/register?role=jobseeker" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#d4a017] hover:bg-[#c49515] text-slate-900 font-extrabold text-sm rounded-2xl shadow-lg shadow-[#d4a017]/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer">
                  <UserCheck size={16} />
                  <span>Join as Freelancer</span>
                  <ArrowRight size={15} />
                </button>
              </Link>

              <Link href="/register?role=employer" className="w-full sm:w-auto">
                <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-white/20 font-extrabold text-sm rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer">
                  <Briefcase size={16} className="text-[#d4a017]" />
                  <span>Hire Top Talent</span>
                  <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
