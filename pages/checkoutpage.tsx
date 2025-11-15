import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ShoppingBag, MapPin, User, Mail, Phone, CreditCard, Shield, Award, CheckCircle, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCartItems, clearCart } from '@/utils/cartUtils';

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
  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success
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

  // Load cart items from cartUtils
  useEffect(() => {
    const loadCartItems = async () => {
      const items = await getCartItems();
      if (items.length === 0) {
        // If no cart items, redirect to cart page
        router.push('/keranjang');
      } else {
        setCartItems(items);
      }
    };

    loadCartItems();
  }, [router]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 25000;
  const nftFee = 0; // Free NFT
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
    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert('Mohon lengkapi semua data yang diperlukan');
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    // Simulate Midtrans Snap payment
    alert('Opening Midtrans Payment Gateway...\n\nIn production, this will trigger:\n- POST /payment/initiate\n- Get snap_token\n- window.snap.pay(snap_token)');
    
    // Simulate success
    setTimeout(async () => {
      setStep(3);
      // Clear cart after successful payment using cartUtils
      await clearCart();
    }, 2000);
  };

  const handleShopAgain = () => {
    router.push('/produk');
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 lg:p-12 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-stone-800 mb-4">
            Pembayaran Berhasil! 🎉
          </h1>
          
          <p className="text-lg text-stone-600 mb-8">
            Terima kasih atas pembelian Anda. Pesanan sedang diproses oleh pengrajin kami.
          </p>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border border-purple-200">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles className="text-purple-600" size={32} />
              <h3 className="text-xl font-bold text-stone-800">NFT Certificate Minted!</h3>
            </div>
            <p className="text-stone-600 mb-4">
              NFT digital Anda telah di-mint dan akan dikirim ke email dalam 5-10 menit.
            </p>
            <div className="bg-white rounded-xl p-4">
              <p className="text-sm text-stone-600 mb-1">Transaction Hash:</p>
              <p className="font-mono text-xs text-purple-600 break-all">
                0x742d35Cc6634C0532925a3b844Bc9e7595f0bEB5
              </p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-stone-800 mb-3">Detail Pesanan</h3>
            <div className="space-y-2 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-semibold text-stone-800">GRLYO-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-semibold text-stone-800">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Pembayaran:</span>
                <span className="font-bold text-amber-700 text-lg">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 flex-col sm:flex-row">
            <button 
              onClick={handleShopAgain}
              className="flex-1 bg-white text-amber-800 border-2 border-amber-800 px-6 py-3 rounded-full font-bold hover:bg-amber-50 transition"
            >
              Belanja Lagi
            </button>
            <button className="flex-1 bg-gradient-to-r from-amber-800 to-amber-900 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition">
              Lacak Pesanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <ShoppingBag size={64} className="text-stone-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-800 mb-4">Keranjang Kosong</h2>
          <p className="text-stone-600 mb-6">Silakan tambahkan produk ke keranjang terlebih dahulu.</p>
          <button 
            onClick={() => router.push('/produk')}
            className="bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition"
          >
            Jelajahi Produk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-stone-800">Checkout</h1>
            <div className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'} font-bold text-sm`}>
                1
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-amber-600' : 'bg-stone-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'} font-bold text-sm`}>
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
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-6">Informasi Pengiriman</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      <User className="inline w-4 h-4 mr-2" />
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-600 focus:outline-none transition"
                      placeholder="Masukkan nama lengkap"
                      required
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
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-600 focus:outline-none transition"
                        placeholder="email@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">
                        <Phone className="inline w-4 h-4 mr-2" />
                        No. Telepon *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-600 focus:outline-none transition"
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-2" />
                      Alamat Lengkap *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-600 focus:outline-none transition resize-none"
                      placeholder="Jalan, No. Rumah, RT/RW, Kelurahan"
                      required
                    ></textarea>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Kota *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-600 focus:outline-none transition"
                        placeholder="Kota"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Provinsi *</label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-600 focus:outline-none transition"
                        placeholder="Provinsi"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-2">Kode Pos</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-600 focus:outline-none transition"
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Catatan (Opsional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-amber-600 focus:outline-none transition resize-none"
                      placeholder="Catatan untuk pengrajin..."
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <Award className="text-purple-600 shrink-0" size={24} />
                  <p className="text-sm text-stone-700">
                    <span className="font-bold text-purple-700">NFT Certificate</span> akan dikirim ke email Anda setelah pembayaran berhasil
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-amber-800 to-amber-900 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition text-lg"
                >
                  Lanjut ke Pembayaran
                </button>
              </form>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-6">Metode Pembayaran</h2>
                
                <div className="space-y-4 mb-8">
                  <button className="w-full p-6 border-2 border-amber-600 rounded-2xl hover:bg-amber-50 transition text-left bg-amber-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                          <CreditCard className="text-amber-700" size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-800">Midtrans Payment Gateway</p>
                          <p className="text-sm text-stone-600">QRIS, Transfer Bank, E-Wallet, Kartu Kredit</p>
                        </div>
                      </div>
                      <div className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center">
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
                  className="w-full bg-gradient-to-r from-amber-800 to-amber-900 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition text-lg"
                >
                  Bayar Sekarang - {formatPrice(total)}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 sticky top-8">
              <h2 className="text-xl font-bold text-stone-800 mb-6">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img 
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-stone-800 text-sm">{item.name}</h3>
                      <p className="text-xs text-stone-600">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                      <p className="font-bold text-amber-700 mt-1">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-semibold text-stone-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Ongkir</span>
                  <span className="font-semibold text-stone-800">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 flex items-center gap-2">
                    NFT Certificate
                    <Award size={14} className="text-purple-600" />
                  </span>
                  <span className="font-semibold text-green-600">GRATIS</span>
                </div>
                <div className="border-t border-stone-200 pt-3 flex justify-between">
                  <span className="font-bold text-stone-800">Total</span>
                  <span className="font-bold text-amber-700 text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-xl">
                <p className="text-xs text-stone-600 leading-relaxed">
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