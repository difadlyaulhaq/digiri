import React, { useState } from 'react';
import { Calendar, Users, School, Mail, Phone, MapPin, Clock, Check, ChevronRight, Award, Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

// PERBAIKAN: Definisikan tipe data untuk paket
const packages = {
  'half-day': {
    title: "Paket Half Day",
    duration: "4-5 Jam",
    price: 150000,
    minParticipants: 20,
    features: [
      "Workshop Membatik 2 jam",
      "Tour Sentra Batik",
      "Welcome Drink",
      "Sertifikat & Hasil Karya"
    ],
    popular: false  // Tambahkan ini
  },
  'full-day': {
    title: "Paket Full Day",
    duration: "8-9 Jam",
    price: 275000,
    minParticipants: 20,
    features: [
      "Workshop Membatik 4 jam",
      "Makan Siang Tradisional",
      "Trekking Desa & Watu Gagak",
      "Homestay Experience",
      "Sertifikat & Hasil Karya"
    ],
    popular: true
  },
  'study-tour': {
    title: "Paket Study Tour",
    duration: "2 Hari 1 Malam",
    price: 450000,
    minParticipants: 20,
    features: [
      "Workshop Batik Intensif",
      "Menginap di Homestay",
      "3x Makan (Lunch, Dinner, Breakfast)",
      "Cultural Night",
      "Dokumentasi Profesional",
      "Sertifikat & Souvenir"
    ],
    popular: false  // Tambahkan ini
  }
};

// PERBAIKAN: Buat tipe data baru dari kunci (keys) objek packages
// Ini akan menghasilkan tipe: 'half-day' | 'full-day' | 'study-tour'
type PackageKey = keyof typeof packages;


const BookingWisataPage = () => {
  // PERBAIKAN: Beri tahu useState bahwa tipenya adalah PackageKey, bukan string biasa
  const [selectedPackage, setSelectedPackage] = useState<PackageKey>('full-day');
  
  const [bookingData, setBookingData] = useState({
    packageType: 'full-day' as PackageKey, // Beri tahu tipe di sini juga
    visitDate: '',
    participants: 20,
    groupName: '',
    contactName: '',
    email: '',
    phone: '',
    institution: '',
    notes: ''
  });

  // PERBAIKAN: Tambahkan tipe 'number' pada parameter
  const formatPrice = (price : number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateTotal = () => {
    // PERBAIKAN: Semua error 7053 di sini hilang
    // karena TypeScript sekarang tahu 'selectedPackage' adalah PackageKey
    const pkg = packages[selectedPackage];
    return pkg.price * bookingData.participants;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  // PERBAIKAN: Tambahkan tipe PackageKey pada parameter
  const handlePackageChange = (packageType: PackageKey) => {
    setSelectedPackage(packageType);
    setBookingData({
      ...bookingData,
      packageType: packageType
    });
  };

  const handleSubmit = () => {
    if (!bookingData.visitDate || !bookingData.contactName || !bookingData.email || !bookingData.phone) {
      alert('Mohon lengkapi semua data yang diperlukan');
      return;
    }

    // PERBAIKAN: Error 7053 hilang
    if (bookingData.participants < packages[selectedPackage].minParticipants) {
      alert(`Minimal peserta untuk paket ini adalah ${packages[selectedPackage].minParticipants} orang`);
      return;
    }

    // Simulate WhatsApp redirect
    // PERBAIKAN: Error 7053 hilang
    const message = `Halo! Saya ingin booking:\n\nPaket: ${packages[selectedPackage].title}\nTanggal: ${bookingData.visitDate}\nJumlah: ${bookingData.participants} peserta\nNama Kontak: ${bookingData.contactName}\nEmail: ${bookingData.email}\nHP: ${bookingData.phone}\n\nTotal: ${formatPrice(calculateTotal())}`;
    
    const whatsappUrl = `https://wa.me/628816413617?text=${encodeURIComponent(message)}`;
    alert(`Redirecting to WhatsApp...\n\nIn production, will open:\n${whatsappUrl}`);
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-4">
              <School className="inline w-5 h-5 mr-2" />
              Booking Paket Eduwisata
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              Wujudkan Wisata Edukasi Terbaik
            </h1>
            <p className="text-lg lg:text-xl opacity-90 max-w-2xl mx-auto">
              Pengalaman belajar batik yang tak terlupakan untuk pelajar, mahasiswa, dan umum
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Selection */}
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-stone-800 mb-6">1. Pilih Paket Wisata</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* PERBAIKAN: Beri tahu TypeScript bahwa 'key' adalah PackageKey */}
                {(Object.keys(packages) as PackageKey[]).map((key) => {
                  const pkg = packages[key];
                  return (
                    <button
                      key={key}
                      onClick={() => handlePackageChange(key)}
                      className={`relative p-6 rounded-2xl border-2 transition text-left ${
                        selectedPackage === key
                          ? 'border-green-600 bg-green-50'
                          : 'border-stone-200 hover:border-green-400'
                      }`}
                    >
                      {pkg?.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-linear-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          🔥 POPULER
                        </div>
                      )}
                      <h3 className="font-bold text-stone-800 mb-2">{pkg.title}</h3>
                      <p className="text-sm text-stone-600 mb-3">{pkg.duration}</p>
                      <p className="text-2xl font-bold text-green-700 mb-3">{formatPrice(pkg.price)}</p>
                      <p className="text-xs text-stone-500">per peserta</p>
                      {selectedPackage === key && (
                        <div className="absolute top-4 right-4 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-900 text-sm mb-3">Termasuk dalam paket:</h4>
                <div className="grid md:grid-cols-2 gap-2">
                  {/* PERBAIKAN: Tambahkan tipe 'string' dan 'number' pada parameter map */}
                  {packages[selectedPackage].features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check size={16} className="text-green-600  shrink-0 mt-0.5" />
                      <span className="text-sm text-green-800">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-stone-800 mb-6">2. Detail Kunjungan</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Tanggal Kunjungan *
                    </label>
                    <input
                      type="date"
                      name="visitDate"
                      value={bookingData.visitDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-green-600 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      <Users className="inline w-4 h-4 mr-2" />
                      Jumlah Peserta *
                    </label>
                    <input
                      type="number"
                      name="participants"
                      value={bookingData.participants}
                      onChange={handleInputChange}
                      // PERBAIKAN: Error 7053 hilang
                      min={packages[selectedPackage].minParticipants}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-green-600 focus:outline-none transition"
                    />
                    <p className="text-xs text-stone-500 mt-1">
                      {/* PERBAIKAN: Error 7053 hilang */}
                      Minimal {packages[selectedPackage].minParticipants} peserta
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    <School className="inline w-4 h-4 mr-2" />
                    Nama Grup/Rombongan
                  </label>
                  <input
                    type="text"
                    name="groupName"
                    value={bookingData.groupName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-green-600 focus:outline-none transition"
                    placeholder="Contoh: SMK Negeri 1 Yogyakarta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Institusi/Sekolah/Perusahaan
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={bookingData.institution}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-green-600 focus:outline-none transition"
                    placeholder="Nama institusi"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-stone-800 mb-6">3. Informasi Kontak</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Nama Penanggung Jawab *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={bookingData.contactName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-green-600 focus:outline-none transition"
                    placeholder="Nama lengkap"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      <Mail className="inline w-4 h-4 mr-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={bookingData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-green-600 focus:outline-none transition"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      <Phone className="inline w-4 h-4 mr-2" />
                      No. WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-green-600 focus:outline-none transition"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Catatan Khusus (Opsional)
                  </label>
                  <textarea
                    name="notes"
                    value={bookingData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-green-600 focus:outline-none transition resize-none"
                    placeholder="Permintaan khusus atau informasi tambahan..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 sticky top-8">
              <h2 className="text-xl font-bold text-stone-800 mb-6">Ringkasan Booking</h2>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm text-stone-600 mb-1">Paket Dipilih</p>
                  {/* PERBAIKAN: Error 7053 hilang */}
                  <p className="font-bold text-stone-800">{packages[selectedPackage].title}</p>
                  <p className="text-xs text-stone-600">{packages[selectedPackage].duration}</p>
                </div>

                {bookingData.visitDate && (
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <Calendar className="text-green-600" size={20} />
                    <div>
                      <p className="text-xs text-stone-600">Tanggal</p>
                      <p className="font-semibold text-stone-800 text-sm">
                        {new Date(bookingData.visitDate).toLocaleDateString('id-ID', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <Users className="text-green-600" size={20} />
                  <div>
                    <p className="text-xs text-stone-600">Peserta</p>
                    <p className="font-semibold text-stone-800 text-sm">{bookingData.participants} orang</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Harga per orang</span>
                  <span className="font-semibold text-stone-800">
                    {/* PERBAIKAN: Error 7053 hilang */}
                    {formatPrice(packages[selectedPackage].price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Jumlah peserta</span>
                  <span className="font-semibold text-stone-800">× {bookingData.participants}</span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between">
                  <span className="font-bold text-stone-800">Total Estimasi</span>
                  <span className="font-bold text-green-700 text-xl">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2 text-xs text-stone-600">
                  <Check size={14} className="text-green-600  shrink-0 mt-0.5" />
                  <span>Free konsultasi & planning</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-stone-600">
                  <Check size={14} className="text-green-600  shrink-0 mt-0.5" />
                  <span>Pembayaran bisa dicicil untuk rombongan besar</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-stone-600">
                  <Check size={14} className="text-green-600  shrink-0 mt-0.5" />
                  <span>Dapat sertifikat resmi</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-linear-to-r from-green-600 to-emerald-700 text-white px-6 py-4 rounded-full font-bold hover:shadow-xl transition text-lg flex items-center justify-center gap-2"
              >
                <span className="text-2xl">💬</span>
                Kirim via WhatsApp
              </button>

              <p className="text-xs text-center text-stone-500 mt-4">
                Tim kami akan segera merespons dalam 1-2 jam kerja
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-linear-to-br from-amber-100 to-orange-100 rounded-3xl p-8 lg:p-12 text-center">
          <Award className="w-16 h-16 text-amber-700 mx-auto mb-4" />
          <h3 className="text-2xl lg:text-3xl font-bold text-stone-800 mb-4">
            Harga Spesial untuk Institusi Pendidikan
          </h3>
          <p className="text-stone-700 mb-6 max-w-2xl mx-auto">
            Dapatkan diskon hingga 20% untuk rombongan lebih dari 50 peserta. Hubungi kami untuk penawaran khusus!
          </p>
          <button className="bg-white text-amber-700 px-8 py-3 rounded-full font-bold border-2 border-amber-700 hover:bg-amber-50 transition">
            Download Proposal PDF
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingWisataPage;