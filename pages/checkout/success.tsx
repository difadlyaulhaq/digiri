// pages/checkout/success.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CheckCircle, Download, Mail, Sparkles, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

const CheckoutSuccess = () => {
  const router = useRouter();
  const { order_id, transaction_status, transaction_id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order_id) {
      // Simulate fetching order data
      setTimeout(() => {
        setOrder({
          orderId: order_id,
          transactionId: transaction_id,
          status: transaction_status,
          total: 1850000, // Example amount
          items: [
            { name: "Batik Kawung Klasik Premium", quantity: 1, price: 850000 },
            { name: "Batik Parang Rusak Tulis", quantity: 1, price: 1200000 }
          ],
          nftTransactionHash: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEB5"
        });
        setLoading(false);
      }, 1000);
    }
  }, [order_id, transaction_id, transaction_status]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-lg text-stone-600">Memuat informasi pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Success */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Pembayaran Berhasil! 🎉</h1>
            <p className="text-lg opacity-90">Terima kasih telah berbelanja di Desa Wisata Batik Giriloyo</p>
          </div>

          <div className="p-8">
            {/* Order Summary */}
            <div className="bg-amber-50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                <ShoppingBag size={20} />
                Detail Pesanan
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-600">Order ID:</span>
                  <span className="font-bold text-stone-800">{order?.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Status:</span>
                  <span className="font-bold text-green-600 capitalize">{transaction_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Transaction ID:</span>
                  <span className="font-mono text-sm text-stone-600">{transaction_id}</span>
                </div>
                <div className="border-t border-stone-300 pt-3 mt-3">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-stone-800">Total Pembayaran:</span>
                    <span className="font-bold text-green-600">{formatPrice(order?.total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NFT Certificate */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-purple-600" size={24} />
                <h3 className="text-xl font-bold text-stone-800">NFT Certificate Minted!</h3>
              </div>
              <p className="text-stone-600 mb-4">
                Sertifikat digital NFT Anda telah berhasil dibuat dan akan dikirim ke email dalam 5-10 menit.
              </p>
              <div className="bg-white rounded-xl p-4 mb-4">
                <p className="text-sm text-stone-600 mb-1">Transaction Hash:</p>
                <p className="font-mono text-xs text-purple-600 break-all">
                  {order?.nftTransactionHash}
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                  <Download size={16} />
                  Download NFT
                </button>
                <button className="flex items-center gap-2 border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition">
                  <Mail size={16} />
                  Kirim ke Email
                </button>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-200">
              <h3 className="text-lg font-bold text-stone-800 mb-3">Apa Selanjutnya?</h3>
              <div className="space-y-2 text-sm text-stone-600">
                <p>✅ Batik akan diproses oleh pengrajin dalam <strong>7-14 hari kerja</strong></p>
                <p>✅ Anda akan menerima email konfirmasi dengan detail pesanan</p>
                <p>✅ NFT certificate akan dikirim ke email Anda</p>
                <p>✅ Status pengiriman dapat dilacak di halaman pesanan</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/orders" className="flex-1">
                <button className="w-full bg-gradient-to-r from-amber-800 to-amber-900 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition">
                  Lihat Pesanan Saya
                </button>
              </Link>
              <Link href="/produk" className="flex-1">
                <button className="w-full bg-white text-amber-800 border-2 border-amber-800 px-6 py-3 rounded-full font-bold hover:bg-amber-50 transition">
                  Lanjut Belanja
                </button>
              </Link>
            </div>

            {/* Support Info */}
            <div className="text-center mt-6 pt-6 border-t border-stone-200">
              <p className="text-sm text-stone-500">
                Butuh bantuan?{' '}
                <a href="mailto:support@giriloyo.com" className="text-amber-600 hover:underline">
                  Hubungi Customer Service
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;