// pages/verify-certificate.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Copy, 
  ExternalLink, 
  Shield,
  Award,
  Clock,
  User,
  Package,
  MapPin
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getOrderById, getOrdersByGuestId, Order } from '@/utils/orderUtils';
import { Analytics } from "@vercel/analytics/next"

const VerifyCertificate = () => {
  const router = useRouter();
  const { nftId, transactionHash } = router.query;

  const [searchInput, setSearchInput] = useState('');
  const [certificateData, setCertificateData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'nftId' | 'transactionHash'>('nftId');

  // Auto-search jika ada parameter URL
  useEffect(() => {
    if (nftId) {
      setSearchInput(nftId as string);
      setSearchType('nftId');
      handleSearch(nftId as string, 'nftId');
    } else if (transactionHash) {
      setSearchInput(transactionHash as string);
      setSearchType('transactionHash');
      handleSearch(transactionHash as string, 'transactionHash');
    }
  }, [nftId, transactionHash]);

  const handleSearch = async (value: string = searchInput, type: 'nftId' | 'transactionHash' = searchType) => {
    if (!value.trim()) {
      setError('Masukkan NFT ID atau Transaction Hash');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificateData(null);

    try {
      console.log(`🔍 Mencari sertifikat dengan ${type}:`, value);

      // Untuk demo, kita akan cari di semua order user terlebih dahulu
      // Di production, ini akan query database langsung berdasarkan NFT ID atau transaction hash
      const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') : null;
      
      let foundOrder: Order | null = null;

      if (guestId) {
        const userOrders = await getOrdersByGuestId(guestId);
        
        // Cari order yang memiliki NFT ID atau transaction hash yang sesuai
        foundOrder = userOrders.find(order => {
          if (type === 'nftId' && order.nftIds) {
            return order.nftIds.some(id => id.toLowerCase().includes(value.toLowerCase()));
          } else if (type === 'transactionHash' && order.nftTransactionHash) {
            return order.nftTransactionHash.toLowerCase().includes(value.toLowerCase());
          }
          return false;
        }) || null;
      }

      // Fallback: Coba cari di localStorage (untuk development)
      if (!foundOrder && typeof window !== 'undefined') {
        const ordersJson = localStorage.getItem('orders');
        if (ordersJson) {
          const allOrders: Order[] = JSON.parse(ordersJson);
          foundOrder = allOrders.find(order => {
            if (type === 'nftId' && order.nftIds) {
              return order.nftIds.some(id => id.toLowerCase().includes(value.toLowerCase()));
            } else if (type === 'transactionHash' && order.nftTransactionHash) {
              return order.nftTransactionHash.toLowerCase().includes(value.toLowerCase());
            }
            return false;
          }) || null;
        }
      }

      if (foundOrder) {
        console.log('✅ Sertifikat ditemukan:', foundOrder.orderId);
        setCertificateData(foundOrder);
        
        // Update URL tanpa reload page
        const newQuery: any = {};
        if (type === 'nftId') newQuery.nftId = value;
        if (type === 'transactionHash') newQuery.transactionHash = value;
        
        router.push({
          pathname: '/verify-certificate',
          query: newQuery
        }, undefined, { shallow: true });
      } else {
        setError('Sertifikat tidak ditemukan. Pastikan NFT ID atau Transaction Hash benar.');
      }
    } catch (err) {
      console.error('Error searching certificate:', err);
      setError('Terjadi kesalahan saat memverifikasi sertifikat');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Teks berhasil disalin!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getVerificationStatus = () => {
    if (!certificateData) return null;

    if (certificateData.nftStatus === 'minted' && certificateData.nftIds && certificateData.nftIds.length > 0) {
      return {
        status: 'valid',
        icon: <CheckCircle className="text-green-600" size={32} />,
        title: 'Sertifikat Asli ✅',
        description: 'Sertifikat keaslian digital terverifikasi',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        status: 'invalid',
        icon: <XCircle className="text-red-600" size={32} />,
        title: 'Sertifikat Tidak Valid ❌',
        description: 'Sertifikat tidak terdaftar dalam sistem',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }
  };

  const verificationStatus = getVerificationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <Analytics />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verifikasi Keaslian Sertifikat
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Verifikasi keaslian sertifikat digital batik Giriloyo dengan NFT ID atau Transaction Hash
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setSearchType('nftId')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    searchType === 'nftId'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  NFT ID
                </button>
                <button
                  onClick={() => setSearchType('transactionHash')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    searchType === 'transactionHash'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Transaction Hash
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={
                    searchType === 'nftId' 
                      ? 'Contoh: mock-nft-1763903050331-qmpo90ly0' 
                      : 'Contoh: 0xef87e99eb78b9e561cf2ff6ed69c1dd8854d7f3ebe6559708014c716b485ff1f'
                  }
                  className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 text-black rounded-xl focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>
            
            <button
              onClick={() => handleSearch()}
              disabled={loading || !searchInput.trim()}
              className="lg:w-auto w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memverifikasi...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Verifikasi Sekarang
                </>
              )}
            </button>
          </div>

          {/* Example */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Contoh untuk testing:</strong><br />
              NFT ID: <code className="bg-blue-100 px-2 py-1 rounded">mock-nft-1763903050331-qmpo90ly0</code><br />
              Transaction Hash: <code className="bg-blue-100 px-2 py-1 rounded text-xs">0xef87e99eb78b9e561cf2ff6ed69c1dd8854d7f3ebe6559708014c716b485ff1f</code>
            </p>
          </div>
        </div>

        {/* Results Section */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-8">
            <XCircle className="text-red-600 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-red-800 mb-2">Verifikasi Gagal</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {certificateData && verificationStatus && (
          <div className="space-y-6">
            {/* Verification Status */}
            <div className={`bg-white rounded-2xl shadow-xl p-6 lg:p-8 border-2 ${verificationStatus.borderColor}`}>
              <div className="flex items-center gap-4 mb-4">
                {verificationStatus.icon}
                <div>
                  <h2 className={`text-2xl font-bold ${verificationStatus.color}`}>
                    {verificationStatus.title}
                  </h2>
                  <p className="text-gray-600">{verificationStatus.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* Certificate Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <Award size={20} className="text-purple-600" />
                    Informasi Sertifikat
                  </h3>
                  
                  {certificateData.nftIds && certificateData.nftIds.map((nftId, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">NFT ID:</p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm text-black bg-white px-2 py-1 rounded border flex-1">
                          {nftId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(nftId)}
                          className="text-gray-500 hover:text-gray-700 transition"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {certificateData.nftTransactionHash && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Transaction Hash:</p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-black bg-white px-2 py-1 rounded border flex-1 break-all">
                          {certificateData.nftTransactionHash}
                        </code>
                        <button
                          onClick={() => copyToClipboard(certificateData.nftTransactionHash!)}
                          className="text-gray-500 hover:text-gray-700 transition shrink-0"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {certificateData.nftMintedAt && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Tanggal Penerbitan:</p>
                      <p className="font-semibold  text-black">{formatDate(certificateData.nftMintedAt)}</p>
                    </div>
                  )}
                </div>

                {/* Order Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <Package size={20} className="text-blue-600" />
                    Informasi Pesanan
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Order ID:</p>
                    <p className="font-semibold  text-black font-mono">{certificateData.orderId}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tanggal Pesanan:</p>
                    <p className="font-semibold text-black">{formatDate(certificateData.createdAt)}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status:</p>
                    <p className="font-semibold capitalize text-black">{certificateData.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Produk yang Diverifikasi</h3>
              
              <div className="space-y-4">
                {certificateData.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                      <p className="font-bold text-amber-600 mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <User size={20} className="text-green-600" />
                Informasi Pemilik
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama:</p>
                  <p className="font-semibold text-black ">{certificateData.shippingAddress.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email:</p>
                  <p className="font-semibold text-black ">{certificateData.shippingAddress.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telepon:</p>
                  <p className="font-semibold text-black ">{certificateData.shippingAddress.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Alamat:</p>
                  <p className="font-semibold text-black ">
                    {certificateData.shippingAddress.address}, {certificateData.shippingAddress.city}, {certificateData.shippingAddress.province}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Notes */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <Shield className="text-blue-600 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">Keamanan Sertifikat Digital</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Setiap sertifikat memiliki ID unik yang tidak bisa dipalsukan</li>
                    <li>• Transaksi tercatat di blockchain dengan hash yang unik</li>
                    <li>• Sertifikat ini adalah bukti kepemilikan dan keaslian produk batik</li>
                    <li>• Dapat diverifikasi kapan saja melalui halaman ini</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How to Verify Section */}
        {!certificateData && !error && (
          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-200">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Cara Verifikasi Sertifikat</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Dapatkan NFT ID</h4>
                <p className="text-sm text-gray-600">
                  NFT ID dapat ditemukan di email konfirmasi atau di halaman order Anda
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Masukkan ke Form</h4>
                <p className="text-sm text-gray-600">
                  Salin dan tempel NFT ID atau Transaction Hash ke form verifikasi
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Verifikasi Otomatis</h4>
                <p className="text-sm text-gray-600">
                  Sistem akan memverifikasi keaslian sertifikat secara instan
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default VerifyCertificate;