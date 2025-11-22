// components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

const Footer = () => {
  const router = useRouter();
  
  // Check if current page is home
  const isHomePage = router.pathname === '/';

  // Handle navigation with hash - same logic as navbar
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, targetId: string) => {
    e.preventDefault();
    
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
  };

  // Navigation items - same as navbar for consistency
  const navItems = [
    { id: 'desa-wisata', label: 'Desa Wisata' },
    { id: 'eduwisata', label: 'Paket Eduwisata' },
    { id: 'products', label: 'Belanja Batik' },
    { id: 'games', label: 'Games Interaktif' },
  ];
 const handleclickkontak =()=>{
    const whatsappUrl = `https://wa.me/6288233167718`;
    window.open(whatsappUrl, '_blank');
  };
  return (
    <footer className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12 lg:py-16 px-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url('https://cdn.pixabay.com/photo/2020/11/29/10/42/batik-5787948_1280.jpg')`,
          backgroundSize: '300px 300px',
          backgroundRepeat: 'repeat',
        }}
      />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-4 bg-white backdrop-blur-md px-3 py-2 rounded-2xl w-max border border-amber-500/30">
              <Image 
                src="/LOGO-DIGIRI.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-30 h-20 object-contain"
              />
            </div>
            <p className="text-blue-200 mb-6 text-sm lg:text-base leading-relaxed">
              DIGIRI - Menjembatani antara yang tak terhingga dan yang tak terbatas, tempat tradisi menemukan inovasinya, dan setiap karya menemukan nilai sejatinya. Kami bukan hanya menjual batik; kami merayakan cerita, menjaga warisan, dan memberdayakan mimpi menjadi kenyataan yang abadi dan menyejahterakan.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold mb-4 text-base lg:text-lg text-amber-300">Jelajahi</h4>
            <ul className="space-y-2 text-blue-200 text-sm lg:text-base">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className="hover:text-amber-300 transition cursor-pointer block py-1"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support  */}
           <div>
            <h4 className="font-bold mb-4 text-base lg:text-lg text-amber-300">Bantuan</h4>
            <ul className="space-y-2 text-blue-200 text-sm lg:text-base">
              {/* <li>
                <Link href="/bookingwisatapage" className="hover:text-amber-300 transition block py-1">
                  Booking Paket eduwisata
                </Link>
              </li>
              <li>
                <Link href="/panduan-wisata" className="hover:text-amber-300 transition block py-1">
                  Panduan Wisata
                </Link>
              </li>
              <li>
                <Link href="/panduan-nft" className="hover:text-amber-300 transition block py-1">
                  Panduan NFT
                </Link>
              </li> */}
              <li>
                <Link href="#" onClick={handleclickkontak} className="hover:text-amber-300 transition block py-1">
                  Kontak Kami
                </Link>
              </li> 
            </ul>
          </div> 
        </div>

        <div className="border-t border-blue-700 pt-8 text-center">
          <p className="text-blue-300 text-sm lg:text-base mb-2">
           2025 DIGIRI. Powered by Next.js • NestJS • Crossmint • Midtrans
          </p>
          <p className="text-blue-400 text-xs">
            UNWTO World Best Tourism Village 2024 • Kampung Batik Giriloyo
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;