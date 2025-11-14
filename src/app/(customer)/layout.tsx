// app/(customer)/layout.tsx
import Footer from "@/components/layout/Footer";
import Navigation from "@/components/layout/Navigation";
import { DataProvider } from "@/context/DataContext";
import { CartProvider } from "@/context/CartContext";
import { ReactNode } from "react";

export const metadata = {
  title: "Several - The Taste Of Life",
  description: "Customer dashboard and pages",
};

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <CartProvider>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </CartProvider>
    </DataProvider>
  );
}