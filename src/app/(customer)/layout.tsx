import Footer from "@/components/layout/Footer";
import Navigation from "@/components/layout/Navigation";
import SmoothScrolling from "@/components/SmoothScrolling";
import { ReactNode } from "react";

export const metadata = {
  title: "Several - The Taste Of Life",
  description: "Customer dashboard and pages",
};

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      <SmoothScrolling/>
      <main>{children}</main>
      <Footer/>
    </>
  );
}
