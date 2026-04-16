// components/HowItWorks.tsx
import {
  ShoppingBag,
  ChefHat,
  Bike,
  Sparkles,
  Clock,
  Gift,
} from "lucide-react";

const steps = [
  {
    icon: ShoppingBag,
    title: "Choose Your Food",
    description:
      "Pick your favorite fast food items from our menu and place your order easily.",
    color: "from-red-600 to-amber-500",
    highlight: "Quick ordering",
  },
  {
    icon: ChefHat,
    title: "Fresh Preparation",
    description:
      "Your food is prepared fresh after you order using quality ingredients.",
    color: "from-amber-500 to-red-600",
    highlight: "Fresh every time",
  },
  {
    icon: Bike,
    title: "Fast Delivery",
    description:
      "We pack your order carefully and deliver it to your doorstep as quickly as possible.",
    color: "from-red-600 to-amber-500",
    highlight: "Hot & fresh",
  },
];

export function HowItWorks() {
  return (
    <section className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Heading Section */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-center mb-3 sm:mb-4">
          <span className="text-white">The</span>{" "}
          <span className="bg-gradient-to-r from-[#ef4444] to-[#ffd700] bg-clip-text text-transparent">
            Food
          </span>
          <span className="text-white"> Experience</span>
        </h2>

        <p className="text-center text-[#9ca3af] mb-10 sm:mb-12 md:mb-16 max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-4">
          From your order to your doorstep — fresh, fast food delivered hot and
          fresh
        </p>

        {/* Steps Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 lg:gap-10">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative group bg-gradient-to-br from-[#3f0000]/20 to-[#000000] border border-[#7f1a1a]/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8 backdrop-blur-sm hover:border-[#ef4444]/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all duration-300"
            >
              {/* Step Number - Responsive positioning */}
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#dc2626] to-[#ffd700] flex items-center justify-center text-black font-bold text-base sm:text-lg shadow-lg">
                {idx + 1}
              </div>

              {/* Highlight Badge - Responsive text */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#ffd700]/80 bg-[#000000]/50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border border-[#ffd700]/20 whitespace-nowrap">
                  {step.highlight}
                </span>
              </div>

              {/* Icon - Responsive sizing */}
              <div className="mb-4 sm:mb-5 md:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#3f0000] to-[#000000] border border-[#7f1a1a]/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#ffd700]" />
                </div>
              </div>

              {/* Text - Responsive typography */}
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-2 sm:mb-3 tracking-tight">
                {step.title}
              </h3>
              <p className="text-[#9ca3af] text-xs sm:text-sm md:text-base leading-relaxed">
                {step.description}
              </p>

              {/* Decorative Line */}
              <div className="mt-4 sm:mt-5 md:mt-6 h-px bg-gradient-to-r from-[#dc2626]/50 via-[#ffd700]/50 to-transparent" />
            </div>
          ))}
        </div>

        {/* Trust Badge - Fully responsive with wrapping */}
        <div className="mt-12 sm:mt-14 md:mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full bg-[#3f0000]/10 border border-[#7f1a1a]/30 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-[#ffd700]" />
              <span className="text-[#9ca3af] text-[10px] sm:text-xs whitespace-nowrap">
                Avg. delivery: 35min
              </span>
            </div>
            <div className="w-px h-3 sm:h-3.5 md:h-4 bg-[#7f1a1a]/50 hidden sm:block" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-[#ffd700]" />
              <span className="text-[#9ca3af] text-[10px] sm:text-xs whitespace-nowrap">
                Complimentary gift box
              </span>
            </div>
            <div className="w-px h-3 sm:h-3.5 md:h-4 bg-[#7f1a1a]/50 hidden md:block" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-[#ffd700]" />
              <span className="text-[#9ca3af] text-[10px] sm:text-xs whitespace-nowrap">
                100% satisfaction
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}