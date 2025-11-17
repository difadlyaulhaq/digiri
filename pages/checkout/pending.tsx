// pages/checkout/pending.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Clock, AlertCircle, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const CheckoutPending = () => {
  const router = useRouter();
  const { order_id, transaction_status, transaction_id } = router.query;
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Pending */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={40} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Menunggu Pembayaran ⏳</h1>
            <p className="text-lg opacity-90">Pembayaran Anda sedang diproses</p>
          </div>

          <div className="p-8">
            {/* Order Info */}
            <div className="bg-yellow-50 rounded-2xl p-6 mb-6 border border-yellow-200">
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <AlertCircle size={20} />
                Informasi Pesanan
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-600">Order ID:</span>
                  <span className="font-bold text-stone-800">{order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Status:</span>
                  <span className="font-bold text-yellow-600 capitalize">{transaction_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Transaction ID:</span>
                  <span className="font-mono text-sm text-stone-600">{transaction_id}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-200">
              <h3 className="text-lg font-bold text-stone-800 mb-3">Langkah Selanjutnya</h3>
              <div className="space-y-3 text-sm text-stone-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <p>Selesaikan pembayaran Anda di aplikasi e-wallet atau internet banking</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <p>Tunggu konfirmasi dari sistem (biasanya 1-5 menit)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <p>Anda akan diarahkan otomatis ke halaman sukses setelah pembayaran terverifikasi</p>
                </div>
              </div>
            </div>

            {/* Auto Refresh */}
            <div className="text-center mb-6">
              <p className="text-stone-600">
                Halaman akan diperbarui otomatis dalam{' '}
                <span className="font-bold text-yellow-600">{countdown}</span> detik
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => router.reload()}
                className="flex-1 bg-yellow-600 text-white px-6 py-3 rounded-full font-bold hover:bg-yellow-700 transition"
              >
                Periksa Status
              </button>
              <Link href="/orders" className="flex-1">
                <button className="w-full bg-white text-yellow-600 border-2 border-yellow-600 px-6 py-3 rounded-full font-bold hover:bg-yellow-50 transition">
                  Lihat Pesanan
                </button>
              </Link>
            </div>

            {/* Support Info */}
            <div className="text-center mt-6 pt-6 border-t border-stone-200">
              <p className="text-sm text-stone-500 mb-2">
                Masalah dengan pembayaran?{' '}
                <a href="mailto:support@giriloyo.com" className="text-yellow-600 hover:underline">
                  Hubungi Customer Service
                </a>
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
                <Mail size={16} />
                support@giriloyo.com
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPending;