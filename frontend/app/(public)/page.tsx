import { HeroSection } from "@/components/landing/HeroSection";
import { StatsBar } from "@/components/landing/StatsBar";
import { CategoryGrid } from "@/components/landing/CategoryGrid";
import { FreelancerCarousel } from "@/components/landing/FreelancerCarousel";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <CategoryGrid />
      <FeaturedJobs />
      <FreelancerCarousel />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <FAQSection />
      <CTASection />
    </>
  );
}
