// pages/checkout/success.tsx - IMPROVED VERSION
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, Award, Mail, ExternalLink, Sparkles, Loader, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CheckoutSuccess = () => {
  const router = useRouter();
  const { order_id, transaction_status, transaction_id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [nftStatus, setNftStatus] = useState<'minting' | 'minted' | 'failed'>('minting');
  const [nftData, setNftData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order_id) {
      fetchOrderDetails(order_id as string);
      
      // Check NFT status periodically
      const interval = setInterval(() => {
        checkNFTStatus(order_id as string);
      }, 3000); // Check every 3 seconds

      return () => clearInterval(interval);
    }
  }, [order_id]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/order/details?orderId=${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
        
        // Check current NFT status
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
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkNFTStatus = async (orderId: string) => {
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
      console.error('Error checking NFT status:', error);
    }
  };

  const triggerManualMint = async () => {
    try {
      setNftStatus('minting');
      const response = await fetch('/api/nft/mock-mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order_id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setNftStatus('minted');
        setNftData({
          nftId: result.nftId,
          transactionHash: result.transactionHash
        });
      } else {
        setNftStatus('failed');
      }
    } catch (error) {
      console.error('Error triggering manual mint:', error);
      setNftStatus('failed');
    }
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
            Pembayaran Berhasil! 🎉
          </h1>
          
          <p className="text-slate-600 mb-8 text-lg">
            Terima kasih telah berbelanja di <span className="font-semibold text-blue-900">Desa Wisata Batik Giriloyo</span>
          </p>

          {/* Order Info */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Informasi Pesanan
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-slate-600">Order ID</p>
                <p className="font-semibold font-mono text-slate-800">{order_id}</p>
              </div>
              <div>
                <p className="text-slate-600">Status Pembayaran</p>
                <p className="font-semibold text-green-600">Berhasil</p>
              </div>
            </div>
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
                    Memeriksa status NFT...
                  </p>
                </div>
              </div>
            ) : nftStatus === 'minting' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-blue-900 font-semibold">
                    Sedang mencetak sertifikat digital...
                  </p>
                </div>
                <p className="text-slate-600 text-sm">
                  Sertifikat keaslian digital heritage sedang diproses dan akan dikirim ke email Anda
                </p>
                <div className="mt-4">
                  <button 
                    onClick={triggerManualMint}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition text-sm"
                  >
                    Trigger Manual Mint (Development)
                  </button>
                </div>
              </div>
            )}
            
            {nftStatus === 'minted' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle size={20} className="text-green-500" />
                  <p className="text-green-700 font-semibold">
                    Sertifikat Digital Berhasil Dicetak!
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>NFT ID:</strong> {nftData?.nftId}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Transaction Hash:</strong> {nftData?.transactionHash}
                  </p>
                </div>
                <p className="text-slate-600 text-sm">
                  Sertifikat keaslian digital heritage telah dikirim ke email Anda
                </p>
                <button 
                  onClick={() => window.open('https://mail.google.com', '_blank')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg hover:shadow-xl transition flex items-center gap-2 mx-auto shadow-lg hover:shadow-amber-500/25"
                >
                  <Mail size={16} />
                  Buka Email
                </button>
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
            <p className="text-sm text-slate-500">
              Butuh bantuan?{' '}
              <a href="mailto:difadlyaulhaq2@gmail.com" className="text-blue-700 hover:underline font-medium">
                Hubungi Customer Service
              </a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;