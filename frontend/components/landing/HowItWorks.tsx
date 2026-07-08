const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description:
      "Sign up as a freelancer or employer. Complete your profile with skills, experience, and portfolio.",
    color: "bg-[#edf2f7] text-[#1e3a5f]",
  },
  {
    number: "02",
    title: "Post or Find Jobs",
    description:
      "Employers post detailed job listings. Freelancers browse and apply with tailored proposals.",
    color: "bg-[#fdf8e8] text-[#d4a017]",
  },
  {
    number: "03",
    title: "Collaborate & Get Paid",
    description:
      "Work together through our platform. Payments are secured and released upon project completion.",
    color: "bg-purple-50 text-purple-700",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 bg-white" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0f172a] mb-4">
            How It Works
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div
            className="hidden md:block absolute top-8 left-1/3 w-1/3 h-0.5 bg-gray-200"
            aria-hidden="true"
          />
          <div
            className="hidden md:block absolute top-8 left-2/3 w-1/6 h-0.5 bg-gray-200"
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center">
              <div
                className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center text-2xl font-black mx-auto mb-4 relative z-10`}
              >
                {step.number}
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a] mb-2">
                {step.title}
              </h3>
              <p className="text-base text-gray-500 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
