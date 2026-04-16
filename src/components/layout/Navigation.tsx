"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Home, UtensilsCrossed, Phone } from "lucide-react";
import CartDrawer from "../cart/CartDrawer";
import { useCart } from "@/context/CartContext";
import gsap from "gsap";

/* ─── Animated Cart SVG ─── */
function AnimatedCartIcon() {
  return (
    <svg
      className="cart-icon"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <style>{`
        .cart-icon .cart-body {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: 12px 10px;
        }
        .cart-icon .cart-item-1,
        .cart-icon .cart-item-2 {
          transform: scaleY(0);
          transform-origin: center bottom;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cart-icon .wheel-left,
        .cart-icon .wheel-right {
          transition: transform 0.4s ease;
          transform-origin: center center;
        }
        .cart-icon .handle {
          transition: stroke-dashoffset 0.3s ease;
          stroke-dasharray: 14;
          stroke-dashoffset: 0;
        }

        /* Hover states via parent button */
        button:hover .cart-icon .cart-body {
          transform: translateY(-1.5px) scale(1.06);
        }
        button:hover .cart-icon .cart-item-1 {
          transform: scaleY(1);
          transition-delay: 0.05s;
        }
        button:hover .cart-icon .cart-item-2 {
          transform: scaleY(1);
          transition-delay: 0.12s;
        }
        button:hover .cart-icon .wheel-left {
          transform: rotate(360deg);
          transform-origin: 9px 20px;
        }
        button:hover .cart-icon .wheel-right {
          transform: rotate(-360deg);
          transform-origin: 17px 20px;
        }
        button:hover .cart-icon .handle {
          stroke-dashoffset: 14;
        }
      `}</style>

      {/* Handle / pole */}
      <path
        className="handle"
        d="M2 3h2l.5 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Cart body */}
      <g className="cart-body">
        {/* Cart base shape */}
        <path
          d="M4.5 5h15l-1.5 9H6L4.5 5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Item 1 — left box inside cart */}
        <rect
          className="cart-item-1"
          x="7"
          y="9"
          width="3"
          height="3"
          rx="0.4"
          fill="currentColor"
          opacity="0.75"
        />
        {/* Item 2 — right box inside cart */}
        <rect
          className="cart-item-2"
          x="12"
          y="8.5"
          width="3.5"
          height="3.5"
          rx="0.4"
          fill="currentColor"
          opacity="0.75"
        />
      </g>

      {/* Wheels */}
      <circle
        className="wheel-left"
        cx="9"
        cy="20"
        r="1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <circle
        className="wheel-right"
        cx="17"
        cy="20"
        r="1.4"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
    </svg>
  );
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { cart } = useCart();
  const cartItemCount = cart?.totalItems || 0;

  const overlayRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLElement | null)[]>([]);
  const lineDividerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!overlayRef.current) return;

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";

      gsap.set(overlayRef.current, { display: "flex" });

      tlRef.current = gsap.timeline({ defaults: { ease: "expo.out" } });

      tlRef.current
        .fromTo(
          overlayRef.current,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7 }
        )
        .fromTo(
          lineDividerRef.current,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.5 },
          "-=0.3"
        )
        .fromTo(
          menuItemsRef.current.filter(Boolean),
          { y: 80, opacity: 0, rotationX: -15 },
          { y: 0, opacity: 1, rotationX: 0, duration: 0.7, stagger: 0.1 },
          "-=0.35"
        )
        .fromTo(
          closeBtnRef.current,
          { scale: 0, rotation: -90, opacity: 0 },
          { scale: 1, rotation: 0, opacity: 1, duration: 0.45, ease: "back.out(1.7)" },
          "-=0.5"
        );
    } else {
      document.body.style.overflow = "";

      if (tlRef.current) tlRef.current.kill();

      gsap.to(overlayRef.current, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.5,
        ease: "expo.in",
        onComplete: () => {
          if (overlayRef.current) gsap.set(overlayRef.current, { display: "none" });
        },
      });
    }

    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* ─── NAV BAR ─── */}
      <nav
        className={`sticky top-0 z-30 transition-all duration-500 ${
          isScrolled
            ? "bg-[#1A1C20]/60 backdrop-blur-xl border-b border-yellow-500/20 shadow-[0_4px_32px_rgba(0,0,0,0.35)]"
            : "bg-[#111215] border-b-2 border-yellow-500/20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/images/logo-severl.png"
                alt="Several – The Taste Of Life"
                width={180}
                height={100}
                className="h-14 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation (centred) — text-base instead of text-sm */}
            <div className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium text-base tracking-wide"
                  >
                    <Icon className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="relative after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-yellow-400 after:transition-all after:duration-300 group-hover:after:w-full">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right side: cart + hamburger */}
            <div className="flex items-center gap-3">
              {/* Animated Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open cart"
                className="relative p-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-200 ring-0 hover:ring-1 hover:ring-yellow-500/30 text-yellow-400"
              >
                <AnimatedCartIcon />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </button>

              {/* Hamburger (mobile) */}
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                className="md:hidden p-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors duration-200"
              >
                <Menu className="w-5 h-5 text-yellow-400" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── FULL-SCREEN MOBILE OVERLAY ─── */}
      <div
        ref={overlayRef}
        style={{ display: "none", clipPath: "inset(0% 0% 100% 0%)" }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1A1C20]/95 backdrop-blur-2xl md:hidden"
      >
        {/* Close button */}
        <button
          ref={closeBtnRef}
          onClick={closeMenu}
          aria-label="Close menu"
          className="absolute top-5 right-5 p-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors"
        >
          <X className="w-5 h-5 text-yellow-400" />
        </button>

        {/* Divider line */}
        <div
          ref={lineDividerRef}
          className="absolute top-[4.5rem] left-8 right-8 h-px bg-yellow-500/20"
        />

        {/* Nav items */}
        <nav className="flex flex-col items-center gap-1 w-full max-w-xs px-8 perspective-[800px]">
          {navLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => { menuItemsRef.current[i] = el; }}
                onClick={closeMenu}
                className="group w-full flex items-center justify-center gap-3 py-4 text-3xl font-semibold text-gray-200 hover:text-yellow-400 transition-colors duration-200 tracking-tight border-b border-yellow-500/10 last:border-0"
              >
                <Icon className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Cart link in mobile menu */}
          <button
            ref={(el) => { menuItemsRef.current[navLinks.length] = el; }}
            onClick={() => { closeMenu(); setIsCartOpen(true); }}
            className="group w-full flex items-center justify-center gap-3 py-4 text-3xl font-semibold text-gray-200 hover:text-yellow-400 transition-colors duration-200 tracking-tight text-yellow-400"
          >
            <AnimatedCartIcon />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-1">
                {cartItemCount}
              </span>
            )}
          </button>
        </nav>

        {/* Ambient glow decoration */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-yellow-500/10 blur-3xl rounded-full" />
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onCloseAction={() => setIsCartOpen(false)} />
    </>
  );
}