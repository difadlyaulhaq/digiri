// pages/orders.tsx - dengan status pembayaran Midtrans
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  ShoppingBag, MapPin, Clock, CheckCircle, Truck, Package, 
  AlertCircle, CreditCard, Wallet, QrCode, CreditCardIcon, Smartphone 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getOrdersByGuestId } from '@/utils/orderUtils';
import { Order } from '@/utils/orderUtils';

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setError(null);
        const guestId = localStorage.getItem('guestId');
        if (guestId) {
          const userOrders = await getOrdersByGuestId(guestId);
          setOrders(userOrders);
        } else {
          setError('Guest ID tidak ditemukan. Silakan tambahkan produk ke keranjang terlebih dahulu.');
        }
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Gagal memuat pesanan. Silakan refresh halaman atau coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'processing':
        return <Package className="text-amber-600" size={20} />;
      case 'shipped':
        return <Truck className="text-blue-600" size={20} />;
      case 'delivered':
        return <CheckCircle className="text-green-600" size={20} />;
      default:
        return <Clock className="text-gray-600" size={20} />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'paid': return 'Pembayaran Berhasil';
      case 'processing': return 'Sedang Diproses Pengrajin';
      case 'shipped': return 'Sedang Dikirim';
      case 'delivered': return 'Terkirim';
      case 'cancelled': return 'Dibatalkan';
      default: return 'Menunggu Pembayaran';
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return <CreditCard size={16} />;
    
    switch (method.toLowerCase()) {
      case 'gopay':
        return <Wallet className="text-green-600" size={16} />;
      case 'qris':
        return <QrCode className="text-purple-600" size={16} />;
      case 'bank_transfer':
      case 'bca':
      case 'bni':
      case 'bri':
      case 'mandiri':
        return <CreditCardIcon className="text-blue-600" size={16} />;
      case 'credit_card':
        return <CreditCard className="text-orange-600" size={16} />;
      case 'shopeepay':
      case 'dana':
      case 'ovo':
        return <Smartphone className="text-pink-600" size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  const getPaymentMethodText = (method?: string) => {
    if (!method) return 'Midtrans';
    
    switch (method.toLowerCase()) {
      case 'gopay': return 'GoPay';
      case 'qris': return 'QRIS';
      case 'bank_transfer': return 'Transfer Bank';
      case 'bca': return 'BCA Transfer';
      case 'bni': return 'BNI Transfer';
      case 'bri': return 'BRI Transfer';
      case 'mandiri': return 'Mandiri Transfer';
      case 'credit_card': return 'Kartu Kredit';
      case 'shopeepay': return 'ShopeePay';
      case 'dana': return 'DANA';
      case 'ovo': return 'OVO';
      default: return method;
    }
  };

  const getPaymentStatus = (order: Order) => {
    // Jika order status adalah 'paid', anggap pembayaran berhasil
    if (order.status === 'paid') {
      return { status: 'success', text: 'Berhasil', color: 'text-green-600' };
    }
    
    // Jika ada paymentStatus dari Midtrans
    if (order.paymentStatus) {
      switch (order.paymentStatus) {
        case 'settlement':
          return { status: 'success', text: 'Berhasil', color: 'text-green-600' };
        case 'pending':
          return { status: 'pending', text: 'Menunggu', color: 'text-yellow-600' };
        case 'capture':
          return { status: 'success', text: 'Terkonfirmasi', color: 'text-green-600' };
        case 'deny':
          return { status: 'failed', text: 'Ditolak', color: 'text-red-600' };
        case 'cancel':
          return { status: 'failed', text: 'Dibatalkan', color: 'text-red-600' };
        case 'expire':
          return { status: 'failed', text: 'Kadaluarsa', color: 'text-red-600' };
        case 'failure':
          return { status: 'failed', text: 'Gagal', color: 'text-red-600' };
        default:
          return { status: 'pending', text: 'Menunggu', color: 'text-yellow-600' };
      }
    }
    
    // Default berdasarkan order status
    return { status: 'pending', text: 'Menunggu', color: 'text-yellow-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
            <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold text-red-800 mb-2">Terjadi Kesalahan</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition"
              >
                Refresh Halaman
              </button>
              <button 
                onClick={() => router.push('/produk')}
                className="bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition"
              >
                Belanja Sekarang
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-3xl font-bold text-stone-800 mb-8">Riwayat Pesanan</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={64} className="text-stone-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Belum Ada Pesanan</h2>
            <p className="text-stone-600 mb-6">Yuk, temukan batik cantik untuk koleksimu!</p>
            <button 
              onClick={() => router.push('/produk')}
              className="bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition"
            >
              Jelajahi Katalog
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const paymentStatus = getPaymentStatus(order);
              
              return (
                <div key={order.orderId} className="bg-white rounded-3xl shadow-lg p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <h3 className="font-bold text-stone-800 text-lg">
                        Order ID: {order.orderId}
                      </h3>
                      <p className="text-stone-600 text-sm">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      {getStatusIcon(order.status)}
                      <span className={`font-semibold ${
                        order.status === 'paid' || order.status === 'delivered' 
                          ? 'text-green-600' 
                          : order.status === 'processing' 
                          ? 'text-amber-600'
                          : order.status === 'shipped'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-stone-800 mb-2">Informasi Pembayaran</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-600">Status:</span>
                        <span className={`font-semibold ${paymentStatus.color}`}>
                          {paymentStatus.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-600">Metode:</span>
                        <div className="flex items-center gap-1">
                          {getPaymentMethodIcon(order.paymentMethod)}
                          <span className="font-semibold">
                            {getPaymentMethodText(order.paymentMethod)}
                          </span>
                        </div>
                      </div>
                      {order.paymentMethod && (
                        <div className="flex items-center gap-2">
                          <span className="text-stone-600">Provider:</span>
                          <span className="font-semibold">Midtrans</span>
                        </div>
                      )}
                      {order.transactionId && (
                        <div className="flex items-center gap-2">
                          <span className="text-stone-600">ID Transaksi:</span>
                          <span className="font-mono text-xs">{order.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-stone-200 pt-4 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4 mb-4 last:mb-0">
                        <img 
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-stone-800">{item.name}</h4>
                          <p className="text-sm text-stone-600">
                            {item.size} • {item.color} • Qty: {item.quantity}
                          </p>
                          <p className="font-bold text-amber-700 mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-stone-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-stone-600">Subtotal</span>
                      <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-stone-600">Ongkos Kirim</span>
                      <span className="font-semibold">{formatPrice(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-stone-600">NFT Certificate</span>
                      <span className="font-semibold text-green-600">GRATIS</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-stone-200 pt-2">
                      <span className="font-bold text-stone-800">Total</span>
                      <span className="font-bold text-amber-700 text-lg">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t border-stone-200 pt-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-stone-600" />
                      <h4 className="font-semibold text-stone-800">Alamat Pengiriman</h4>
                    </div>
                    <p className="text-stone-600 text-sm">
                      {order.shippingAddress.name}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}<br />
                      Telp: {order.shippingAddress.phone}
                    </p>
                  </div>

                  {/* NFT Info */}
                  {order.nftTransactionHash && (
                    <div className="border-t border-stone-200 pt-4 mt-4">
                      <h4 className="font-semibold text-stone-800 mb-2">NFT Certificate</h4>
                      <p className="text-sm text-stone-600 mb-1">Transaction Hash:</p>
                      <p className="font-mono text-xs text-purple-600 break-all">
                        {order.nftTransactionHash}
                      </p>
                    </div>
                  )}

                  {/* Estimated Delivery */}
                  {order.estimatedDelivery && (
                    <div className="border-t border-stone-200 pt-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-stone-600" />
                        <span className="text-sm text-stone-600">
                          Estimasi Pengiriman: {formatDate(order.estimatedDelivery)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {paymentStatus.status === 'pending' && (
                    <div className="border-t border-stone-200 pt-4 mt-4">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => window.location.reload()}
                          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition text-sm"
                        >
                          Periksa Status
                        </button>
                        <button 
                          onClick={() => router.push('/checkout')}
                          className="bg-white text-amber-600 border border-amber-600 px-4 py-2 rounded-lg hover:bg-amber-50 transition text-sm"
                        >
                          Bayar Sekarang
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default OrdersPage;