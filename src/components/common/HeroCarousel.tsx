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
    <div className="relative w-full">
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        loop={true}
        className="w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="
                relative w-full 
                aspect-[1280/460]   
                max-h-[520px]       /* limit height */
                overflow-hidden
              "
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
