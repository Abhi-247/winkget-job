const stats = [
  { value: "12+", label: "Years Experience" },
  { value: "200+", label: "Skills Available" },
  { value: "₹0", label: "Platform Fee" },
  { value: "4.9★", label: "User Rating" },
];

export function StatsBar() {
  return (
    <section
      className="bg-white border-y border-gray-100 py-8"
      style={{ fontFamily: "var(--font-poppins), sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-[#0f172a] mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
