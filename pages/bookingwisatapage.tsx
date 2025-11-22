import React, { useState, useEffect } from 'react';
import { Calendar, Users, School, Mail, Phone, Check, Award, Sparkles, Coffee, Bus, Utensils } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const BookingWisataPage = () => {
  // State untuk Form
  const [visitDate, setVisitDate] = useState('');
  const [participants, setParticipants] = useState(20); // Default 20
  
  // State Konfigurasi Paket
  const [workshopType, setWorkshopType] = useState<'standard' | 'taplak' | 'none'>('standard');
  const [cateringType, setCateringType] = useState<'none' | 'snack' | 'lengkap'>('none');
  const [studyBanding, setStudyBanding] = useState(false);
  const [busCount, setBusCount] = useState(1);

  // State Data Kontak
  const [contactData, setContactData] = useState({
    name: '',
    institution: '',
    email: '',
    phone: '',
    notes: ''
  });

  // --- LOGIKA HARGA SESUAI FLYER ---

  // 1. Edu-Wisata Batik (Tiered Pricing)
  const getWorkshopPricePerPax = (count: number, type: 'standard' | 'taplak' | 'none') => {
    if (type === 'none') return 0;
    if (type === 'taplak') return 250000; // Asumsi flat 250k untuk Taplak Meja

    // Logic Standard sesuai Flyer
    if (count <= 5) return 250000 / count; // Paket 5 orang = 250k total (jadi per orang dibagi count)
    if (count <= 10) return 50000;
    if (count <= 25) return 40000;
    if (count <= 40) return 35000;
    if (count <= 249) return 30000;
    return 25000; // > 250 orang
  };

  // 2. Catering (Tiered Pricing)
  const getCateringPricePerPax = (count: number, type: 'none' | 'snack' | 'lengkap') => {
    if (type === 'none') return 0;
    if (type === 'snack') return 15000; // Snack & Minum Hangat + Es Teh

    // Logic Makan Siang Lengkap
    if (count < 49) return 40000;
    if (count < 100) return 35000; // 50-99
    return 30000; // > 100
  };

  // 3. Study Banding
  const getStudyBandingTotal = (buses: number) => {
    return buses * 750000; // 750k per bus
  };

  // --- KALKULASI TOTAL ---
  const workshopPricePerPax = getWorkshopPricePerPax(participants, workshopType);
  const cateringPricePerPax = getCateringPricePerPax(participants, cateringType);
  
  const workshopTotal = workshopType === 'standard' && participants <= 5 
    ? 250000 // Flat rate untuk <= 5 orang
    : workshopPricePerPax * participants;

  const cateringTotal = cateringPricePerPax * participants;
  const studyBandingTotal = studyBanding ? getStudyBandingTotal(busCount) : 0;
  
  const grandTotal = workshopTotal + cateringTotal + studyBandingTotal;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!contactData.name || !contactData.phone || !visitDate) {
      alert('Mohon lengkapi Nama, No HP, dan Tanggal Kunjungan.');
      return;
    }

    let message = `*Halo Admin Giriloyo (Mas Bahtiar), Saya ingin booking paket wisata:*\n\n`;
    message += `📅 Tanggal: ${visitDate}\n`;
    message += `👤 Nama: ${contactData.name} (${contactData.institution})\n`;
    message += `👥 Jumlah Peserta: ${participants} orang\n\n`;
    
    message += `*Rincian Pesanan:*\n`;
    if (workshopType !== 'none') {
      message += `✅ Workshop Batik: ${workshopType === 'taplak' ? 'Paket Taplak Meja' : 'Standard'} `;
      message += `(${participants <= 5 && workshopType === 'standard' ? 'Paket Kecil' : formatCurrency(workshopPricePerPax) + '/pax'})\n`;
    }
    
    if (cateringType !== 'none') {
      message += `✅ Catering: ${cateringType === 'snack' ? 'Snack & Minum' : 'Makan Siang Lengkap'} `;
      message += `(${formatCurrency(cateringPricePerPax)}/pax)\n`;
    }

    if (studyBanding) {
      message += `✅ Study Banding: ${busCount} Bus (${formatCurrency(studyBandingTotal)})\n`;
    }

    message += `\n💰 *Estimasi Total: ${formatCurrency(grandTotal)}*`;
    if (contactData.notes) message += `\n\nCatatan: ${contactData.notes}`;
    message += `\n\nMohon konfirmasi ketersediaan. Terima kasih.`;

    // Nomor Mas Bahtiar sesuai Flyer
    const whatsappUrl = `https://wa.me/6281237704747?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* Header Hero */}
      <div className="bg-slate-900 text-white relative py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://cdn.pixabay.com/photo/2020/11/29/10/41/batik-5787937_1280.jpg')] bg-center bg-cover" />
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            Paket Wisata Batik Tulis Giriloyo
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Sesuaikan kebutuhan wisata Anda. Semakin banyak peserta, semakin hemat biaya per orang.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Calculator Form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Informasi Dasar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="text-amber-600" /> 1. Rencana Kunjungan
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Kunjungan</label>
                <input 
                  type="date" 
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah Peserta</label>
                <input 
                  type="number" 
                  min="1"
                  value={participants}
                  onChange={(e) => setParticipants(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-slate-800"
                />
                <p className="text-xs text-slate-500 mt-1">Harga otomatis menyesuaikan jumlah peserta</p>
              </div>
            </div>
          </div>

          {/* 2. Pilih Paket Edu-Wisata */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="text-amber-600" /> 2. Paket Edu-Wisata
              </h2>
              {workshopType === 'standard' && (
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                  {participants <= 5 ? 'Paket Small Group' : `Tier: ${formatCurrency(workshopPricePerPax)}/org`}
                </span>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <button 
                onClick={() => setWorkshopType('standard')}
                className={`p-4 border-2 rounded-xl text-left transition ${workshopType === 'standard' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-slate-200 hover:border-amber-300'}`}
              >
                <div className="font-bold text-slate-800">Standard</div>
                <div className="text-xs text-slate-500 mt-1">Belajar membatik (saputangan)</div>
                <div className="mt-2 font-semibold text-amber-600 text-sm">
                  Mulai 25rb - 50rb
                </div>
              </button>

              <button 
                onClick={() => setWorkshopType('taplak')}
                className={`p-4 border-2 rounded-xl text-left transition ${workshopType === 'taplak' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-slate-200 hover:border-amber-300'}`}
              >
                <div className="font-bold text-slate-800">Taplak Meja</div>
                <div className="text-xs text-slate-500 mt-1">Karya lebih besar & rumit</div>
                <div className="mt-2 font-semibold text-amber-600 text-sm">
                  Rp 250.000 /org
                </div>
              </button>

              <button 
                onClick={() => setWorkshopType('none')}
                className={`p-4 border-2 rounded-xl text-left transition ${workshopType === 'none' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-slate-200 hover:border-red-300'}`}
              >
                <div className="font-bold text-slate-800">Tanpa Workshop</div>
                <div className="text-xs text-slate-500 mt-1">Hanya berkunjung/belanja</div>
                <div className="mt-2 font-semibold text-slate-400 text-sm">
                  -
                </div>
              </button>
            </div>

            {/* Price Table Reference (Visual Guide) */}
            {workshopType === 'standard' && (
              <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Daftar Harga Paket Standard:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
                  <div className={participants <= 5 ? "font-bold text-blue-600" : ""}>• 1-5 Org: Rp 250.000 (Paket)</div>
                  <div className={participants >= 6 && participants <= 10 ? "font-bold text-blue-600" : ""}>• 6-10 Org: Rp 50.000/org</div>
                  <div className={participants >= 11 && participants <= 25 ? "font-bold text-blue-600" : ""}>• 11-25 Org: Rp 40.000/org</div>
                  <div className={participants >= 26 && participants <= 40 ? "font-bold text-blue-600" : ""}>• 26-40 Org: Rp 35.000/org</div>
                  <div className={participants >= 41 && participants <= 249 ? "font-bold text-blue-600" : ""}>• 41-249 Org: Rp 30.000/org</div>
                  <div className={participants >= 250 ? "font-bold text-blue-600" : ""}>• &gt;250 Org: Rp 25.000/org</div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Catering & Study Banding */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Catering */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Utensils className="text-amber-600" /> 3. Catering
              </h2>
              <select 
                value={cateringType}
                onChange={(e) => setCateringType(e.target.value as any)}
                className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="none">Tidak Termasuk Makan</option>
                <option value="snack">Snack + Minum (15k/org)</option>
                <option value="lengkap">Makan Siang Lengkap (30k-40k)</option>
              </select>
              
              {cateringType === 'lengkap' && (
                 <div className="mt-3 text-xs text-slate-500 bg-blue-50 p-2 rounded">
                    Harga menyesuaikan jumlah:
                    <br/>• &lt;49 orang: 40k
                    <br/>• 50-99 orang: 35k
                    <br/>• &gt;100 orang: 30k
                 </div>
              )}
            </div>

            {/* Study Banding */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Bus className="text-amber-600" /> 4. Study Banding
                </h2>
                <input 
                  type="checkbox"
                  checked={studyBanding}
                  onChange={(e) => setStudyBanding(e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                />
              </div>
              
              {studyBanding ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Jumlah Bus</label>
                  <input 
                    type="number"
                    min="1"
                    value={busCount}
                    onChange={(e) => setBusCount(Math.max(1, parseInt(e.target.value)))}
                    className="w-full p-2 border rounded text-slate-800"
                  />
                  <p className="text-xs text-amber-600 mt-2 font-semibold">
                    Rp 750.000 / Bus (Termasuk retribusi & narasumber)
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Centang jika kunjungan Study Banding resmi (sekolah/dinas) dengan Bus.
                </p>
              )}
            </div>
          </div>

          {/* 5. Data Kontak */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Phone className="text-amber-600" /> 5. Data Pemesan
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                type="text" name="name" placeholder="Nama Lengkap"
                value={contactData.name} onChange={handleContactChange}
                className="p-3 border rounded-lg text-slate-800 bg-white"
              />
              <input 
                type="text" name="institution" placeholder="Asal Sekolah / Instansi"
                value={contactData.institution} onChange={handleContactChange}
                className="p-3 border rounded-lg text-slate-800 bg-white"
              />
              <input 
                type="tel" name="phone" placeholder="Nomor WhatsApp (Wajib)"
                value={contactData.phone} onChange={handleContactChange}
                className="p-3 border rounded-lg text-slate-800 bg-white"
              />
              <input 
                type="email" name="email" placeholder="Email (Opsional)"
                value={contactData.email} onChange={handleContactChange}
                className="p-3 border rounded-lg text-slate-800 bg-white"
              />
            </div>
            <textarea 
              name="notes" rows={3} placeholder="Catatan Tambahan..."
              value={contactData.notes} onChange={handleContactChange}
              className="w-full mt-4 p-3 border rounded-lg text-slate-800 bg-white"
            />
          </div>

        </div>

        {/* RIGHT COLUMN: Summary & Sticky Button */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Award className="text-amber-400" /> Estimasi Biaya
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Summary Items */}
              <div className="space-y-2 text-sm border-b border-slate-100 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Peserta</span>
                  <span className="font-semibold text-slate-800">{participants} Orang</span>
                </div>
                
                {/* Workshop Detail */}
                <div className="flex justify-between">
                  <span className="text-slate-500">Workshop ({workshopType})</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(workshopTotal)}
                  </span>
                </div>
                {workshopType === 'standard' && participants > 5 && (
                  <div className="text-right text-xs text-green-600 italic">
                    (@ {formatCurrency(workshopPricePerPax)})
                  </div>
                )}

                {/* Catering Detail */}
                {cateringType !== 'none' && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Catering ({cateringType})</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(cateringTotal)}
                    </span>
                  </div>
                )}

                {/* Study Banding Detail */}
                {studyBanding && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Study Banding ({busCount} Bus)</span>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(studyBandingTotal)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-2">
                <div className="flex justify-between items-end">
                  <span className="text-slate-600 font-bold">Total Estimasi</span>
                  <span className="text-2xl font-bold text-amber-600">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 text-right">
                  *Harga belum termasuk parkir & tips
                </p>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-green-500/30 transition flex items-center justify-center gap-2"
              >
                <Phone size={20} />
                Booking via WhatsApp
              </button>

              <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 text-center">
                <p className="font-bold text-slate-700">Contact Person:</p>
                <p>Mas Bahtiar (08123-770-4747)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingWisataPage;