import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Gamepad2, Brain, Sparkles, Menu, X, ChevronRight, Award, Zap, Search, User, MapPin, Calendar, Users, Mountain, BookOpen, School, Home, Palette, Image as ImageIcon, Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import products from '@/data/products';
import { Analytics } from "@vercel/analytics/next"

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
    slug: product.slug
  }));

  const paketEduwisata = [
    {
      title: "Edu-Wisata Batik",
      sub: "Workshop Mencanting",
      price: "Mulai Rp 25.000",
      unit: "/ peserta",
      features: [
        "Praktek Mencanting Tulis",
        "Kain Hasil Karya Dibawa Pulang",
        "Pewarnaan Sintetis/Alam",
        "Pemandu & Edukator Batik"
      ],
      note: "Harga turun jika peserta > 25 org",
      popular: true // Paling utama
    },
    {
      title: "Paket Kuliner",
      sub: "Catering & Snack",
      price: "Mulai Rp 15.000",
      unit: "/ porsi",
      features: [
        "Snack & Minum Hangat (15k)",
        "Makan Siang Ndeso (30k-40k)",
        "Prasmanan / Box",
        "Es Teh Racik Giriloyo"
      ],
      note: "Menu otentik khas desa",
      popular: false
    },
    {
      title: "Study Banding",
      sub: "Kunjungan Dinas/Sekolah",
      price: "Rp 750.000",
      unit: "/ bus",
      features: [
        "Narasumber Pengurus Paguyuban",
        "Diskusi Manajemen Desa Wisata",
        "Termasuk Retribusi & Parkir",
        "Materi & Dokumentasi"
      ],
      note: "Harga per bus/rombongan",
      popular: false
    }
  ];

  

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Animated Batik Background Pattern */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0 animate-bg-scroll-slow"
          style={{
            backgroundImage: `url('/sidomukti-bledak-biru.jpg')`,
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
            className="group relative bg-gradient-to-r from-blue-800 to-blue-900 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-blue-500/50 transition transform hover:scale-110 flex items-center justify-center"
          >
            <Gamepad2 size={24} />
            <span className="absolute right-16 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Game Batik
            </span>
          </button>
          
          <button 
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative bg-gradient-to-r from-amber-500 to-amber-600 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-amber-500/50 transition transform hover:scale-110 flex items-center justify-center"
          >
            <ShoppingBag size={24} />
            <span className="absolute right-16 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Belanja Batik
            </span>
          </button>
          
          <button 
            onClick={() => document.getElementById('ai')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative bg-gradient-to-r from-amber-500 to-amber-600 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-amber-500/50 transition transform hover:scale-110 flex items-center justify-center animate-pulse"
          >
            <Sparkles size={24} />
            <span className="absolute right-16 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              AI Insight
            </span>
          </button>
          
          <Link href="/bookingwisatapage" passHref>
            <button 
              className="group relative bg-gradient-to-r from-blue-800 to-blue-900 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-blue-500/50 transition transform hover:scale-110 flex items-center justify-center"
            >
              <School size={24} />
              <span className="absolute right-16 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                Booking Paket
              </span>
            </button>
          </Link>
          <Link href="/keranjang" passHref>
          <button 
            className="group relative bg-gradient-to-r from-blue-800 to-blue-900 text-white w-14 h-14 rounded-full shadow-2xl hover:shadow-blue-500/50 transition transform hover:scale-110 flex items-center justify-center"
          >
            <ShoppingBag size={24} />
            <span className="absolute right-16 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Keranjang
            </span>
          </button>
        </Link>
        </div>
      )}

      {/* Navigation */}
      <Navbar />
      {/* analytic */}
      <Analytics />

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
              
              {/* LOGO & BADGE SECTION (REVISI PM) */}
              <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
                <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 text-blue-900 px-4 py-2 rounded-full text-sm font-bold">
                  <Award className="w-5 h-5" />
                  {/* UPDATE: Ganti UNESCO jadi UNWTO */}
                  <span>Best Tourism Village - UNWTO</span>
                </div>
                
                {/* PARTNER LOGOS (REVISI PM + Placeholder Fauzan) */}
                <div className="flex items-center gap-4 opacity-90">
                   {/* Logo 1: UN Tourism */}
                   <div className="h-18 w-auto relative" title="UN Tourism">
                      {/* Pastikan file image_edb4a7.png ada di folder public */}
                      <img src="/logo-untwo,wukir,giri.png" alt="UN Tourism" className="h-full w-auto object-contain mix-blend-multiply" />
                   </div>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                <span className="block text-slate-800 mb-2">Desa Wisata</span>
                <span className="block bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 bg-clip-text text-transparent">Batik Giriloyo</span>
              </h1>
              
              {/* UPDATE: Copywriting baru sesuai revisi */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Jelajahi warisan luhur batik tulis, booking paket eduwisata, belanja batik autentik dengan NFT digital, dan bermain game interaktif
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/bookingwisatapage">
                  <button 
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl transform hover:scale-105 transition text-base lg:text-lg flex items-center justify-center gap-2"
                  >
                    <Calendar size={22} />
                    Booking Paket Wisata
                  </button>
                </Link>
                <button 
                  onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-900 px-8 py-4 rounded-full font-semibold border-2 border-blue-900 hover:bg-blue-50 transition text-base lg:text-lg flex items-center justify-center gap-2"
                >
                  <Gamepad2 size={22} />
                  Coba Game Batik
                </button>
              </div>

              {/* Quick Stats */}
              {/* <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-blue-900">600 +</p>
                  <p className="text-xs lg:text-sm text-slate-600">Perajin</p>
                </div>
                <div className="text-center">
                  {/* <p className="text-2xl lg:text-3xl font-bold text-blue-900">Bermacam-macam</p> 
                  <p className="text-xs lg:text-sm text-slate-600">Motif Batik</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl lg:text-3xl font-bold text-blue-900">2K+</p>
                  <p className="text-xs lg:text-sm text-slate-600">Wisatawan</p>
                </div>
              </div>*/}
            </div> 

            {/* Hero Image */}
            <div className="flex-1 w-full max-w-md lg:max-w-xl relative">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <img 
                  src="/gelombang-cinta2.png" 
                  alt="Batik Model"
                  className="relative w-full h-auto rounded-3xl shadow-2xl"
                />
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <School className="w-6 h-6 text-blue-900" />
                      <div>
                        <p className="text-xs text-slate-500">Eduwisata</p>
                        <p className="text-sm font-bold text-slate-800">3 Paket Tersedia</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <Palette className="w-6 h-6 text-blue-900" />
                      <div>
                        <p className="text-xs text-slate-500">Workshop</p>
                        <p className="text-sm font-bold text-slate-800">Membatik</p>
                      </div>
                    </div>
                  </div>
                   <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-6 h-6 text-blue-900" />
                      <div>
                        <p className="text-xs text-slate-500">Katalog</p>
                        <p className="text-sm font-bold text-slate-800">Batik Tulis</p>
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
      <section id="desa-wisata" className="py-16 lg:py-24 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-800 mb-4">
              Kenapa Harus Giriloyo?
            </h2>
            <p className="text-base lg:text-lg text-slate-600 max-w-3xl mx-auto">
              {/* UPDATE: Ganti istilah UNESCO ke UNWTO/Global */}
              Desa wisata terbaik dunia versi UN Tourism dengan pengalaman batik autentik yang tak terlupakan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition text-center transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              {/* UPDATE: Ganti Title */}
              <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-2">UNWTO Best Tourism Village</h3>
              <p className="text-sm text-slate-600">Diakui dunia sebagai World Best Tourism Village 2024</p>
            </div>

            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition text-center transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              {/* <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-2">600+ Perajin</h3> */}
              <p className="text-sm text-slate-600">Komunitas batik tulis terbesar di Yogyakarta</p>
            </div>

            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition text-center transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-2">Workshop Batik</h3>
              <p className="text-sm text-slate-600">Belajar langsung dari master pengrajin</p>
            </div>

            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition text-center transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-2">Homestay Desa</h3>
              <p className="text-sm text-slate-600">Pengalaman menginap autentik di rumah warga</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition"></div>
              <img 
                src="/modelcanting.png"
                alt="Desa Giriloyo"
                className="relative w-full h-auto rounded-3xl shadow-2xl"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl lg:text-4xl font-bold text-slate-800">
                Lebih Dari Sekedar Wisata
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Giriloyo adalah jantung dari tradisi batik tulis yang telah berusia ratusan tahun. Di sini, Anda tidak hanya berkunjung, tetapi merasakan kehidupan nyata para pengrajin batik.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center  shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Belajar Filosofi Batik</h4>
                    <p className="text-sm text-slate-600">Setiap motif memiliki makna dan cerita yang mendalam</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Mountain className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Eksplorasi Alam</h4>
                    <p className="text-sm text-slate-600">Trackingke Watu Gagak dengan view spektakuler</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Interaksi dengan Warga</h4>
                    <p className="text-sm text-slate-600">Rasakan kehangatan masyarakat desa yang ramah</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Paket Eduwisata Section */}
      {/* Paket Eduwisata Section - Updated per Flyer */}
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
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <School className="inline w-5 h-5 mr-2" />
              Layanan Kami
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-800 mb-4">
              Pilihan Paket Wisata
            </h2>
            <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
              Sesuaikan kebutuhan kunjungan Anda, mulai dari belajar membatik, kuliner desa, hingga studi banding profesional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {paketEduwisata.map((paket, index) => (
              <div 
                key={index}
                className={`relative bg-white rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2 flex flex-col ${
                  paket.popular ? 'border-4 border-amber-500' : 'border border-slate-200'
                }`}
              >
                {paket.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                    🔥 WAJIB DICOBA
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">{paket.title}</h3>
                  <p className="text-sm font-semibold text-amber-600 mb-4">{paket.sub}</p>
                  
                  <div className="flex items-center justify-center text-blue-900 mb-1">
                    <span className="text-3xl font-bold">{paket.price}</span>
                  </div>
                  <p className="text-sm text-slate-500">{paket.unit}</p>
                  
                  <div className="mt-3 inline-block bg-slate-100 px-3 py-1 rounded-lg text-xs font-medium text-slate-600">
                    ℹ️ {paket.note}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {paket.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/bookingwisatapage" passHref>
                  <button className={`w-full py-4 rounded-full font-bold transition transform hover:scale-105 ${
                    paket.popular
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                  }`}>
                    Cek Detail Harga
                  </button>
                </Link>
              </div>
            ))}
          </div>

          {/* CTA Section Bawah */}
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 lg:p-12 text-center border border-blue-200">
            <School className="w-16 h-16 text-blue-700 mx-auto mb-6" />
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-4">
              Butuh Proposal Penawaran Resmi?
            </h3>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
              Untuk sekolah, universitas, atau instansi yang membutuhkan surat penawaran resmi (Quotation), silakan hubungi admin kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.open('https://wa.me/6288233167718?text=Halo%20Admin%20Giriloyo,%20saya%20butuh%20proposal%20penawaran%20untuk%20rombongan...', '_blank')}
                className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold border-2 border-blue-700 hover:bg-blue-50 transition flex items-center justify-center gap-2"
              >
                <span>💬</span>
                Chat WhatsApp
              </button>
              <Link href="/bookingwisatapage" passHref>
                <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105">
                  Hitung Estimasi Biaya
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Games Section */}
      <section id="games" className="py-16 lg:py-24 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-slate-800">
              Pelestarian Batik Secara Imersif
            </h2>
            <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
              Jelajahi dunia batik melalui teknologi interaktif dan AI untuk melestarikan warisan budaya
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Game 1 */}
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-300">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mb-6 transform hover:rotate-12 transition">
                <Gamepad2 className="text-blue-800" size={32} />
              </div>
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold mb-4">
                🎮 PELESTARIAN BUDAYA
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-4 text-slate-800">Mencanting Virtual</h3>
              <p className="text-sm lg:text-base text-slate-600 mb-6 leading-relaxed">
                Rasakan sensasi membatik secara virtual! Ikuti pola tradisional dan pelajari filosofi di balik setiap goresan untuk melestarikan warisan budaya.
              </p>
              <Link href="/mencanting" passHref>
              <button className="text-blue-800 font-semibold flex items-center gap-2 hover:gap-4 transition-all group">
                Main Sekarang 
                <ChevronRight size={20} className="group-hover:animate-bounce" />
              </button>
            </Link>
            </div>

            {/* Game 2 */}
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 hover:shadow-2xl transition transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-300">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mb-6 transform hover:rotate-12 transition">
                <Brain className="text-blue-800" size={32} />
              </div>
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold mb-4">
                🧠 EDUKASI INTERAKTIF
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-4 text-slate-800">Kuis Cerdas Batik</h3>
              <p className="text-sm lg:text-base text-slate-600 mb-6 leading-relaxed">
                Uji pengetahuan Anda tentang batik! Kompetisi real-time dengan sistem leaderboard yang dinamis.
              </p>
            <Link href="/kuis" passHref>
                <button className="text-blue-800 font-semibold flex items-center gap-2 hover:gap-4 transition-all group">
                Ikut Kuis 
                <ChevronRight size={20} className="group-hover:animate-bounce" />
              </button>
            </Link>
            </div>

