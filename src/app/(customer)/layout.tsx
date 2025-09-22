import Navigation from "@/components/layout/Navigation";
import { ReactNode } from "react";

export const metadata = {
  title: "Customer Area | Severl",
  description: "Customer dashboard and pages",
};

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation/>
        <main>{children}</main>
        <footer className="bg-gray-200 p-4 text-center">
          Footer
        </footer>
      </body>
    </html>
  );
}
