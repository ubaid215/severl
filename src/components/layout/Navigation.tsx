// components/Navigation.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Home, UtensilsCrossed, Phone, User } from "lucide-react";
import CartDrawer from "../cart/CartDrawer";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize session ID
  useEffect(() => {
    let existingSessionId = localStorage.getItem("sessionId");
    if (!existingSessionId) {
      existingSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", existingSessionId);
    }
    setSessionId(existingSessionId);
  }, []);

  // Fetch cart item count
  const fetchCartCount = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setCartItemCount(data.data.itemCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  // Fetch cart count on mount and periodically
  useEffect(() => {
    if (sessionId) {
      fetchCartCount();
      // Optionally refresh count every 30 seconds
      const interval = setInterval(fetchCartCount, 30000);
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  // Listen for cart updates (you can trigger this from other components)
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [sessionId]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/contact", label: "Contact", icon: Phone },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      <nav className="bg-[#101828] border-b-2 border-yellow-500/20 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-yellow-500 p-2 rounded-lg">
                <UtensilsCrossed className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold text-white">
                Tasty<span className="text-yellow-500">Bites</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-1 text-gray-300 hover:text-yellow-500 transition-colors font-medium"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Cart & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-yellow-500" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 bg-yellow-500/10 hover:bg-yellow-500/20 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Menu className="w-6 h-6 text-yellow-500" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-yellow-500/20 absolute z-50 bg-[#101828] w-full">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile Cart Link */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/10 rounded-lg transition-colors font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 ml-auto">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        sessionId={sessionId}
      />
    </>
  );
}