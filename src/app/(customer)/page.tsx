// app/page.tsx  
import HeroCarousel from "@/components/common/HeroCarousel";
import BestSellers from "@/components/Home/BestSellers";
import { BrandMarquee } from "@/components/Home/BrandMarquee";
import { CategoriesSection } from "@/components/Home/CategoriesSection";
import DeliverySection from "@/components/Home/DeliverySection";
import { HowItWorks } from "@/components/Home/HowItWorks";
import InfiniteSlider from "@/components/Home/InfiniteSlider";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0e14] font-sans antialiased">

      {/* ── Hero ── */}
      <HeroCarousel />

      <BrandMarquee/>
      <CategoriesSection/>

      <BestSellers/>
      <InfiniteSlider/>

      <HowItWorks/>

      <DeliverySection/>
    </main>
  );
}