// ─── Brand Colors ────────────────────────────────────────────────────────────
export const BRAND = {
  primary: "#E8161B",       // Bold red
  secondary: "#FFC107",     // Warm yellow
  accent: "#FF6B00",        // Fiery orange (bridge between red & yellow)
  dark: "#0F0A05",          // Near-black warm tone
  darkMid: "#1A1008",       // Deep warm brown-black
  muted: "#3D2B0F",         // Warm muted brown
  cream: "#FFF8EE",         // Off-white warm cream
  textLight: "#FFE8C4",     // Warm light text
};

// ─── Slide Data ───────────────────────────────────────────────────────────────
export interface HeroSlide {
  id: number;
  tag: string;
  heading: string;
  headingAccent: string;
  subheading: string;
  cta: string;
  image: string;         // Unsplash food image URL
  accentColor: string;
  bgGradient: string;
  floatingVectors: FloatingVector[];
}

export interface FloatingVector {
  emoji: string;
  size: string;
  top: string;
  left?: string;
  right?: string;
  rotate: string;
  delay: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: "🔥 Best Seller",
    heading: "The Ultimate",
    headingAccent: "Smash Burger",
    subheading: "Double-stacked, flame-grilled perfection. Crispy edges, juicy center — every single bite hits different.",
    cta: "Order Now",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=90&fit=crop",
    accentColor: BRAND.secondary,
    bgGradient: `radial-gradient(ellipse 80% 60% at 70% 50%, #3D1A00 0%, #0F0A05 100%)`,
    floatingVectors: [
      { emoji: "🍟", size: "3.5rem", top: "15%", right: "8%", rotate: "-15deg", delay: "0s" },
      { emoji: "🧅", size: "2.2rem", top: "65%", left: "5%", rotate: "20deg", delay: "0.3s" },
      { emoji: "🧀", size: "2.8rem", top: "25%", left: "8%", rotate: "-8deg", delay: "0.6s" },
      { emoji: "🌶️", size: "2rem", top: "75%", right: "12%", rotate: "30deg", delay: "0.9s" },
    ],
  },
  {
    id: 2,
    tag: "⚡ Fan Favourite",
    heading: "Woodfire",
    headingAccent: "Crispy Pizza",
    subheading: "Thin crust, bubbling cheese, fresh-pulled dough. Authenticity you can taste in every slice.",
    cta: "Order Now",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=900&q=90&fit=crop",
    accentColor: BRAND.primary,
    bgGradient: `radial-gradient(ellipse 80% 60% at 70% 50%, #3D0A00 0%, #0F0A05 100%)`,
    floatingVectors: [
      { emoji: "🫒", size: "3rem", top: "18%", right: "10%", rotate: "10deg", delay: "0s" },
      { emoji: "🍅", size: "2.5rem", top: "70%", left: "6%", rotate: "-20deg", delay: "0.4s" },
      { emoji: "🧄", size: "2.2rem", top: "20%", left: "6%", rotate: "15deg", delay: "0.7s" },
      { emoji: "🌿", size: "3rem", top: "78%", right: "9%", rotate: "-10deg", delay: "1s" },
    ],
  },
  {
    id: 3,
    tag: "✨ Chef's Special",
    heading: "Creamy",
    headingAccent: "Truffle Pasta",
    subheading: "Hand-rolled ribbons, rich truffle cream, parmesan shaved tableside. Comfort food, elevated.",
    cta: "Order Now",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=900&q=90&fit=crop",
    accentColor: BRAND.accent,
    bgGradient: `radial-gradient(ellipse 80% 60% at 70% 50%, #2A1500 0%, #0F0A05 100%)`,
    floatingVectors: [
      { emoji: "🫙", size: "2.8rem", top: "14%", right: "9%", rotate: "-12deg", delay: "0s" },
      { emoji: "🧅", size: "2rem", top: "72%", left: "7%", rotate: "25deg", delay: "0.35s" },
      { emoji: "🌱", size: "2.5rem", top: "22%", left: "7%", rotate: "-5deg", delay: "0.65s" },
      { emoji: "🫕", size: "3rem", top: "80%", right: "11%", rotate: "18deg", delay: "0.95s" },
    ],
  },
];

// ─── Nav Dots ─────────────────────────────────────────────────────────────────
export const SLIDE_INTERVAL_MS = 5000;


 
// ─── Food Categories (for FoodCategories component) ──────────────────────────
export interface FoodCategory {
  id: number;
  name: string;
  slogan: string;
  watermark: string;
  image: string;
  itemCount: number;
}
 
export const FOOD_CATEGORIES: FoodCategory[] = [
  {
    id: 1,
    name: "Hot Dog",
    slogan: "Fresh & Tasty",
    watermark: "Hot Dog",
    image: "https://images.unsplash.com/photo-1612392062631-94b1c979e2b0?w=300&q=85&fit=crop",
    itemCount: 8,
  },
  {
    id: 2,
    name: "Chicken",
    slogan: "Your Slogan Here",
    watermark: "Chicken",
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c8?w=300&q=85&fit=crop",
    itemCount: 12,
  },
  {
    id: 3,
    name: "Biryani",
    slogan: "Delicious",
    watermark: "Biryani",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=85&fit=crop",
    itemCount: 6,
  },
  {
    id: 4,
    name: "Burgers",
    slogan: "Fast Food",
    watermark: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=85&fit=crop",
    itemCount: 8,
  },
  {
    id: 5,
    name: "Pizza",
    slogan: "House",
    watermark: "Pizza",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=300&q=85&fit=crop",
    itemCount: 10,
  },
  {
    id: 6,
    name: "French Fries",
    slogan: "Crispy & Golden",
    watermark: "Fries",
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=300&q=85&fit=crop",
    itemCount: 5,
  },
];