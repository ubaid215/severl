// components/Footer.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  UtensilsCrossed,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#101828] border-t-2 border-yellow-500/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo-severl1.png"
                alt="Several - The Taste Of Life"
                width={200}
                height={60}
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Contact Info - Compact */}
          <div className="bg-black/20 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 text-center">
              Contact Us
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-yellow-500" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-yellow-500" />
                <span>info@severl.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-300">
                <MapPin className="w-4 h-4 text-yellow-500" />
                <span>Faisalabad, Punjab, PK</span>
              </div>
            </div>
          </div>

          {/* Quick Links - Horizontal */}
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
            <Link
              href="/menu"
              className="text-gray-300 hover:text-yellow-500 transition-colors"
            >
              Menu
            </Link>
            <Link
              href="/about"
              className="text-gray-300 hover:text-yellow-500 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-300 hover:text-yellow-500 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/privacy"
              className="text-gray-300 hover:text-yellow-500 transition-colors"
            >
              Privacy
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-6">
            <a
              href="#"
              className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4 text-yellow-500" />
            </a>
            <a
              href="#"
              className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4 text-yellow-500" />
            </a>
            <a
              href="#"
              className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4 text-yellow-500" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs text-gray-400 border-t border-yellow-500/20 pt-4">
            © {currentYear} Severl. All rights reserved.
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Logo at Top Center */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo-severl1.png"
                alt="Several - The Taste Of Life"
                width={200}
                height={60}
                className="h-32 w-auto"
              />
            </Link>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-white font-semibold mb-4">About Severl</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Experience the authentic taste of life with our carefully
                crafted dishes. We bring you the finest flavors that celebrate
                tradition and innovation.
              </p>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span>Open 24/7</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/menu"
                    className="text-gray-300 hover:text-yellow-500 transition-colors"
                  >
                    Our Menu
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-yellow-500 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-300 hover:text-yellow-500 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/delivery"
                    className="text-gray-300 hover:text-yellow-500 transition-colors"
                  >
                    Home Delivery
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div className="text-gray-300">
                    <p>P-562/A Opposite Govt. Nusrat Fateh Ali Khan Hospital</p>
                    <p>Peoples Colony No 2</p>
                    <p>Faisalabad</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-yellow-500" />
                  <a
                    href="tel:+923290039757"
                    className="text-gray-300 hover:text-yellow-500 transition-colors"
                  >
                    03290039757
                  </a>{" "}
                  <br />
                  <a
                    href="tel:+923127172184"
                    className="text-gray-300 hover:text-yellow-500 transition-colors"
                  >
                    03127172184
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-yellow-500" />
                  <a
                    href="mailto:info@severl.com"
                    className="text-gray-300 hover:text-yellow-500 transition-colors"
                  >
                    info@severl.com
                  </a>
                </div>
              </div>

              {/* Social Media */}
              <div className="mt-4">
                <h4 className="text-white font-medium mb-2">Follow Us</h4>
                <div className="flex gap-2">
                  <a
                    href="#"
                    className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4 text-yellow-500" />
                  </a>
                  <a
                    href="#"
                    className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-yellow-500" />
                  </a>
                  <a
                    href="#"
                    className="p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4 text-yellow-500" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-yellow-500/20 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <div className="text-gray-400">
                © {currentYear} Severl - The taste of life. All rights reserved.
              </div>
              <div className="flex gap-6">
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  Terms of Service
                </Link>
                {/* <Link
                  href="/cookies"
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  Cookie Policy
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