<Link href="/ai" passHref className="sm:col-span-2 lg:col-span-1 ">
              <div className="relative overflow-hidden rounded-3xl shadow-xl group cursor-pointer h-full">
                {/* Background Gradient Amber/Gold */}
                <div className="absolute inset-0 bg-linear-to-br from-amber-500 to-orange-600 transition-transform duration-500 group-hover:scale-105"></div>
                
                {/* Pattern Overlay biar ada tekstur batik dikit */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/batik.png')] mix-blend-overlay" />

                {/* Content */}
                  <div className="relative p-6 lg:p-8 h-60 flex-row justify-between text-white z-10">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30 flex items-center gap-2">
                          <Sparkles size={14} className="text-yellow-200" />
                          AI ASSISTANT
                        </div>
                        <ChevronRight className="text-white/80 group-hover:translate-x-2 transition" />
                      </div>
                      
                      <h3 className="text-2xl lg:text-3xl font-bold mb-2 leading-tight">
                        Bingung Memilih Motif?
                      </h3>
                      <p className="text-white/90 text-sm lg:text-base leading-relaxed opacity-90 group-hover:opacity-100 transition">
                        Tanya AI kami untuk rekomendasi batik yang pas buat acaramu!
                      </p>
                    </div>

                    {/* Fake Button Visual di Bawah */}
                    <div className="mt-6 bg-white text-amber-600 py-3 px-4 rounded-xl font-bold text-center shadow-lg group-hover:bg-amber-50 transition flex items-center justify-center gap-2">
                      <Sparkles size={18} />
                      Coba Konsultasi AI
                    </div>
                </div>
              </div>
            </Link>
            </div>
        </div>
      </section>

      {/* Bermacam-macam Patterns Section */}
      <section className="py-16 lg:py-24 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-800 mb-4">
              Bermacam-macam Motif Batik Tulis
            </h2> 
            <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
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
            <Link href="/produk" passHref>
              <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-10 py-4 rounded-full font-bold hover:shadow-xl transition transform hover:scale-105 text-base lg:text-lg">
                Lihat Semua Motif
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Phygital Banner with Batik Pattern */}
  <section id="ai" className="py-16 lg:py-24 px-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative overflow-hidden">
  {/* Animated Batik Pattern */}
  <div 
    className="absolute inset-0 opacity-10 animate-slide-up"
    style={{
      backgroundImage: `url('https://cdn.pixabay.com/photo/2020/11/29/10/41/batik-5787939_1280.jpg')`,
      backgroundSize: '200px 200px',
      backgroundRepeat: 'repeat',
    }}
  />
  
