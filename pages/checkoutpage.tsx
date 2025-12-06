// pages/checkout.tsx - PERBAIKAN LENGKAP
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ShoppingBag, MapPin, User, Mail, Phone, CreditCard, Shield, Award, CheckCircle, Sparkles, Loader } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCartItems, clearCart } from '@/utils/cartUtils';
import { createOrderBeforePayment, updateOrderAfterPayment, updateNFTStatus } from '@/utils/orderUtils';
import MidtransScript from '@/components/MidtransScript';
import { Analytics } from "@vercel/analytics/next";

interface CartItem {
  id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  slug: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');

  // Load cart items
  useEffect(() => {
    const loadCartItems = async () => {
      const items = await getCartItems();
      if (items.length === 0) {
        router.push('/keranjang');
      } else {
        setCartItems(items);
      }
    };
    loadCartItems();
  }, [router]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 25000;
  const nftFee = 0;
  const total = subtotal + shipping + nftFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert('Mohon lengkapi semua data yang diperlukan');
      return;
    }
    setStep(2);
  };

  // **FUNGSI UTAMA: Handle Payment Process**
  const handlePayment = async () => {
    if (isProcessing) {
      console.log('🔄 Proses pembayaran sedang berjalan, tunggu...');
      return;
    }

    try {
      setIsProcessing(true);

      console.log('🔄 [1/5] Membuat order sebelum pembayaran...');

      // 1. Buat order terlebih dahulu
      const { orderId, orderData, success } = await createOrderBeforePayment(
        cartItems,
        formData,
        subtotal,
        shipping,
        nftFee,
        total
      );

      if (!success) {
        throw new Error('Gagal membuat order');
      }

      setCurrentOrderId(orderId);
      console.log('✅ [1/5] Order dibuat:', orderId);

      // 2. Prepare data untuk Midtrans
      const nftItems = cartItems.map(item => ({
        productName: item.name,
        productImage: item.image,
        artisan: "Pengrajin Giriloyo",
        location: "Desa Giriloyo, Yogyakarta",
        motif: item.name.split('Motif ')[1] || item.name,
        processingTime: "14-21 hari"
      }));

      const paymentData = {
        orderId: orderId,
        amount: total,
        shipping: shipping,
        nftFee: nftFee,
        customerDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode
        },
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        nftItems: nftItems
      };

      console.log('✅ [2/5] Data pembayaran siap');

      // 3. Create Midtrans transaction
      console.log('🔄 [3/5] Membuat transaksi Midtrans...');
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membuat transaksi pembayaran');
      }

      const paymentResult = await response.json();
      console.log('✅ [3/5] Token Midtrans diterima');

      // 4. Wait for Snap.js to load
      await new Promise(resolve => setTimeout(resolve, 500));

      // 5. Open Midtrans payment popup
      if (typeof window !== 'undefined' && (window as any).snap) {
        console.log('🔄 [4/5] Membuka popup pembayaran Midtrans...');
        
        (window as any).snap.pay(paymentResult.token, {
          onSuccess: async function(result: any) {
            console.log('💰 [5/5] Pembayaran berhasil:', result);
            
            try {
              // Update order status to paid
              const updateSuccess = await updateOrderAfterPayment(
                orderId,
                result.transaction_id,
                'settlement',
                result.payment_type
              );

              if (updateSuccess) {
                console.log('✅ Status order diperbarui menjadi paid');
                
                // Trigger NFT minting
                await triggerMockNFTMinting(orderData, nftItems);
                
                // Clear cart
                await clearCart();
                
                // Wait for order to be fully saved
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Redirect to success page
                router.push(`/checkout/success?order_id=${orderId}&transaction_id=${result.transaction_id}`);
              } else {
                console.error('❌ Gagal memperbarui status order');
                router.push(`/checkout/success?order_id=${orderId}&warning=update_failed`);
              }
            } catch (error) {
              console.error('❌ Error dalam proses post-payment:', error);
              router.push(`/checkout/success?order_id=${orderId}&warning=error`);
            } finally {
              setIsProcessing(false);
            }
          },
          onPending: async function(result: any) {
            console.log('⏳ Pembayaran pending:', result);
            
            try {
              // Update order tetap pending
              await updateOrderAfterPayment(
                orderId,
                result.transaction_id,
                'pending',
                result.payment_type
              );
              
              router.push(`/checkout/pending?order_id=${orderId}&transaction_id=${result.transaction_id}`);
            } catch (error) {
              console.error('❌ Error updating pending order:', error);
              router.push(`/checkout/pending?order_id=${orderId}`);
            } finally {
              setIsProcessing(false);
            }
          },
          onError: function(result: any) {
            console.log('❌ Error pembayaran:', result);
            // Update order status to cancelled
            updateOrderAfterPayment(orderId, result.transaction_id || 'unknown', 'deny').catch(console.error);
            router.push(`/checkout/error?order_id=${orderId}&error_message=Pembayaran gagal`);
            setIsProcessing(false);
          },
          onClose: function() {
            console.log('🔒 Popup pembayaran ditutup');
            alert('Pembayaran dibatalkan. Order Anda tetap tersimpan dengan status pending.');
            setIsProcessing(false);
          }
        });
      } else {
        throw new Error('Midtrans SDK tidak terload');
      }

    } catch (error: any) {
      console.error('❌ Error dalam proses pembayaran:', error);
      alert(`Gagal memproses pembayaran: ${error.message}`);
      setIsProcessing(false);
    }
  };

  // **FUNGSI: Mock NFT Minting**
  // Di checkoutpage.tsx - PERBAIKAN FUNGSI triggerMockNFTMinting
