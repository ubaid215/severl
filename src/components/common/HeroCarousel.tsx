"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";
import { Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";

interface Slide {
  id: number;
  image: string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  cta: string;
  ctaSecondary: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: "/images/zinger-banner.webp",
    badge: "🔥 Most Ordered",
    title: "The Taste That",
    highlight: "Stops Time.",
    description:
      "Handcrafted smash burgers with bold flavors and fresh ingredients — every single time.",
    cta: "Order Now",
    ctaSecondary: "See Menu",
  },
  {
    id: 2,
    image: "/images/hot-wings.webp",
    badge: "⚡ Limited Deal",
    title: "Hot Wings,",
    highlight: "Zero Regrets.",
    description:
      "Crispy, saucy, and impossible to stop. Our wings are the Friday ritual you didn't know you needed.",
    cta: "Grab the Deal",
    ctaSecondary: "Explore More",
  },
  {
    id: 3,
    image: "/images/pizza-banner.webp",
    badge: "🍕 Crowd Favorite",
    title: "Cheese That",
    highlight: "Pulls You In.",
    description:
      "Stone-baked pizzas loaded with rich toppings, melty cheese, and a crust that hits just right.",
    cta: "Order Pizza",
    ctaSecondary: "View Combos",
  },
  {
    id: 4,
    image: "/images/shawarma-banner.webp",
    badge: "🌯 Street Classic",
    title: "Wrapped With",
    highlight: "Pure Flavor.",
    description:
      "Juicy shawarma packed with tender meat, garlic sauce, and fresh veggies — every bite matters.",
    cta: "Try Shawarma",
    ctaSecondary: "See Options",
  },
  {
    id: 5,
    image: "/images/loaded-fries-banner.webp",
    badge: "🧀 Loaded & Legendary",
    title: "Fries That",
    highlight: "Steal The Show.",
    description:
      "Golden crispy fries stacked with cheese, sauces, and bold toppings — not just a side anymore.",
    cta: "Get Loaded Fries",
    ctaSecondary: "Add to Meal",
  },
  {
    id: 6,
    image: "/images/zinger-banner.webp",
    badge: "🔥 Spicy Hit",
    title: "Crunch That",
    highlight: "Hits Different.",
    description:
      "Crispy chicken zinger layered with bold sauces and fresh buns — built for real cravings.",
    cta: "Order Zinger",
    ctaSecondary: "Customize Now",
  },
];

