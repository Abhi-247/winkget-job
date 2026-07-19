import { HeroSection } from "@/components/landing/HeroSection";
import { CategoryGrid } from "@/components/landing/CategoryGrid";
import { FreelancerCarousel } from "@/components/landing/FreelancerCarousel";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQSection } from "@/components/landing/FAQSection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <FeaturedJobs />
      <FreelancerCarousel />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <FAQSection />
    </>
  );
}
