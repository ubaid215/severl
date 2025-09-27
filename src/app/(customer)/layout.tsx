import Footer from "@/components/layout/Footer";
import Navigation from "@/components/layout/Navigation";
import { ReactNode } from "react";

export const metadata = {
  title: "Several - The Taste Of Life",
  description: "Customer dashboard and pages",
};

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer/>
    </>
  );
}
