// pages/verify-certificate.tsx - VERSI DIPERBAIKI DENGAN ORDER ID VERIFICATION
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
  MapPin,
  FileText,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/utils/orderUtils';
import { Analytics } from "@vercel/analytics/next";

const VerifyCertificate = () => {
  const router = useRouter();
  const { nftId, transactionHash, orderId: urlOrderId } = router.query;

  const [searchInput, setSearchInput] = useState('');
  const [certificateData, setCertificateData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'nftId' | 'transactionHash' | 'orderId'>('nftId');
  const [showMintButton, setShowMintButton] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{ success: boolean; message?: string } | null>(null);

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
    } else if (urlOrderId) {
      setSearchInput(urlOrderId as string);
      setSearchType('orderId');
      handleSearch(urlOrderId as string, 'orderId');
    }
  }, [nftId, transactionHash, urlOrderId]);

  // ✅ FUNGSI PENCARIAN YANG DIPERBAIKI DENGAN ORDER ID SUPPORT
  const handleSearch = async (value: string = searchInput, type: 'nftId' | 'transactionHash' | 'orderId' = searchType) => {
    if (!value.trim()) {
      setError('Masukkan NFT ID, Transaction Hash, atau Order ID');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificateData(null);
    setShowMintButton(false);
    setMintResult(null);

    try {
      console.log(`🔍 Mencari dengan ${type}:`, value);

      let foundOrder: Order | null = null;

      // ✅ STRATEGI 1: Cari langsung di Firestore berdasarkan tipe pencarian
      try {
        const ordersRef = collection(db, 'orders');
        let q;

        if (type === 'nftId') {
          // Cari order yang nftIds array-nya mengandung nilai yang dicari
          q = query(
            ordersRef,
            where('nftIds', 'array-contains', value.trim()),
            limit(1)
          );
        } else if (type === 'transactionHash') {
          // Cari berdasarkan transaction hash
          q = query(
            ordersRef,
            where('nftTransactionHash', '==', value.trim()),
            limit(1)
          );
        } else {
          // Cari berdasarkan Order ID
          q = query(
            ordersRef,
            where('orderId', '==', value.trim()),
            limit(1)
          );
        }

        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          foundOrder = {
            ...docData,
            shippingAddress: docData.shippingAddress || {},
            items: docData.items || [],
            nftIds: docData.nftIds || [],
            nftStatus: docData.nftStatus || 'pending',
            status: docData.status || 'pending',
            subtotal: docData.subtotal || 0,
            shipping: docData.shipping || 0,
            nftFee: docData.nftFee || 0,
            total: docData.total || 0,
            createdAt: docData.createdAt || new Date().toISOString(),
            updatedAt: docData.updatedAt || new Date().toISOString(),
          } as Order;
          
          console.log('✅ Data ditemukan di Firestore:', {
            orderId: foundOrder.orderId,
            nftStatus: foundOrder.nftStatus,
            nftIdsCount: foundOrder.nftIds?.length || 0
          });
        }
      } catch (firestoreError) {
        console.warn('⚠️ Firestore query error:', firestoreError);
      }

      // ✅ STRATEGI 2: Jika tidak ditemukan, scan semua orders
      if (!foundOrder) {
        console.log('🔄 Mencoba scan manual semua orders...');
        
        try {
          const ordersRef = collection(db, 'orders');
          const allOrdersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
          const allOrdersSnapshot = await getDocs(allOrdersQuery);
          
          for (const doc of allOrdersSnapshot.docs) {
            const orderData = doc.data() as Order;
            let matchFound = false;
            
            if (type === 'nftId' && orderData.nftIds) {
              matchFound = orderData.nftIds.some(id => 
                id === value.trim() || 
                id.toLowerCase() === value.trim().toLowerCase()
              );
            } else if (type === 'transactionHash' && orderData.nftTransactionHash) {
              matchFound = (
                orderData.nftTransactionHash === value.trim() ||
                orderData.nftTransactionHash.toLowerCase() === value.trim().toLowerCase()
              );
            } else if (type === 'orderId') {
              matchFound = (
                orderData.orderId === value.trim() ||
                orderData.orderId.toLowerCase() === value.trim().toLowerCase()
              );
            }
            
            if (matchFound) {
              foundOrder = orderData;
              console.log('✅ Data ditemukan via scan:', foundOrder.orderId);
              break;
            }
          }
        } catch (scanError) {
          console.warn('⚠️ Error during manual scan:', scanError);
        }
      }

      // ✅ STRATEGI 3: Fallback ke localStorage
      if (!foundOrder && typeof window !== 'undefined') {
        console.log('🔄 Mencoba di localStorage...');
        
        const ordersJson = localStorage.getItem('orders');
        if (ordersJson) {
          const allOrders: Order[] = JSON.parse(ordersJson);
          
          foundOrder = allOrders.find(order => {
            if (type === 'nftId' && order.nftIds) {
              return order.nftIds.some(id => 
                id === value.trim() || 
                id.toLowerCase() === value.trim().toLowerCase()
              );
            } else if (type === 'transactionHash' && order.nftTransactionHash) {
              return (
                order.nftTransactionHash === value.trim() ||
                order.nftTransactionHash.toLowerCase() === value.trim().toLowerCase()
              );
            } else if (type === 'orderId') {
              return (
                order.orderId === value.trim() ||
                order.orderId.toLowerCase() === value.trim().toLowerCase()
              );
            }
            return false;
          }) || null;
          
          if (foundOrder) {
            console.log('✅ Data ditemukan di localStorage:', foundOrder.orderId);
          }
        }
      }

      // ✅ HASIL PENCARIAN
      if (foundOrder) {
        console.log('✅ Data berhasil ditemukan!', {
          orderId: foundOrder.orderId,
          nftStatus: foundOrder.nftStatus,
          orderStatus: foundOrder.status
        });
        
        setCertificateData(foundOrder);
        
        // Tampilkan tombol mint jika order sudah paid tapi NFT belum dibuat
        if (foundOrder.status === 'paid' && (!foundOrder.nftStatus || foundOrder.nftStatus === 'pending')) {
          setShowMintButton(true);
        }
        
        // Update URL tanpa reload page
        const newQuery: any = {};
        if (type === 'nftId') newQuery.nftId = value;
        if (type === 'transactionHash') newQuery.transactionHash = value;
        if (type === 'orderId') newQuery.orderId = value;
        
        router.push({
          pathname: '/verify-certificate',
          query: newQuery
        }, undefined, { shallow: true });
      } else {
        console.log('❌ Data tidak ditemukan setelah semua strategi');
        setError(`${type === 'nftId' ? 'NFT ID' : type === 'transactionHash' ? 'Transaction Hash' : 'Order ID'} tidak ditemukan. Pastikan Anda memasukkan data yang benar.`);
      }
    } catch (err) {
      console.error('❌ Error searching:', err);
      setError('Terjadi kesalahan saat memverifikasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNGSI UNTUK MINT NFT BERDASARKAN ORDER ID
  const handleMintNFT = async () => {
    if (!certificateData || !certificateData.orderId) {
      setError('Order ID tidak valid');
      return;
    }

    setMinting(true);
    setMintResult(null);
    setShowMintButton(false);

    try {
      console.log('🎭 Starting NFT minting for order:', certificateData.orderId);
      
      const mintResponse = await fetch('/api/nft/mock-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: certificateData.orderId,
          customerEmail: certificateData.shippingAddress?.email,
          customerName: certificateData.shippingAddress?.name
        }),
      });

      if (mintResponse.ok) {
        const result = await mintResponse.json();
        console.log('✅ NFT minting successful:', result);
        
        setMintResult({
          success: true,
          message: `NFT berhasil dibuat! NFT ID: ${result.nftId}`
        });
        
        // Refresh data setelah minting berhasil
        setTimeout(() => {
          handleSearch(certificateData.orderId, 'orderId');
        }, 2000);
      } else {
        const errorData = await mintResponse.json();
        console.error('❌ NFT minting failed:', errorData);
        
        setMintResult({
          success: false,
          message: `Gagal membuat NFT: ${errorData.error || 'Unknown error'}`
        });
        
        setShowMintButton(true);
      }
    } catch (error: any) {
      console.error('❌ Error minting NFT:', error);
      
      setMintResult({
        success: false,
        message: `Error: ${error.message || 'Gagal menghubungi server'}`
      });
      
      setShowMintButton(true);
    } finally {
      setMinting(false);
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

    // Jika order belum paid
    if (certificateData.status !== 'paid') {
      return {
        status: 'unpaid',
        icon: <AlertCircle className="text-yellow-600" size={32} />,
        title: 'NFT Pesanan Belum Di Proses ⏳',
        description: 'Mohon tunggu hingga pembayaran diverifikasi dan NFT dicetak',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }

    // Jika sudah paid tapi NFT belum dibuat
    if (certificateData.nftStatus === 'pending' || !certificateData.nftStatus) {
      return {
        status: 'pending_nft',
        icon: <Clock className="text-blue-600" size={32} />,
        title: 'Menunggu NFT Certificate ⏳',
        description: 'Pesanan sudah dibayar, sertifikat digital sedang menunggu dicetak',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    // Jika NFT gagal dibuat
    if (certificateData.nftStatus === 'failed') {
      return {
        status: 'failed',
        icon: <XCircle className="text-red-600" size={32} />,
        title: 'NFT Gagal Dicetak ❌',
        description: 'Sertifikat digital gagal dibuat',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    // Jika NFT berhasil dibuat
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
    }

    // Default
    return {
      status: 'unknown',
      icon: <AlertCircle className="text-gray-600" size={32} />,
      title: 'Status Tidak Diketahui',
      description: 'Tidak dapat menentukan status sertifikat',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
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
            Verifikasi keaslian sertifikat digital batik Giriloyo dengan NFT ID, Transaction Hash, atau Order ID
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => setSearchType('nftId')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    searchType === 'nftId'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Award size={16} />
                    NFT ID
                  </div>
                </button>
                <button
                  onClick={() => setSearchType('transactionHash')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    searchType === 'transactionHash'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Transaction Hash
                  </div>
                </button>
                <button
                  onClick={() => setSearchType('orderId')}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    searchType === 'orderId'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} />
                    Order ID
                  </div>
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
                      ? 'Masukkan NFT ID dari email Anda (contoh: mock-nft-1764900597153-nhwqlzxp6)' 
                      : searchType === 'transactionHash'
                      ? 'Masukkan Transaction Hash dari email Anda (contoh: 0xb8d7adebfd02f719...)' 
                      : 'Masukkan Order ID Anda (contoh: GRLYO-1764914767494-F8NURG)'
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
                  Mencari...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Verifikasi Sekarang
                </>
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>💡 Tips:</strong> Salin dan tempel NFT ID, Transaction Hash, atau Order ID dari email konfirmasi pembelian Anda.
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

        {/* Mint Result */}
        {mintResult && (
          <div className={`border rounded-2xl p-6 mb-8 ${
            mintResult.success 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-3">
              {mintResult.success ? (
                <CheckCircle size={24} />
              ) : (
                <XCircle size={24} />
              )}
              <div>
                <p className="font-bold">{mintResult.success ? 'Berhasil!' : 'Gagal'}</p>
                <p>{mintResult.message}</p>
              </div>
            </div>
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

              {/* Show mint button if order is paid but NFT is not created */}
              {showMintButton && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-blue-900 mb-1">NFT Belum Dibuat</p>
                      <p className="text-sm text-blue-700">
                        Pesanan sudah dibayar tetapi sertifikat digital belum dibuat. Klik tombol di samping untuk membuat NFT.
                      </p>
                    </div>
                    <button
                      onClick={handleMintNFT}
                      disabled={minting}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-bold disabled:opacity-50 flex items-center gap-2"
                    >
                      {minting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sedang Membuat...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Buat NFT Sekarang
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {/* Order Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <ShoppingBag size={20} className="text-blue-600" />
                    Informasi Pesanan
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Order ID:</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm text-black bg-white px-2 py-1 rounded border flex-1">
                        {certificateData.orderId}
                      </code>
                      <button
                        onClick={() => copyToClipboard(certificateData.orderId)}
                        className="text-gray-500 hover:text-gray-700 transition"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status Pesanan:</p>
                    <p className={`font-semibold capitalize ${
                      certificateData.status === 'paid' ? 'text-green-600' :
                      certificateData.status === 'pending' ? 'text-yellow-600' :
                      certificateData.status === 'processing' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {certificateData.status || 'unknown'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tanggal Pesanan:</p>
                    <p className="font-semibold text-black">{formatDate(certificateData.createdAt)}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Pembayaran:</p>
                    <p className="font-bold text-amber-600 text-lg">{formatPrice(certificateData.total)}</p>
                  </div>
                </div>

                {/* Certificate Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <Award size={20} className="text-purple-600" />
                    Informasi Sertifikat Digital
                  </h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status NFT:</p>
                    <p className={`font-semibold capitalize ${
                      certificateData.nftStatus === 'minted' ? 'text-green-600' :
                      certificateData.nftStatus === 'pending' ? 'text-yellow-600' :
                      certificateData.nftStatus === 'failed' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {certificateData.nftStatus || 'belum dibuat'}
                    </p>
                  </div>

                  {certificateData.nftIds && certificateData.nftIds.length > 0 && (
                    certificateData.nftIds.map((nftId, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">NFT ID {certificateData.nftIds!.length > 1 ? `#${index + 1}` : ''}:</p>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm text-black bg-white px-2 py-1 rounded border flex-1 break-all">
                            {nftId}
                          </code>
                          <button
                            onClick={() => copyToClipboard(nftId)}
                            className="text-gray-500 hover:text-gray-700 transition shrink-0"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

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
                      <p className="font-semibold text-black">{formatDate(certificateData.nftMintedAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Information */}
            {certificateData.items && certificateData.items.length > 0 && (
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
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="font-bold text-amber-600">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Summary */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Subtotal Produk:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(certificateData.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Ongkos Kirim:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(certificateData.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Biaya NFT:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(certificateData.nftFee)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span>Total:</span>
                      <span className="text-amber-600">{formatPrice(certificateData.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                    {certificateData.shippingAddress.address}, {certificateData.shippingAddress.city}, {certificateData.shippingAddress.province} {certificateData.shippingAddress.postalCode}
                  </p>
                </div>
                {certificateData.shippingAddress.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Catatan:</p>
                    <p className="font-semibold text-black ">{certificateData.shippingAddress.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {certificateData.nftIds && certificateData.nftIds.length > 0 && (
                <button
                  onClick={() => router.push(`/verify-certificate?nftId=${certificateData.nftIds![0]}`)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-bold flex items-center gap-2"
                >
                  <Shield size={16} />
                  Verifikasi dengan NFT ID
                </button>
              )}
              
              <button
                onClick={() => router.push(`/orders`)}
                className="bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-bold flex items-center gap-2"
              >
                <ShoppingBag size={16} />
                Lihat Pesanan Saya
              </button>
              
              <button
                onClick={() => router.push(`/produk`)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-bold flex items-center gap-2"
              >
                <Sparkles size={16} />
                Belanja Lagi
              </button>
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
                    <li>• Jika NFT belum dibuat untuk pesanan yang sudah dibayar, klik tombol "Buat NFT Sekarang"</li>
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
                <h4 className="font-semibold text-gray-900 mb-2">Dapatkan Data Verifikasi</h4>
                <p className="text-sm text-gray-600">
                  NFT ID, Transaction Hash, atau Order ID dapat ditemukan di email konfirmasi
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Pilih Jenis Verifikasi</h4>
                <p className="text-sm text-gray-600">
                  Pilih jenis data yang Anda miliki (NFT ID, Transaction Hash, atau Order ID)
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
            
            <div className="mt-8 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>⚠️ Catatan Penting:</strong> Jika Anda mencari dengan Order ID dan pesanan sudah dibayar tetapi NFT belum dibuat, 
                Anda bisa membuat NFT langsung dari halaman verifikasi ini dengan mengklik tombol "Buat NFT Sekarang".
              </p>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default VerifyCertificate;