const triggerMockNFTMinting = async (order: any, nftItems: any[]) => {
  try {
    console.log('🎭 Starting mock NFT minting for order...');
    
    // Gunakan item pertama untuk membuat NFT (satu NFT per order)
    const nftItem = nftItems[0];
    const nftData = {
      orderId: order.orderId,
      customerEmail: order.shippingAddress.email,
      customerName: order.shippingAddress.name,
      productName: nftItem.productName || 'Batik Giriloyo Collection',
      productImage: nftItem.productImage,
      artisan: nftItem.artisan,
      location: nftItem.location,
      motif: nftItem.motif,
      processingTime: nftItem.processingTime
    };

    try {
      const mintResponse = await fetch('/api/nft/mock-mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nftData),
      });

      if (mintResponse.ok) {
        const result = await mintResponse.json();
        console.log(`✅ Mock NFT minted for order ${order.orderId}: ${result.nftId}`);
        
        // Update order dengan satu NFT
        const updateSuccess = await updateNFTStatus(
          order.orderId,
          'minted',
          [result.nftId], // array dengan satu NFT ID
          result.transactionHash,
          result.nftMintedAt
        );
        
        if (updateSuccess) {
          console.log(`✅ Order ${order.orderId} updated with NFT`);
        } else {
          console.error('❌ Failed to update order NFT status');
        }
        
        return [{ 
          success: true, 
          nftId: result.nftId, 
          transactionHash: result.transactionHash,
          nftMintedAt: result.nftMintedAt
        }];
      } else {
        const error = await mintResponse.json();
        console.error(`❌ Mock NFT minting failed: ${error.error}`);
        await updateNFTStatus(order.orderId, 'failed');
        return [{ success: false, error: error.error }];
      }
    } catch (mintError) {
      console.error(`❌ Mock NFT minting error:`, mintError);
      await updateNFTStatus(order.orderId, 'failed');
      return [{ success: false, error: String(mintError) }];
    }
  } catch (error) {
    console.error('❌ Error in triggerMockNFTMinting:', error);
    throw error;
  }
};  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-200">
          <ShoppingBag size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-6">Silakan tambahkan produk ke keranjang terlebih dahulu.</p>
          <button 
            onClick={() => router.push('/produk')}
            className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition"
          >
            Jelajahi Produk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      <Navbar />
      <Analytics />
      <MidtransScript />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Checkout</h1>
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-600'} font-bold text-sm`}>
                1
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-900' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-600'} font-bold text-sm`}>
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {step === 1 ? (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Informasi Pengiriman</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="inline w-4 h-4 mr-2" />
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:outline-none transition"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="inline w-4 h-4 mr-2" />
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 text-black py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:outline-none transition"
                        placeholder="email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="inline w-4 h-4 mr-2" />
                        No. Telepon *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:outline-none transition"
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-2" />
                      Alamat Lengkap *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:outline-none transition resize-none"
                      placeholder="Jalan, No. Rumah, RT/RW, Kelurahan"
                      required
                    ></textarea>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kota *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full text-black px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:outline-none transition"
                        placeholder="Kota"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Provinsi *</label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className="w-full px-4 text-black py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:outline-none transition"
                        placeholder="Provinsi"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kode Pos</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-black border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:outline-none transition"
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan (Opsional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 text-black py-3 border-2 border-gray-200 rounded-xl focus:border-blue-900 focus:outline-none transition resize-none"
                      placeholder="Catatan untuk pengrajin..."
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <Award className="text-purple-600 shrink-0" size={24} />
                  <p className="text-sm text-gray-700">
                    <span className="font-bold text-purple-700">NFT Certificate</span> akan dikirim ke email Anda setelah pembayaran berhasil
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-blue-900 to-slate-900 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition text-lg"
                >
                  Lanjut ke Pembayaran
                </button>
              </form>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Metode Pembayaran</h2>
                
                <div className="space-y-4 mb-8">
                  <button className="w-full p-6 border-2 border-blue-900 rounded-2xl hover:bg-blue-50 transition text-left bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <CreditCard className="text-blue-900" size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Midtrans Payment Gateway</p>
                          <p className="text-sm text-gray-600">QRIS, Transfer Bank, E-Wallet, Kartu Kredit</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center">
                        <CheckCircle size={16} className="text-white" />
                      </div>
                    </div>
                  </button>
                </div>

                <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
                  <div className="flex items-center gap-3">
                    <Shield className="text-green-600" size={24} />
                    <div>
                      <p className="font-bold text-green-900 text-sm">Pembayaran Aman</p>
                      <p className="text-xs text-green-700">Transaksi dilindungi oleh Midtrans</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full bg-gradient-to-r from-blue-900 to-slate-900 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition text-lg flex items-center justify-center gap-3 ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Memproses Pembayaran...
                    </>
                  ) : (
                    `Bayar Sekarang - ${formatPrice(total)}`
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 sticky top-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img 
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-600">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                      <p className="font-bold text-amber-600 mt-1">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkir</span>
                  <span className="font-semibold text-gray-900">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-2">
                    NFT Certificate
                    <Award size={14} className="text-purple-600" />
                  </span>
                  <span className="font-semibold text-green-600">GRATIS</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-amber-600 text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <ShoppingBag className="inline w-4 h-4 mr-1" />
                  Batik akan diproses oleh pengrajin dalam <span className="font-bold">7-14 hari kerja</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;