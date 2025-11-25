// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Menu, X, Calendar, ShoppingCart, ShoppingBag, Sparkles } from 'lucide-react';
import { getCartItemCount } from '@/utils/cartUtils';

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Set mounted state and current path after component mounts
  useEffect(() => {
    setMounted(true);
    setCurrentPath(window.location.pathname);
  }, []);

  // Check if current page is home
  const isHomePage = mounted && router.pathname === '/';

  // Load cart count
  useEffect(() => {
    const loadCartCount = async () => {
      const count = await getCartItemCount();
      setCartItemCount(count);
    };

    if (mounted) {
      loadCartCount();
    }

    const handleCartUpdate = async () => {
      const count = await getCartItemCount();
      setCartItemCount(count);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [mounted]);

  // Handle navigation with hash
  const handleNavClick = (targetId: string) => {
    if (isHomePage) {
      // If on home page, scroll to section
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        });
      }
    } else {
      // If on other page, navigate to home with hash
      router.push(`/#${targetId}`);
    }
    
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  // Handle AI Assistant navigation specifically
  const handleAIClick = () => {
    if (isHomePage) {
      // If on home page, scroll to AI section
      const aiSection = document.getElementById('ai');
      if (aiSection) {
        aiSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start' 
        });
      }
    } else {
      // If on other page, navigate to AI chat page
      router.push('/ai');
    }
    
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Beranda', href: '/' },
    { id: 'desa-wisata', label: 'Desa Wisata', href: null },
    { id: 'eduwisata', label: 'Eduwisata', href: null },
    { id: 'products', label: 'Belanja', href: null },
    { id: 'games', label: 'Games', href: null },
    { id: 'feedback', label: 'Ulasan', href: '/feedback' },
  ];

  // Helper function to check if link is active
  const isLinkActive = (href: string | null) => {
    if (!mounted) return false;
    if (!href) return false;
    return currentPath === href || router.pathname === href;
  };

  return (
    <nav className="flex items-center justify-between w-full px-6 py-3 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="cursor-pointer">
              <div className="relative w-30 h-20"> 
                <Image 
                  src="/LOGO-DIGIRI-removebg.png"
                  alt="Logo"
                  fill  
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-8 items-center">
            {navItems.map((item) => {
              if (item.href) {
                return (
                  <Link 
                    key={item.id}
                    href={item.href}
                    className={`text-slate-700 hover:text-blue-900 transition font-medium px-3 py-2 rounded-lg hover:bg-blue-50 ${
                      isLinkActive(item.href) ? 'text-blue-900 bg-blue-50' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              } else {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="text-slate-700 hover:text-blue-900 transition font-medium px-3 py-2 rounded-lg hover:bg-blue-50"
                  >
                    {item.label}
                  </button>
                );
              }
            })}

            {/* AI Assistant Button */}
            <button
              onClick={handleAIClick}
              className="flex items-center gap-2 text-slate-700 hover:text-amber-600 transition font-medium px-3 py-2 rounded-lg hover:bg-amber-50"
            >
              <Sparkles size={18} className="text-amber-500" />
              AI Assistant
            </button>

            {/* Booking & Cart Section */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
              <Link href="/bookingwisatapage">
                <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-xl transition transform hover:scale-105">
                  Booking Paket
                </button>
              </Link>

              {/* Orders Link - Icon Only */}
              <Link href="/orders" className="text-slate-700 hover:text-blue-900 transition p-2 rounded-lg hover:bg-blue-50 relative">
                <ShoppingBag size={20} />
              </Link>

              {/* Cart with counter - Icon Only */}
              <Link href="/keranjang" className="relative text-slate-700 hover:text-blue-900 transition p-2 rounded-lg hover:bg-blue-50">
                <ShoppingCart size={20} />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            {/* Cart Icon for mobile */}
            <Link href="/keranjang" className="relative p-2">
              <ShoppingCart size={24} className="text-blue-900" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-blue-100 transition"
            >
              {menuOpen ? <X size={24} className="text-blue-900" /> : <Menu size={24} className="text-blue-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-blue-200 animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              if (item.href) {
                return (
                  <Link 
                    key={item.id}
                    href={item.href}
                    className={`block py-3 text-slate-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg px-4 transition font-medium ${
                      isLinkActive(item.href) ? 'text-blue-900 bg-blue-50' : ''
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              } else {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="block py-3 text-slate-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg px-4 transition font-medium w-full text-left"
                  >
                    {item.label}
                  </button>
                );
              }
            })}

            {/* AI Assistant for Mobile */}
            <button
              onClick={handleAIClick}
              className="flex items-center gap-3 py-3 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg px-4 transition font-medium w-full text-left"
            >
              <Sparkles size={20} className="text-amber-500" />
              AI Assistant
            </button>

            {/* Separator */}
            <div className="border-t border-slate-200 pt-2"></div>

            {/* Orders Link for Mobile */}
            <Link 
              href="/orders" 
              className="flex items-center gap-3 py-3 text-slate-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg px-4 transition font-medium"
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingBag size={20} />
              Pesanan Saya
            </Link>

            {/* Booking Button for Mobile */}
            <Link 
              href="/bookingwisatapage" 
              className="block w-full"
              onClick={() => setMenuOpen(false)}
            >
              <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-full font-semibold">
                Booking Paket
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;