export default function HeroCarousel() {
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const gsapRef = useRef<typeof import("gsap").gsap | null>(null);

  // Load GSAP dynamically
  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      gsapRef.current = gsap;
      // Animate the first slide in on mount
      animateSlide(0, gsap);
    });
  }, []);

  const animateSlide = useCallback(
    (index: number, gsapInstance?: typeof import("gsap").gsap) => {
      const g = gsapInstance || gsapRef.current;
      if (!g) return;

      const container = textRefs.current[index];
      if (!container) return;

      const badge = container.querySelector<HTMLElement>(".hero-badge");
      const titleLines =
        container.querySelectorAll<HTMLElement>(".hero-title-line");
      const desc = container.querySelector<HTMLElement>(".hero-desc");
      const btns = container.querySelectorAll<HTMLElement>(".hero-btn");
      const decorLine =
        container.querySelector<HTMLElement>(".hero-decor-line");

      // Reset all
      g.set(
        [
          badge,
          ...Array.from(titleLines),
          desc,
          ...Array.from(btns),
          decorLine,
        ].filter(Boolean),
        {
          opacity: 0,
          y: 30,
          skewY: 4,
        },
      );

      const tl = g.timeline();

      if (badge) {
        tl.to(
          badge,
          { opacity: 1, y: 0, skewY: 0, duration: 0.5, ease: "power3.out" },
          0,
        );
      }

      titleLines.forEach((line, i) => {
        tl.to(
          line,
          { opacity: 1, y: 0, skewY: 0, duration: 0.7, ease: "power3.out" },
          0.15 + i * 0.12,
        );
      });

      if (decorLine) {
        tl.to(
          decorLine,
          {
            opacity: 1,
            y: 0,
            skewY: 0,
            scaleX: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          0.35,
        );
      }

      if (desc) {
        tl.to(
          desc,
          { opacity: 1, y: 0, skewY: 0, duration: 0.6, ease: "power2.out" },
          0.5,
        );
      }

      btns.forEach((btn, i) => {
        tl.to(
          btn,
          { opacity: 1, y: 0, skewY: 0, duration: 0.5, ease: "back.out(1.5)" },
          0.65 + i * 0.1,
        );
      });
    },
    [],
  );

  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      const idx = swiper.realIndex;
      setActiveIndex(idx);
      // Small delay so new slide is visible before animating
      setTimeout(() => animateSlide(idx), 60);
    },
    [animateSlide],
  );

  return (
    <section className="relative w-full overflow-hidden bg-[#0b0e14]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-yellow-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-red-600/5 blur-[100px]" />
      </div>

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{
          clickable: true,
          renderBullet: (_, className) =>
            `<span class="${className} !bg-yellow-400 !opacity-40 [&.swiper-pagination-bullet-active]:!opacity-100 !w-6 !h-1.5 !rounded-sm transition-all"></span>`,
        }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={handleSlideChange}
        className="w-full [&_.swiper-pagination]:!bottom-4 [&_.swiper-pagination]:md:!bottom-6"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full min-h-[480px] md:min-h-[600px] flex items-center">
              {/* Background image - Fixed for mobile */}
              <div className="absolute inset-0 z-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center 30%" }}
                />
                {/* Dark overlay with gradient - Optimized for mobile */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14]/95 via-[#0b0e14]/85 to-[#0b0e14]/50 md:via-[#0b0e14]/75" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14]/80 via-[#0b0e14]/30 to-transparent md:from-[#0b0e14]/60" />
              </div>

              {/* Text content */}
              <div
                className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 py-8 md:py-16 w-full"
                ref={(el) => {
                  textRefs.current[index] = el;
                }}
              >
                <div className="max-w-xl">
                  {/* Badge */}
                  <div
                    className="hero-badge inline-flex items-center gap-2 bg-white/5 border border-yellow-500/30 
                    backdrop-blur-sm text-yellow-400 text-xs font-semibold tracking-widest uppercase 
                    px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6 opacity-0"
                  >
                    {slide.badge}
                  </div>

                  {/* Headline - Fixed text cutoff with proper spacing */}
                  <div className="overflow-hidden mb-1">
                    <h1 className="hero-title-line text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight md:leading-none tracking-tight opacity-0">
                      {slide.title}
                    </h1>
                  </div>
                  <div className="overflow-hidden mb-3 md:mb-5">
                    <h1
                      className="hero-title-line text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight md:leading-none tracking-tight opacity-0"
                      style={{ color: "#F5C518" }}
                    >
                      {slide.highlight}
                    </h1>
                  </div>

                  {/* Decorative line */}
                  <div className="hero-decor-line w-12 md:w-16 h-0.5 md:h-1 bg-red-500 rounded-full mb-4 md:mb-6 opacity-0" />

                  {/* Description */}
                  <p className="hero-desc text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 md:mb-8 max-w-md opacity-0">
                    {slide.description}
                  </p>

                  {/* CTAs */}
                  <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                    <Link href="/menu">
                      <button
                        className="hero-btn opacity-0 bg-red-600 hover:bg-red-500 text-white font-bold 
      px-5 py-2.5 md:px-7 md:py-3.5 rounded-xl text-xs md:text-sm tracking-wide transition-all duration-200 
      hover:scale-105 active:scale-95 shadow-lg shadow-red-600/20"
                      >
                        {slide.cta}
                      </button>
                    </Link>
                    <Link href="/menu">
                      <button
                        className="hero-btn opacity-0 border border-yellow-500/40 hover:border-yellow-400 
      text-yellow-400 hover:text-yellow-300 font-semibold px-5 py-2.5 md:px-7 md:py-3.5 rounded-xl 
      text-xs md:text-sm tracking-wide transition-all duration-200 hover:bg-yellow-500/5"
                      >
                        {slide.ctaSecondary} →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
