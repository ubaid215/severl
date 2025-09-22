"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: "/images/burger.jpg",
    title: "Juicy Burgers",
    description: "Delicious handcrafted burgers made with fresh ingredients.",
  },
  {
    id: 2,
    image: "/images/pizza.jpg",
    title: "Hot Pizzas",
    description: "Cheesy pizzas straight from the oven, perfect for sharing.",
  },
  {
    id: 3,
    image: "/images/fried-chicken.jpg",
    title: "Crispy Chicken",
    description: "Golden fried chicken with mouth-watering flavors.",
  },
];

export default function HeroCarousel() {
  return (
    <div className="relative w-full h-[80vh]">
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: rgba(255, 255, 255, 0.5) !important;
          opacity: 1 !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #fbbf24 !important; 
        }
      `}</style>
      
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-[80vh]">
              {/* Background image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full object-cover object-center"
              />
             
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}