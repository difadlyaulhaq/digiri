// pages/checkout/success.tsx - PERBAIKAN LENGKAP
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, Award, Mail, Sparkles, Loader, AlertCircle, RefreshCw, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CheckoutSuccess = () => {
  const router = useRouter();
  const { order_id, transaction_id, warning } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [nftStatus, setNftStatus] = useState<'minting' | 'minted' | 'failed' | 'pending'>('pending');
  const [nftData, setNftData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (order_id) {
      fetchOrderDetails(order_id as string);
      
      // Set up interval untuk mengecek status order dan NFT setiap 5 detik
      const interval = setInterval(() => {
        checkOrderStatus(order_id as string);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [order_id]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching order details for:', orderId);
      
      // 1. Coba ambil dari endpoint details
      const detailsResponse = await fetch(`/api/order/details?orderId=${orderId}`);
      
      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        console.log('✅ Order details found:', detailsData);
        
        setOrderDetails(detailsData);
        setOrder({
          orderId: detailsData.orderId,
          status: detailsData.status || 'paid',
          nftStatus: detailsData.nftStatus || 'pending',
          nftIds: detailsData.nftIds || [],
          nftTransactionHash: detailsData.nftTransactionHash,
          customer: detailsData.customer || { name: '', email: '' },
          items: detailsData.items || [],
          totals: detailsData.totals || { subtotal: 0, shipping: 0, nftFee: 0, total: 0 },
          dates: detailsData.dates || { createdAt: '', updatedAt: '' }
        });
        
        // Update NFT status
        if (detailsData.nftStatus === 'minted' && detailsData.nftIds && detailsData.nftIds.length > 0) {
          setNftStatus('minted');
          setNftData({
            nftId: detailsData.nftIds[0],
            transactionHash: detailsData.nftTransactionHash
          });
        } else if (detailsData.nftStatus === 'failed') {
          setNftStatus('failed');
        } else if (detailsData.status === 'paid' && (!detailsData.nftStatus || detailsData.nftStatus === 'pending')) {
          setNftStatus('minting');
          // Trigger NFT minting jika belum dimulai
          triggerNFTMinting(orderId);
        }
        
      } else {
        // Jika endpoint details gagal, coba endpoint verify
        console.log('⚠️ Order details not found, trying verify endpoint...');
        await checkOrderViaVerify(orderId);
      }
    } catch (error) {
      console.error('❌ Error fetching order details:', error);
      await checkOrderViaVerify(orderId);
    } finally {
      setLoading(false);
    }
  };

  const checkOrderViaVerify = async (orderId: string) => {
    try {
      console.log('🔍 Checking order via verify endpoint...');
      const verifyResponse = await fetch(`/api/order/verify?orderId=${orderId}`);
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        console.log('✅ Verify response:', verifyData);
        
        if (verifyData.exists && verifyData.order) {
          setOrder({
            orderId: verifyData.order.orderId,
            status: verifyData.order.status || 'paid',
            nftStatus: verifyData.order.nftStatus || 'pending',
            nftIds: verifyData.order.nftIds || [],
            nftTransactionHash: verifyData.order.nftTransactionHash,
            customer: verifyData.order.customer || { name: '', email: '' },
            totals: {
              subtotal: verifyData.order.subtotal || 0,
              shipping: verifyData.order.shipping || 0,
              nftFee: verifyData.order.nftFee || 0,
              total: verifyData.order.total || 0
            }
          });
          
          // Update NFT status
          if (verifyData.order.nftStatus === 'minted' && verifyData.order.nftIds && verifyData.order.nftIds.length > 0) {
            setNftStatus('minted');
            setNftData({
              nftId: verifyData.order.nftIds[0],
              transactionHash: verifyData.order.nftTransactionHash
            });
          } else if (verifyData.order.nftStatus === 'failed') {
            setNftStatus('failed');
          } else if (verifyData.order.status === 'paid' && (!verifyData.order.nftStatus || verifyData.order.nftStatus === 'pending')) {
            setNftStatus('minting');
            // Trigger NFT minting
            triggerNFTMinting(orderId);
          }
        } else {
          // Retry mechanism jika order tidak ditemukan
          if (retryCount < 3) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchOrderDetails(orderId);
            }, 3000);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking order via verify:', error);
      
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchOrderDetails(orderId);
        }, 3000);
      }
    }
  };

  const checkOrderStatus = async (orderId: string) => {
    if (nftStatus === 'minted' || nftStatus === 'failed') {
      return; // Stop checking if already minted or failed
    }
    
    try {
      const response = await fetch(`/api/order/details?orderId=${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        
        if (orderData.nftStatus === 'minted' && orderData.nftIds && orderData.nftIds.length > 0) {
          setNftStatus('minted');
          setNftData({
            nftId: orderData.nftIds[0],
            transactionHash: orderData.nftTransactionHash
          });
        } else if (orderData.nftStatus === 'failed') {
          setNftStatus('failed');
        }
      }
    } catch (error) {
      console.error('Error checking order status:', error);
    }
  };

  const triggerNFTMinting = async (orderId: string) => {
    try {
      console.log('🎭 Triggering NFT minting for order:', orderId);
      setNftStatus('minting');
      
      const response = await fetch('/api/nft/mock-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ NFT minting successful:', result);
        
        setNftStatus('minted');
        setNftData({
          nftId: result.nftId,
          transactionHash: result.transactionHash
        });
        
        // Refresh order data setelah minting
        setTimeout(() => fetchOrderDetails(orderId), 2000);
      } else {
        const errorData = await response.json();
        console.error('❌ NFT minting failed:', errorData);
        setNftStatus('failed');
      }
    } catch (error) {
      console.error('❌ Error triggering NFT minting:', error);
      setNftStatus('failed');
    }
  };

  const triggerManualMint = async () => {
    if (order_id) {
      await triggerNFTMinting(order_id as string);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    if (order_id) {
      fetchOrderDetails(order_id as string);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border border-slate-200">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle size={48} className="text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            {warning ? 'Pembayaran Berhasil dengan Catatan ⚠️' : 'Pembayaran Berhasil! 🎉'}
          </h1>
          
          {warning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-700">
                {warning === 'update_failed' 
                  ? 'Pembayaran berhasil tetapi ada masalah teknis. Pesanan Anda aman dan akan diproses.' 
                  : 'Pembayaran berhasil dengan beberapa masalah teknis.'}
              </p>
            </div>
          )}
          
          <p className="text-slate-600 mb-8 text-lg">
            Terima kasih telah berbelanja di <span className="font-semibold text-blue-900">Desa Wisata Batik Giriloyo</span>
          </p>

          {/* Order Info */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Informasi Pesanan
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader className="w-4 h-4 animate-spin text-blue-600" />
                <p>Memuat informasi pesanan...</p>
              </div>
            ) : order ? (
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-slate-600">Order ID</p>
                  <p className="font-semibold font-mono text-slate-800">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-slate-600">Status Pembayaran</p>
                  <p className="font-semibold text-green-600">Berhasil</p>
                </div>
                <div>
                  <p className="text-slate-600">Total Pembayaran</p>
                  <p className="font-semibold text-slate-800">
                    {formatPrice(order.totals?.total || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Status Pesanan</p>
                  <p className={`font-semibold capitalize ${
                    order.status === 'paid' ? 'text-green-600' : 
                    order.status === 'processing' ? 'text-blue-600' : 
                    'text-yellow-600'
                  }`}>
                    {order.status || 'processing'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-600 mb-4">Informasi pesanan sedang dimuat...</p>
                <button
                  onClick={handleRetry}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                >
                  <RefreshCw size={16} />
                  Coba Lagi ({retryCount}/3)
                </button>
              </div>
            )}
          </div>

          {/* NFT Status */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="text-amber-600" size={32} />
              <h2 className="text-xl font-bold text-blue-900">
                Sertifikat Digital Heritage NFT
              </h2>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-blue-600" />
                  <p className="text-blue-900 font-semibold">
                    Memeriksa status sertifikat digital...
                  </p>
                </div>
              </div>
            ) : nftStatus === 'pending' || nftStatus === 'minting' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-blue-900 font-semibold">
                    {nftStatus === 'pending' ? 'Menunggu pembuatan sertifikat...' : 'Sedang mencetak sertifikat digital...'}
                  </p>
                </div>
                <p className="text-slate-600 text-sm">
                  Sertifikat keaslian digital heritage sedang diproses dan akan dikirim ke email Anda
                </p>
                {nftStatus === 'pending' && order?.status === 'paid' && (
                  <div className="mt-4">
                    <button 
                      onClick={triggerManualMint}
                      className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition text-sm"
                    >
                      Mulai Proses Sertifikat
                    </button>
                  </div>
                )}
              </div>
            ) : // Di success.tsx - PERBAIKAN BAGIAN NFT STATUS
            nftStatus === 'minted' && nftData && (
  <div className="space-y-4">
    <div className="flex items-center justify-center gap-2">
      <CheckCircle size={20} className="text-green-500" />
      <p className="text-green-700 font-semibold">
        Sertifikat Digital Berhasil Dicetak!
      </p>
    </div>
    <div className="bg-white rounded-lg p-4 border border-green-200">
      <p className="text-sm text-slate-600 mb-2">
        <strong>NFT ID:</strong> {nftData?.nftId || 'N/A'}
      </p>
      <p className="text-sm text-slate-600 mb-2">
        <strong>Transaction Hash:</strong> {nftData?.transactionHash || 'N/A'}
      </p>
      {nftData?.nftMintedAt && (
        <p className="text-sm text-slate-600">
          <strong>Dicetak pada:</strong> {new Date(nftData.nftMintedAt).toLocaleDateString('id-ID')}
        </p>
      )}
    </div>
    <p className="text-slate-600 text-sm">
      Sertifikat keaslian digital heritage telah dikirim ke email Anda
    </p>
    {order?.customer?.email && (
      <button 
        onClick={() => window.open(`https://mail.google.com/mail/u/0/#search/${order.customer.email}`, '_blank')}
        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:shadow-xl transition flex items-center gap-2 mx-auto shadow-lg hover:shadow-amber-500/25"
      >
        <Mail size={16} />
        Buka Email
      </button>
    )}
    
    {/* Tambahkan tombol untuk verifikasi */}
    {nftData?.nftId && (
      <button 
        onClick={() => router.push(`/verify-certificate?nftId=${nftData.nftId}`)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-xl transition"
      >
        Verifikasi Sertifikat
      </button>
    )}
  </div>
)}
            
            {nftStatus === 'failed' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle size={20} className="text-red-500" />
                  <p className="text-red-700 font-semibold">
                    Gagal mencetak sertifikat digital
                  </p>
                </div>
                <p className="text-slate-600 text-sm">
                  Tim kami akan menghubungi Anda untuk proses lebih lanjut
                </p>
                <button 
                  onClick={triggerManualMint}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>

          {/* Order Items */}
          {orderDetails?.items && orderDetails.items.length > 0 && (
            <div className="bg-white rounded-xl p-6 mb-8 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Package size={20} />
                Detail Pesanan
              </h2>
              <div className="space-y-4">
                {orderDetails.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                      <Package size={24} className="text-slate-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-slate-800">{item.name}</h3>
                      <p className="text-sm text-slate-600">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="font-bold text-amber-600">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex justify-between text-slate-700">
                  <span>Total:</span>
                  <span className="font-bold text-xl text-amber-600">
                    {formatPrice(orderDetails.totals?.total || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/produk')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-lg hover:shadow-xl transition font-semibold shadow-lg hover:shadow-amber-500/25 flex items-center gap-2"
            >
              <Sparkles size={18} />
              Lanjut Berbelanja
            </button>
            <button
              onClick={() => router.push('/orders')}
              className="bg-white text-slate-700 border-2 border-slate-300 px-8 py-3 rounded-lg hover:bg-slate-50 transition font-semibold"
            >
              Lihat Pesanan Saya
            </button>
          </div>

          {/* Support Info */}
          <div className="text-center mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-2">
              Butuh bantuan?{' '}
              <a href="mailto:difadlyaulhaq2@gmail.com" className="text-blue-700 hover:underline font-medium">
                Hubungi Customer Service
              </a>
            </p>
            <p className="text-xs text-slate-400">
              Pesanan Anda akan diproses dalam 7-14 hari kerja
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;