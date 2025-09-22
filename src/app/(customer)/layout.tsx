import { ReactNode } from "react";

export default function CustomerLayout({
  children,
}: { children: ReactNode }) {
  return (
    <div>
      <header className="bg-blue-500 text-white p-4">Customer Navbar</header>
      <main>{children}</main>
      <footer className="bg-gray-200 p-4 text-center">Footer</footer>
    </div>
  );
}
