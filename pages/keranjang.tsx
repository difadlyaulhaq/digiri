// pages/keranjang.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCartItems, updateCartItemQuantity, removeFromCart } from '@/utils/cartUtils';
import { Analytics } from "@vercel/analytics/next"

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

const KeranjangPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart items from cartUtils
  useEffect(() => {
    const loadCartItems = async () => {
      const items = await getCartItems();
      setCartItems(items);
    };

    loadCartItems();
  }, []);

  // Update fungsi-fungsi lainnya
  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = await updateCartItemQuantity(id, newQuantity);
    setCartItems(updatedItems);
  };

  const removeItem = async (id: number) => {
    const updatedItems = await removeFromCart(id);
    setCartItems(updatedItems);
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert('Keranjang belanja kosong');
      return;
    }
    router.push('/checkoutpage');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 25000;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-white">
      <Analytics/>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/produk">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition">
              <ArrowLeft size={20} />
              Kembali ke Belanja
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={64} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Keranjang Kosong</h2>
            <p className="text-gray-600 mb-6">Yuk, temukan batik cantik untuk koleksimu!</p>
            <Link href="/produk">
              <button className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition">
                Jelajahi Katalog
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Item dalam Keranjang ({cartItems.length})
                </h2>
                
                <div className="space-y-6">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-200 last:border-b-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                      
                      <div className="flex-1">
                        <Link href={`/produk/${item.slug}`}>
                          <h3 className="font-bold text-gray-900 hover:text-blue-900 transition cursor-pointer">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.size} • {item.color}
                        </p>
                        <p className="font-bold text-amber-600 mt-2">
                          {formatPrice(item.price)}
                        </p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-semibold w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 transition flex items-center gap-2"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-8 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Ringkasan Belanja</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkos Kirim</span>
                    <span className="font-semibold text-gray-900">{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      NFT Certificate
                      <Award size={14} className="text-purple-600" />
                    </span>
                    <span className="font-semibold text-green-600">GRATIS</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-amber-600 text-xl">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={proceedToCheckout}
                    className="w-full bg-blue-900 text-white py-4 rounded-full font-bold hover:bg-blue-800 transition text-lg"
                  >
                    Lanjut ke Checkout
                  </button>
                  
                  <Link href="/produk">
                    <button className="w-full bg-white text-blue-900 border-2 border-blue-900 py-4 rounded-full font-bold hover:bg-blue-50 transition">
                      Lanjutkan Belanja
                    </button>
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    🎁 Setiap pembelian batik dilengkapi dengan NFT Certificate sebagai bukti keaslian digital
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default KeranjangPage;