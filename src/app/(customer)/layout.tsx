// app/(customer)/layout.tsx
import Footer from "@/components/layout/Footer";
import Navigation from "@/components/layout/Navigation";
import { DataProvider } from "@/context/DataContext";
import { CartProvider } from "@/context/CartContext";
import { ReactNode } from "react";
import type { Metadata } from "next";

// SEO-Optimized Metadata with High-Ranking Keywords
export const metadata: Metadata = {
  // Primary Title - Include main keywords
  title: {
    default: "Several Restaurant - Best Food Delivery | Order Online in Faisalabad",
    template: "%s | Several Restaurant - Food Delivery Faisalabad"
  },
  
  // Rich Description with Keywords
  description: "Order delicious food online from Several Restaurant in Faisalabad. Fast delivery, fresh ingredients, and authentic Pakistani cuisine. Browse our menu of burgers, pizza, BBQ, biryani, and more. Best restaurant deals and offers available!",
  
  // Keywords for Search Engines (though less important now, still useful)
  keywords: [
    // Location-based keywords
    "food delivery Faisalabad",
    "restaurant Faisalabad",
    "online food order Faisalabad",
    "best restaurant in Faisalabad",
    "Several Restaurant Faisalabad",
    
    // Food type keywords
    "pizza delivery",
    "burger delivery",
    "biryani delivery",
    "BBQ restaurant",
    "fast food delivery",
    "Pakistani food delivery",
    "desi food online",
    
    // Action keywords
    "order food online",
    "food delivery near me",
    "restaurant delivery",
    "takeaway food",
    "food home delivery",
    
    // Deal keywords
    "restaurant deals",
    "food offers",
    "discount food delivery",
    "cheap food delivery",
    "special deals"
  ],
  
  // Authors
  authors: [{ name: "Several Restaurant" }],
  
  // Creator
  creator: "Several Restaurant",
  
  // Publisher
  publisher: "Several Restaurant",
  
  // Robots - Tell search engines what to do
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://several.life",
    siteName: "Several Restaurant - The Taste Of Life",
    title: "Several Restaurant - Best Food Delivery in Faisalabad | Order Online",
    description: "Craving delicious food? Order from Several Restaurant! Fast delivery, fresh ingredients, authentic Pakistani cuisine. Pizza, burgers, BBQ, biryani & more. Get special deals now!",
    images: [
      {
        url: "https://several.life/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Several Restaurant - Fresh Food Delivery",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Several Restaurant - Best Food Delivery in Faisalabad",
    description: "Order delicious food online! Pizza, burgers, BBQ, biryani & more. Fast delivery. Special deals available. 🍕🍔",
    images: ["https://several.life/images/twitter-card.jpg"],
    creator: "@SeveralRestaurant",
  },
  
  // Verification (Add your actual codes)
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  
  // Alternate languages (if you have multilingual support)
  alternates: {
    canonical: "https://several.life",
    languages: {
      'en-PK': 'https://several.life',
      // 'ur-PK': 'https://several.life/ur', // Urdu version if available
    },
  },
  
  // Category
  category: "Food & Dining",
  
  // Application Name
  applicationName: "Several Restaurant",
  
  // Referrer
  referrer: "origin-when-cross-origin",
  
  // Format Detection
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  
  // Manifest
  manifest: "/manifest.json",
  
 
  
  // Other Meta Tags
  other: {
    // Business Information
    "business:contact_data:street_address": "P-562/A Opposite Govt. Nusrat Fateh Ali Khan Hospital, People Colony No 2, Faisalabad",
    "business:contact_data:locality": "Faisalabad",
    "business:contact_data:region": "Punjab",
    "business:contact_data:postal_code": "38000",
    "business:contact_data:country_name": "Pakistan",
    
    // Rating (if you have reviews)
    "rating": "4.8",
    "review_count": "500+",
    
    // Price Range
    "price_range": "Rs 200 - Rs 2000",
    
    // Cuisine
    "cuisine": "Pakistani, Fast Food, BBQ, Pizza, Burgers",
    
    // Payment Methods
    "payment_methods": "Cash on Delivery, Online Payment, Credit Card",
    
    // Delivery
    "delivery": "Available",
    "delivery_time": "30-45 minutes",
    
    // Mobile Optimized
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* JSON-LD Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": "Several Restaurant",
            "description": "Best food delivery restaurant in Faisalabad offering authentic Pakistani cuisine, fast food, pizza, burgers, BBQ, and more.",
            "url": "https://several.life",
            "logo": "https://several.life/images/logo-severl.png",
            "image": "https://several.life/images/restaurant-hero.jpg",
            "priceRange": "Rs 200 - Rs 2000",
            "servesCuisine": ["Pakistani", "Fast Food", "BBQ", "Pizza", "Burgers", "Biryani"],
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Your Street Address",
              "addressLocality": "Faisalabad",
              "addressRegion": "Punjab",
              "postalCode": "38000",
              "addressCountry": "PK"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "31.4504", // Replace with actual coordinates
              "longitude": "73.1350"
            },
            "telephone": "+923290039757", // Add your phone
            "email": "info@several.life",
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "11:00",
                "closes": "23:00"
              }
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "500",
              "bestRating": "5",
              "worstRating": "1"
            },
            "paymentAccepted": "Cash, Credit Card, Online Payment",
            "acceptsReservations": "True"
          })
        }}
      />

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Several Restaurant",
            "alternateName": "Several - The Taste Of Life",
            "url": "https://several.life",
            "logo": "https://several.life/images/logo-severl.png",
            "sameAs": [
              "https://www.facebook.com/severalrestaurant", // Add your social links
              "https://www.instagram.com/severalrestaurant",
              "https://twitter.com/SeveralRestaurant"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "03290039757",
              "contactType": "Customer Service",
              "areaServed": "PK",
              "availableLanguage": ["English", "Urdu"]
            }
          })
        }}
      />

      {/* Local Business Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Several Restaurant",
            "image": "https://several.life/images/restaurant-exterior.jpg",
            "@id": "https://several.life",
            "url": "https://several.life",
            "telephone": "+92-300-XXXXXXX",
            "priceRange": "Rs 200 - Rs 2000",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Your Street Address",
              "addressLocality": "Faisalabad",
              "addressRegion": "Punjab",
              "postalCode": "38000",
              "addressCountry": "PK"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 31.4504,
              "longitude": 73.1350
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "11:00",
              "closes": "23:00"
            }
          })
        }}
      />

      <DataProvider>
        <CartProvider>
          <Navigation />
          <main id="main-content" role="main">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </DataProvider>
    </>
  );
}