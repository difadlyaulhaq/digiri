import React, { useState, useEffect } from 'react';
// PERBAIKAN: Impor Link untuk routing
import Link from 'next/link';
import { ShoppingBag, Gamepad2, Brain, Sparkles, Menu, X, ChevronRight, Award, Zap, Search, User, MapPin, Calendar, Users, Mountain, BookOpen, School, Home, Palette } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import products from '@/data/products';

const GiriloyoLanding = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showFloating, setShowFloating] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowFloating(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

// PERBAIKAN: Gunakan data produk dari products.ts yang sudah diperbaiki
const featuredProducts = products.slice(0, 6).map(product => ({
  id: product.id,
  name: product.name,
  price: new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(product.price),
  image: product.image,
  artisan: product.artisan,
  motif: product.motif,
  slug: product.slug // PERBAIKAN: Tambahkan slug untuk routing
}));
  const paketEduwisata = [
    {
      title: "Paket Half Day",
      duration: "4-5 Jam",
      price: "Rp 150.000/pax",
      features: [
        "Workshop Membatik 2 jam",
        "Tour Sentra Batik",
        "Welcome Drink",
        "Sertifikat & Hasil Karya"
      ],
      popular: false
    },
    {
      title: "Paket Full Day",
      duration: "8-9 Jam",
      price: "Rp 275.000/pax",
      features: [
        "Workshop Membatik 4 jam",
        "Makan Siang Tradisional",
        "Trekking Desa & Watu Gagak",
        "Homestay Experience",
        "Sertifikat & Hasil Karya"
      ],
      popular: true
    },
    {
      title: "Paket Study Tour",
      duration: "2 Hari 1 Malam",
      price: "Rp 450.000/pax",
      features: [
        "Workshop Batik Intensif",
        "Menginap di Homestay",
        "3x Makan (Lunch, Dinner, Breakfast)",
        "Cultural Night",
        "Dokumentasi Profesional",
        "Sertifikat & Souvenir"
      ],
      popular: false
    }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const targetId = e.currentTarget.href.split('#')[1];
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 overflow-x-hidden">
      {/* Animated Batik Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div 
          className="absolute inset-0 animate-bg-scroll-slow"
          style={{
            backgroundImage: `url('/batik2.jpg')`,
            backgroundSize: '300px 300px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      {/* Floating Action Buttons */}
      {showFloating && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-3">
          <button 
            onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}
            // PERBAIKAN: bg-linear-to-r -> bg-gradient-to-r
            className="group relative bg-gradient-to-r from-amber-600 to-amber-700 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-amber-500/50 transition transform hover:scale-110 flex items-center justify-center"
          >
            <Gamepad2 size={24} />
            <span className="absolute right-16 bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Game Batik
            </span>
          </button>
          
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            // PERBAIKAN: bg-linear-to-r -> bg-gradient-to-r
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-blue-500/50 transition transform hover:scale-110 flex items-center justify-center"
          >
            <ShoppingBag size={24} />
            <span className="absolute right-16 bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Belanja Batik
            </span>
          </button>
          
          <button 
            onClick={() => document.getElementById('ai')?.scrollIntoView({ behavior: 'smooth' })}
            // PERBAIKAN: bg-linear-to-r -> bg-gradient-to-r
            className="group relative bg-gradient-to-r from-purple-600 to-purple-700 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-110 flex items-center justify-center animate-pulse"
          >
            <Sparkles size={24} />
            <span className="absolute right-16 bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              AI Insight
            </span>
          </button>
          
          <Link href="/bookingwisatapage" passHref>
            <button 

              className="group relative bg-gradient-to-r from-green-600 to-emerald-700 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-green-500/50 transition transform hover:scale-110 flex items-center justify-center"
            >
              <School size={24} />
              <span className="absolute right-16 bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                Booking Paket
              </span>
            </button>
          </Link>
          <Link href="/keranjang" passHref>
          <button 
            className="group relative bg-gradient-to-r from-red-600 to-red-700 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-red-500/50 transition transform hover:scale-110 flex items-center justify-center"
          >
            <ShoppingBag size={24} />
            <span className="absolute right-16 bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Keranjang
            </span>
          </button>
        </Link>
        </div>
      )}

      {/* Navigation */}
      <Navbar />

      {/* Hero Section - Desa Wisata Focused */}
      <section id="home" className="relative py-12 lg:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0 animate-slide-right"
            style={{
              backgroundImage: `url('https://cdn.pixabay.com/photo/2020/11/29/10/41/batik-5787937_1280.jpg')`,
              backgroundSize: '300px 300px',
              backgroundRepeat: 'repeat',
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2 rounded-full text-sm font-bold mb-4">
                <Award className="w-5 h-5" />
                <span>Best Tourism Village - UNESCO</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                <span className="block text-stone-800 mb-2">Desa Wisata</span>
                {/* PERBAIKAN: bg-linear-to-r -> bg-gradient-to-r */}
                <span className="block bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 bg-clip-text text-transparent">Batik Giriloyo</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Jelajahi warisan batik tulis UNESCO, booking paket eduwisata, bermain game interaktif, dan belanja batik autentik dengan NFT digital
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                {/* PERBAIKAN: Implementasi Routing */}
                <Link href="/bookingwisatapage">
                  <button 
                    // PERBAIKAN: bg-linear-to-r -> bg-gradient-to-r
                    className="bg-gradient-to-r from-amber-800 to-amber-900 text-amber-50 px-8 py-4 rounded-full font-semibold hover:shadow-2xl transform hover:scale-105 transition text-base lg:text-lg flex items-center justify-center gap-2"
                  >
                    <Calendar size={22} />
                    Booking Paket Wisata
                  </button>
                </Link>
                <button 
                  onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-amber-800 px-8 py-4 rounded-full font-semibold border-2 border-amber-800 hover:bg-amber-50 transition text-base lg:text-lg flex items-center justify-center gap-2"
                >
                  <Gamepad2 size={22} />
                  Coba Game Batik
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-amber-700">50+</p>
                  <p className="text-xs lg:text-sm text-stone-600">Pengrajin</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-amber-700">300+</p>
                  <p className="text-xs lg:text-sm text-stone-600">Motif Batik</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-amber-700">2K+</p>
                  <p className="text-xs lg:text-sm text-stone-600">Wisatawan</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 w-full max-w-md lg:max-w-xl relative">
              <div className="relative">
                {/* PERBAIKAN: bg-linear-to-br -> bg-gradient-to-br */}
                <div className="absolute -inset-4 bg-gradient-to-br from-amber-300 to-amber-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <img 
                  src="/Muslimbatik.png" 
                  alt="Batik Model"
                  className="relative w-full h-auto rounded-3xl shadow-2xl"
                />
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <School className="w-6 h-6 text-amber-800" />
                      <div>
                        <p className="text-xs text-stone-500">Eduwisata</p>
                        <p className="text-sm font-bold text-stone-800">3 Paket Tersedia</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <Palette className="w-6 h-6 text-amber-800" />
                      <div>
                        <p className="text-xs text-stone-500">Workshop</p>
                        <p className="text-sm font-bold text-stone-800">Membatik Tulis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desa Wisata Highlight Section */}
      {/* PERBAIKAN: bg-linear-to-br -> bg-gradient-to-br */}
      <section id="desa-wisata" className="py-16 lg:py-24 px-4 bg-gradient-to-br from-amber-100 to-orange-100 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-stone-800 mb-4">
              Kenapa Harus Giriloyo?
            </h2>
            <p className="text-base lg:text-lg text-stone-600 max-w-3xl mx-auto">
              Desa wisata terbaik dunia versi UNESCO dengan pengalaman batik autentik yang tak terlupakan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition text-center transform hover:-translate-y-2">
              {/* PERBAIKAN: bg-linear-to-br -> bg-gradient-to-br */}
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-stone-800 mb-2">UNESCO Heritage</h3>
              <p className="text-sm text-stone-600">Diakui dunia sebagai Best Tourism Village 2021</p>
            </div>

            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition text-center transform hover:-translate-y-2">
              {/* PERBAIKAN: bg-linear-to-brrom -> bg-gradient-to-br from */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-stone-800 mb-2">50+ Pengrajin</h3>
              <p className="text-sm text-stone-600">Komunitas batik tulis terbesar di Yogyakarta</p>
            </div>

            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition text-center transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-stone-800 mb-2">Workshop Batik</h3>
              <p className="text-sm text-stone-600">Belajar langsung dari master pengrajin</p>
            </div>

            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition text-center transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-stone-800 mb-2">Homestay Desa</h3>
              <p className="text-sm text-stone-600">Pengalaman menginap autentik di rumah warga</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-red-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition"></div>
              <img 
                src="/modelcanting.png"
                alt="Desa Giriloyo"
                className="relative w-full h-auto rounded-3xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl lg:text-4xl font-bold text-stone-800">
                Lebih Dari Sekedar Wisata
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Giriloyo adalah jantung dari tradisi batik tulis yang telah berusia ratusan tahun. Di sini, Anda tidak hanya berkunjung, tetapi merasakan kehidupan nyata para pengrajin batik.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 mb-1">Belajar Filosofi Batik</h4>
                    <p className="text-sm text-stone-600">Setiap motif memiliki makna dan cerita yang mendalam</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mountain className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 mb-1">Eksplorasi Alam</h4>
                    <p className="text-sm text-stone-600">Trekking ke Watu Gagak dengan view spektakuler</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 mb-1">Interaksi dengan Warga</h4>
                    <p className="text-sm text-stone-600">Rasakan kehangatan masyarakat desa yang ramah</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Paket Eduwisata Section */}
      <section id="eduwisata" className="py-16 lg:py-24 px-4 bg-white relative">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url('https://cdn.pixabay.com/photo/2020/11/29/10/42/batik-5787950_1280.jpg')`,
            backgroundSize: '250px 250px',
            backgroundRepeat: 'repeat',
          }}
        />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <School className="inline w-5 h-5 mr-2" />
              Paket Eduwisata
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-stone-800 mb-4">
              Pilih Paket Wisata Anda
            </h2>
            <p className="text-base lg:text-lg text-stone-600 max-w-2xl mx-auto">
              Pengalaman belajar batik yang dirancang untuk pelajar, mahasiswa, dan umum
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {paketEduwisata.map((paket, index) => (
              <div 
                key={index}
                className={`relative bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2 ${
                  paket.popular ? 'border-4 border-amber-500' : 'border border-stone-200'
                }`}
              >
                {paket.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    🔥 PALING POPULER
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-stone-800 mb-2">{paket.title}</h3>
                  <p className="text-sm text-stone-600 mb-4">{paket.duration}</p>
                  <div className="text-4xl font-bold text-amber-700 mb-2">{paket.price}</div>
                  <p className="text-xs text-stone-500">Min. 20 peserta</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {paket.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-stone-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                {/* PERBAIKAN: Implementasi Routing */}
                <Link href="/bookingwisatapage" passHref>
                  <button className={`w-full py-4 rounded-full font-bold transition transform hover:scale-105 ${
                    paket.popular
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                  }`}>
                    Booking Sekarang
                  </button>
                </Link>
              </div>
            ))}
          </div>

          {/* PERBAIKAN: bg-linear-to-br -> bg-gradient-to-br */}
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 lg:p-12 text-center">
            <School className="w-16 h-16 text-green-700 mx-auto mb-6" />
            <h3 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-4">
              Paket Khusus untuk Sekolah & Universitas
            </h3>
            <p className="text-stone-700 mb-6 max-w-2xl mx-auto">
              Dapatkan harga spesial untuk rombongan besar! Kami siap menyesuaikan paket sesuai kebutuhan institusi Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-700 px-8 py-4 rounded-full font-bold border-2 border-green-700 hover:bg-green-50 transition">
                <span className="text-2xl mr-2">💬</span>
                Hubungi via WhatsApp
              </button>
              {/* PERBAIKAN: Implementasi Routing */}
              <Link href="/bookingwisatapage" passHref>
                <button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105">
                  Download Proposal Eduwisata
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Games Section */}
      {/* PERBAIKAN: bg-linear-to-br -> bg-gradient-to-br */}
      <section id="games" className="py-16 lg:py-24 px-4 bg-gradient-to-br from-amber-50 to-orange-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-stone-800">
              Pelestarian Batik Secara Imersif
            </h2>
            <p className="text-base lg:text-lg text-stone-600 max-w-2xl mx-auto">
              Jelajahi dunia batik melalui teknologi interaktif dan AI untuk melestarikan warisan budaya
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Game 1 */}
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-transparent hover:border-amber-300">
              {/* PERBAIKAN: bg-linear-to-br -> bg-gradient-to-br */}
              <div className="bg-gradient-to-br from-amber-100 to-amber-200 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mb-6 transform hover:rotate-12 transition">
                <Gamepad2 className="text-amber-800" size={32} />
              </div>
              <div className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold mb-4">
                🎮 PELESTARIAN BUDAYA
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-4 text-stone-800">Mencanting Virtual</h3>
              <p className="text-sm lg:text-base text-stone-600 mb-6 leading-relaxed">
                Rasakan sensasi membatik secara virtual! Ikuti pola tradisional dan pelajari filosofi di balik setiap goresan untuk melestarikan warisan budaya.
              </p>
              <Link href="/mencanting" passHref>
              <button className="text-amber-800 font-semibold flex items-center gap-2 hover:gap-4 transition-all group">
                Main Sekarang 
                <ChevronRight size={20} className="group-hover:animate-bounce" />
              </button>
            </Link>
            </div>

            {/* Game 2 */}
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-300">
              {/* PERBAIKAN: bg-linear-to-br -> bg-gradient-to-br */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mb-6 transform hover:rotate-12 transition">
                <Brain className="text-blue-800" size={32} />
              </div>
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold mb-4">
                🧠 EDUKASI INTERAKTIF
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-4 text-stone-800">Kuis Cerdas Budaya</h3>
              <p className="text-sm lg:text-base text-stone-600 mb-6 leading-relaxed">
                Uji pengetahuan Anda tentang batik! Kompetisi real-time dengan sistem leaderboard yang dinamis.
              </p>
            <Link href="/kuis" passHref>
                <button className="text-blue-800 font-semibold flex items-center gap-2 hover:gap-4 transition-all group">
                Ikut Kuis 
                <ChevronRight size={20} className="group-hover:animate-bounce" />
              </button>
            </Link>
            </div>

            {/* AI Insight */}
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-300 sm:col-span-2 lg:col-span-1">
              {/* PERBAIKAN: bg-linear-to-br -> bg-gradient-to-br */}
              <div className="bg-gradient-to-br from-purple-100 to-pink-200 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mb-6 transform hover:rotate-12 transition">
                <Sparkles className="text-purple-600" size={32} />
              </div>
              <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold mb-4">
                ✨ AI POWERED
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-4 text-stone-800">AI Insight</h3>
              <p className="text-sm lg:text-base text-stone-600 mb-6 leading-relaxed">
                Dapatkan rekomendasi batik personal dari AI yang memahami filosofi dan kecocokan untuk Anda.
              </p>
              <Link href="/ai" passHref>
                            <button className="text-purple-700 font-semibold flex items-center gap-2 hover:gap-4 transition-all group">
                Tanya AI 
                <ChevronRight size={20} className="group-hover:animate-bounce" />
              </button>
            </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 300+ Patterns Section */}
      <section className="py-16 lg:py-24 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-stone-800 mb-4">
              300+ Motif Batik Tulis
            </h2>
            <p className="text-base lg:text-lg text-stone-600 max-w-2xl mx-auto">
              Setiap motif dibuat dengan tangan oleh pengrajin berpengalaman dengan kualitas premium
            </p>
          </div>

          {/* Pattern Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
            {featuredProducts.slice(0, 5).map((product, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer"
              >
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.image}
                    alt={product.motif}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                {/* PERBAIKAN: bg-linear-to-t -> bg-gradient-to-t */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm">{product.motif}</p>
                    <p className="text-amber-200 text-xs">{product.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            {/* PERBAIKAN: Implementasi Routing */}
            <Link href="/produk" passHref>
              <button className="bg-gradient-to-r from-amber-800 to-amber-900 text-amber-50 px-10 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105 text-base lg:text-lg">
                Lihat Semua Motif
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Phygital Banner with Batik Pattern */}
      {/* PERBAIKAN: bg-linear-to-r -> bg-gradient-to-r */}
      <section id="ai" className="py-16 lg:py-24 px-4 bg-gradient-to-r from-purple-800 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Animated Batik Pattern */}
        <div 
          className="absolute inset-0 opacity-10 animate-slide-up"
          style={{
            backgroundImage: `url('https://cdn.pixabay.com/photo/2020/11/29/10/41/batik-5787939_1280.jpg')`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />
        
        <div className="max-w-5xl mx-auto text-center text-white relative z-10">
          <div className="inline-block bg-purple-700/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold mb-6 border border-purple-500/30">
            ✨ AI-Powered Recommendations
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            AI Batik Insight
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
            Bingung memilih motif batik? Tanyakan kepada <span className="font-bold text-purple-300">AI kami</span> untuk mendapatkan rekomendasi berdasarkan kepribadian, acara, dan preferensi Anda
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 lg:p-12 mb-10 border border-white/20">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <input 
                type="text"
                placeholder="Contoh: Saya butuh batik untuk acara formal..."
                className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-base w-full"
              />
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105 whitespace-nowrap">
                <Sparkles className="inline w-5 h-5 mr-2" />
                Tanya AI
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="font-semibold mb-1">🎭 Untuk Acara Formal</p>
              <p className="text-white/80 text-xs">Rekomendasi motif klasik elegan</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="font-semibold mb-1">👔 Untuk Bekerja</p>
              <p className="text-white/80 text-xs">Motif modern profesional</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <p className="font-semibold mb-1">🎉 Untuk Casual</p>
              <p className="text-white/80 text-xs">Motif trendy dan fresh</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section id="products" className="py-16 lg:py-24 px-4 bg-amber-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-stone-800">
              Belanja Batik + NFT Digital
            </h2>
            <p className="text-base lg:text-lg text-stone-600 max-w-2xl mx-auto">
              Setiap pembelian batik dilengkapi dengan <span className="text-amber-600 font-semibold">NFT</span> sebagai sertifikat keaslian digital
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 group border border-stone-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden bg-stone-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  {/* PERBAIKAN: bg-linear-to-t -> bg-gradient-to-t */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                  {/* PERBAIKAN: bg-linear-to-r -> bg-gradient-to-r */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs lg:text-sm font-bold shadow-lg flex items-center gap-1">
                    <Award size={14} />
                    NFT
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-stone-800 px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Motif {product.motif}
                  </div>
                </div>
                <div className="p-5 lg:p-6">
                  <h3 className="text-lg lg:text-xl font-bold mb-2 text-stone-800">{product.name}</h3>
                  <p className="text-stone-600 text-xs lg:text-sm mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Dibuat oleh {product.artisan}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl lg:text-2xl font-bold text-amber-700">{product.price}</span>
                    {/* PERBAIKAN: Implementasi Routing */}
                    <Link href={`/produk/${product.slug}`} passHref>
                      <button className="bg-gradient-to-r from-amber-800 to-amber-900 text-amber-50 px-4 lg:px-6 py-2 rounded-full font-semibold hover:shadow-lg transition transform hover:scale-105 text-sm lg:text-base">
                        Beli Sekarang
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            {/* PERBAIKAN: Implementasi Routing */}
            <Link href="/produk" passHref>
              <button className="bg-white text-amber-800 px-8 py-4 rounded-full font-bold border-2 border-amber-800 hover:bg-amber-800 hover:text-amber-50 transition text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                Lihat Semua Koleksi →
              </button>
            </Link>
          </div>

          {/* Phygital Info */}
          {/* PERBAIKAN: bg-linear-to-r -> bg-gradient-to-r */}
          <div className="mt-16 bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 rounded-3xl p-8 lg:p-12 text-center text-white">
            <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 justify-center items-center mb-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 hover:bg-white/20 transition transform hover:scale-105 w-full sm:w-auto border border-amber-500/20">
                <div className="text-5xl lg:text-6xl mb-4">🎨</div>
                <p className="font-bold text-lg lg:text-xl mb-2">Batik Fisik</p>
                <p className="text-sm lg:text-base opacity-90">Karya tulis tangan asli</p>
              </div>
              
              <div className="flex items-center justify-center">
                <Zap className="text-amber-300 animate-pulse" size={40} />
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 lg:p-8 hover:bg-white/20 transition transform hover:scale-105 w-full sm:w-auto border border-amber-500/20">
                <div className="text-5xl lg:text-6xl mb-4">🔗</div>
                <p className="font-bold text-lg lg:text-xl mb-2">NFT Digital</p>
                <p className="text-sm lg:text-base opacity-90">Sertifikat blockchain</p>
              </div>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl mb-6 opacity-95 max-w-3xl mx-auto">
              Setiap pembelian batik mendapat <span className="font-bold text-amber-300">NFT gratis</span> sebagai bukti keaslian yang tersimpan selamanya di blockchain
            </p>
          </div>
        </div>
      </section>

      {/* Footer with Batik Pattern */}
      <Footer />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes bg-scroll-slow {
          from { background-position: 0 0; }
          to { background-position: 0 -300px; }
        }

        .animate-bg-scroll-slow {
          animation: bg-scroll-slow 20s linear infinite;
        }

        @keyframes slide-right {
          0% { transform: translateX(0); }
          100% { transform: translateX(50px); }
        }
        
        @keyframes slide-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50px); }
        }
        
        @keyframes slide-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50px); }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-right {
          animation: slide-right 30s linear infinite;
        }
        
        .animate-slide-left {
          animation: slide-left 25s linear infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 20s linear infinite;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default GiriloyoLanding;