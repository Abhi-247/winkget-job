import Link from "next/link";
import { ArrowRight, Briefcase, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="py-16 bg-[#0f172a]" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Join thousands of freelancers and employers already on WinkGetJob
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* For Freelancers */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/15 text-center hover:bg-white/15 transition-colors">
            <div className="w-14 h-14 bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserCheck size={26} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              I&apos;m a Freelancer
            </h3>
            <p className="text-gray-400 text-base mb-6 leading-relaxed">
              Find quality projects, set your own rates, and grow your
              freelance career.
            </p>
            <Link href="/jobs">
              <Button className="bg-[#1e3a5f] hover:bg-[#152a45] gap-2" fullWidth>
                Find Work
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          {/* For Employers */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/15 text-center hover:bg-white/15 transition-colors">
            <div className="w-14 h-14 bg-[#d4a017] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase size={26} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              I&apos;m an Employer
            </h3>
            <p className="text-gray-400 text-base mb-6 leading-relaxed">
              Post jobs, review proposals, and hire the best talent for your
              projects.
            </p>
            <Link href="/talent">
              <Button className="bg-[#d4a017] hover:bg-[#b8860b] gap-2" fullWidth>
                Hire Talent
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
