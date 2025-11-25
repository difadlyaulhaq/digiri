// components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Menu, X, ShoppingCart, ShoppingBag, Sparkles, ChevronRight } from 'lucide-react';
import { getCartItemCount } from '@/utils/cartUtils';

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Set mounted state
  useEffect(() => {
    setMounted(true);
    setCurrentPath(window.location.pathname);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  const isHomePage = mounted && router.pathname === '/';

  // Load cart count logic
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

  // Handle navigation with hash for Eduwisata, Belanja, Games
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

  // Navigation items - URUTAN BARU DAN AI ASISTANT TERINTEGRASI
  const navItems = [
    { id: 'home', label: 'Beranda', href: '/' },
    { 
      id: 'verify-certificate', 
      label: 'Verifikasi NFT', // Mengganti nama menu
      href: '/verify-certificate', 
      customIcon: '/verified.png' 
    },
    { id: 'products', label: 'Belanja', href: null }, // URUTAN BARU
    { id: 'eduwisata', label: 'Eduwisata', href: null }, // URUTAN BARU
    { id: 'games', label: 'Games', href: null }, // URUTAN BARU
    { id: 'ai', label: 'Tanya AI Assistant', href: '/ai', isAICustom: true }, // AI ASISTEN BARU
    { id: 'feedback', label: 'Ulasan', href: '/feedback' }, // URUTAN BARU
  ];

  // Helper function to check if link is active
  const isLinkActive = (href: string | null) => {
    if (!mounted) return false;
    if (!href) return false;
    return currentPath === href || router.pathname === href;
  };

  return (
    <>
      {/* Navbar Container - Sticky for modern feel */}
      <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* LEFT: Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="cursor-pointer transition hover:opacity-90">
                <div className="relative w-28 h-16 sm:w-32 sm:h-20"> 
                  <Image 
                    src="/LOGO-DIGIRI-removebg.png"
                    alt="Logo Digiri"
                    fill  
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>
            
            {/* CENTER: Desktop Menu (Hidden on Mobile) */}
            <div className="hidden lg:flex items-center justify-center space-x-1 xl:space-x-2 flex-1 px-4">
              {navItems.map((item) => {
                const active = isLinkActive(item.href);
                
                // Styling base class
                const baseClasses = `flex items-center text-sm font-medium px-3 py-2 rounded-full transition-all duration-200`;

                // Logic untuk AI Assistant
                if (item.isAICustom) {
                  return (
                    <button
                      key={item.id}
                      onClick={handleAIClick}
                      className="flex items-center gap-2 text-slate-700 hover:text-amber-600 transition font-medium px-3 py-2 rounded-lg hover:bg-amber-50"
                    >
                      <Sparkles size={18} className="text-amber-500" />
                      {item.label}
                    </button>
                  );
                }

                // Logic untuk Link biasa (Verifikasi, Ulasan, Beranda)
                if (item.href) {
                  const linkClasses = `${baseClasses} ${
                    active 
                      ? 'text-blue-900 bg-blue-50 font-semibold' 
                      : 'text-slate-600 hover:text-blue-800 hover:bg-slate-50'
                  }`;
                  return (
                    <Link key={item.id} href={item.href} className={linkClasses}>
                      {item.customIcon && (
                        <div className="w-6 h-6 relative mr-2">
                          <Image src={item.customIcon} alt="" fill className="object-contain" />
                        </div>
                      )}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                } 
                
                // Logic untuk Button Scroll (Belanja, Eduwisata, Games)
                else {
                  const buttonClasses = `${baseClasses} text-slate-600 hover:text-blue-800 hover:bg-slate-50`;
                  return (
                    <button key={item.id} onClick={() => handleNavClick(item.id)} className={buttonClasses}>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                }
              })}
            </div>

            {/* RIGHT: Actions (Desktop) */}
            {/* Orders, Cart, Booking CTA (AI Button dihapus dari sini) */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              {/* Cart & Orders Group */}
              <div className="flex items-center space-x-1">
                <Link href="/orders" className="p-2.5 rounded-full text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition relative group">
                  <ShoppingBag size={20} />
                  <span className="absolute hidden group-hover:block top-full mt-1 text-xs bg-slate-800 text-white px-2 py-1 rounded">Pesanan</span>
                </Link>

                <Link href="/keranjang" className="p-2.5 rounded-full text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition relative">
                  <ShoppingCart size={20} />
                  {mounted && cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-white">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Booking CTA */}
              <Link href="/bookingwisatapage" className="ml-2">
                <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  Booking
                </button>
              </Link>
            </div>

            {/* MOBILE TOGGLE & CART */}
            <div className="lg:hidden flex items-center gap-3">
              {/* Mobile Cart Icon */}
              <Link href="/keranjang" className="relative p-2 text-slate-700">
                <ShoppingCart size={22} />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              <button 
                onClick={() => setMenuOpen(true)}
                className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                aria-label="Open menu"
              >
                <Menu size={26} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MOBILE MENU OVERLAY (DRAWER STYLE) ================= */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out lg:hidden flex flex-col ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100">
          <span className="text-lg font-bold text-slate-800">Menu</span>
          <button 
            onClick={() => setMenuOpen(false)}
            className="p-2 -mr-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile Content Scrollable */}
        <div className="flex-1 overflow-y-auto py-6 px-6 flex flex-col gap-2">
          
          {/* Main Links */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isLinkActive(item.href);
              const containerClass = `w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200`;

              // Logic untuk AI Assistant di Mobile
              if (item.isAICustom) {
                return (
                  <button
                    key={item.id}
                    onClick={handleAIClick}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition text-left"
                  >
                    <Sparkles size={20} className="text-amber-600" />
                    {item.label}
                  </button>
                );
              }
              
              const baseLinkClass = active 
                  ? 'bg-blue-50 text-blue-900 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-900';

              const Content = () => (
                <>
                  <div className="flex items-center gap-3">
                    {item.customIcon && (
                      <div className="w-6 h-6 relative">
                        <Image src={item.customIcon} alt="" fill className="object-contain" />
                      </div>
                    )}
                    <span className="text-base">{item.label}</span>
                  </div>
                  {!active && item.href && <ChevronRight size={16} className="text-slate-300" />}
                </>
              );

              if (item.href) {
                return (
                  <Link key={item.id} href={item.href} className={`${containerClass} ${baseLinkClass}`} onClick={() => setMenuOpen(false)}>
                    <Content />
                  </Link>
                );
              } else {
                return (
                  <button key={item.id} onClick={() => handleNavClick(item.id)} className={`${containerClass} ${baseLinkClass} text-left`}>
                    <Content />
                  </button>
                );
              }
            })}
          </div>

          <div className="my-2 border-t border-slate-100"></div>

          {/* Other Actions Mobile */}
          <div className="space-y-3">
            {/* Orders Link Mobile */}
            <Link 
              href="/orders" 
              className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-600 hover:bg-slate-50 transition"
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingBag size={20} />
              Pesanan Saya
            </Link>
          </div>
        </div>

        {/* Mobile Footer (Booking Button) */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <Link href="/bookingwisatapage" onClick={() => setMenuOpen(false)}>
            <button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3.5 rounded-xl font-bold text-center shadow-md active:scale-95 transition-transform">
              Booking Paket Wisata
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;