<section className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
          <div className="max-w-5xl mx-auto text-center text-white relative z-10">
            <div className="inline-block bg-blue-700/30 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold mb-6 border border-blue-500/30">
              ✨ AI-Powered Recommendations
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              AI Batik Insight
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl mb-10 opacity-95 max-w-3xl mx-auto leading-relaxed">
              Bingung memilih motif batik? Tanyakan kepada <span className="font-bold text-amber-300">AI kami</span> untuk mendapatkan rekomendasi berdasarkan kepribadian, acara, dan preferensi Anda
            </p>
            
            {/* Quick Action Cards as CTAs */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <button 
                onClick={() => window.location.href = '/ai?context=formal'}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-amber-400/50 transition-all hover:scale-105 text-center"
              >
                <div className="text-4xl mb-3">🎭</div>
                <p className="font-semibold mb-2 text-lg">Acara Formal</p>
                <p className="text-white/70 text-sm mb-3">Rekomendasi motif klasik elegan</p>
                <div className="text-amber-400 text-sm font-semibold flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Tanya AI <ArrowRight className="w-4 h-4" />
                </div>
              </button>
              
              <button 
                onClick={() => window.location.href = '/ai?context=work'}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-amber-400/50 transition-all hover:scale-105 text-center"
              >
                <div className="text-4xl mb-3">👔</div>
                <p className="font-semibold mb-2 text-lg">Untuk Bekerja</p>
                <p className="text-white/70 text-sm mb-3">Motif modern profesional</p>
                <div className="text-amber-400 text-sm font-semibold flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Tanya AI <ArrowRight className="w-4 h-4" />
                </div>
              </button>
              
              <button 
                onClick={() => window.location.href = '/ai?context=casual'}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-amber-400/50 transition-all hover:scale-105 text-center"
              >
                <div className="text-4xl mb-3">🎉</div>
                <p className="font-semibold mb-2 text-lg">Untuk Casual</p>
                <p className="text-white/70 text-sm mb-3">Motif trendy dan fresh</p>
                <div className="text-amber-400 text-sm font-semibold flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Tanya AI <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Main CTA */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-amber-400/30">
              <p className="text-white/90 mb-4">Atau ceritakan kebutuhan spesifik Anda</p>
              <button 
                onClick={() => window.location.href = '/ai'}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-10 py-4 rounded-full font-bold text-base hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Konsultasi Custom dengan AI
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
</section>

      {/* Featured Products Grid */}
      <section id="products" className="py-16 lg:py-24 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-slate-800">
              Belanja Batik + NFT Digital
            </h2>
            <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
              Setiap pembelian batik dilengkapi dengan <span className="text-amber-600 font-semibold">NFT</span> sebagai sertifikat keaslian digital
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 group border border-slate-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden bg-slate-100">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs lg:text-sm font-bold shadow-lg flex items-center gap-1">
                    <Award size={14} />
                    NFT
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Motif {product.motif}
                  </div>
                </div>
                <div className="p-5 lg:p-6">
                  <h3 className="text-lg lg:text-xl font-bold mb-2 text-slate-800">{product.name}</h3>
                  <p className="text-slate-600 text-xs lg:text-sm mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Dibuat oleh {product.artisan}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl lg:text-2xl font-bold text-blue-900">{product.price}</span>
                    <Link href={`/produk/${product.slug}`} passHref>
                      <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 lg:px-6 py-2 rounded-full font-semibold hover:shadow-lg transition transform hover:scale-105 text-sm lg:text-base">
                        Beli Sekarang
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/produk" passHref>
              <button className="bg-white text-blue-900 px-8 py-4 rounded-full font-bold border-2 border-blue-900 hover:bg-blue-900 hover:text-white transition text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                Lihat Semua Koleksi →
              </button>
            </Link>
          </div>

          {/* Phygital Info */}
          <div className="mt-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 lg:p-12 text-center text-white">
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