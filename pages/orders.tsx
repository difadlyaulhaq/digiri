// pages/orders.tsx - dengan status pembayaran Midtrans
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  ShoppingBag, MapPin, Clock, CheckCircle, Truck, Package, 
  AlertCircle, CreditCard, Wallet, QrCode, CreditCardIcon, Smartphone,
  RotateCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getOrdersByGuestId } from '@/utils/orderUtils';
import { Order } from '@/utils/orderUtils';
import { Analytics } from "@vercel/analytics/next"

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setError(null);
      setLoading(true);
      const guestId = localStorage.getItem('guestId');
      if (guestId) {
        const userOrders = await getOrdersByGuestId(guestId);
        // Sort orders by date (newest first)
        const sortedOrders = userOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
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

  useEffect(() => {
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
        return <Package className="text-amber-500" size={20} />;
      case 'shipped':
        return <Truck className="text-blue-600" size={20} />;
      case 'delivered':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'cancelled':
        return <AlertCircle className="text-red-600" size={20} />;
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

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'text-green-600';
      case 'processing':
        return 'text-amber-500';
      case 'shipped':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPaymentMethodIcon = (method?: string) => {
    if (!method) return <CreditCard size={16} />;
    
    const methodLower = method.toLowerCase();
    switch (methodLower) {
      case 'gopay':
        return <Wallet className="text-green-600" size={16} />;
      case 'qris':
        return <QrCode className="text-purple-600" size={16} />;
      case 'bank_transfer':
      case 'bca':
      case 'bni':
      case 'bri':
      case 'mandiri':
        return <CreditCardIcon className="text-blue-900" size={16} />;
      case 'credit_card':
        return <CreditCard className="text-amber-500" size={16} />;
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
    
    const methodLower = method.toLowerCase();
    switch (methodLower) {
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
    // Prioritize paymentStatus from Midtrans
    if (order.paymentStatus) {
      switch (order.paymentStatus) {
        case 'settlement':
        case 'capture':
          return { status: 'success', text: 'Berhasil', color: 'text-green-600' };
        case 'pending':
          return { status: 'pending', text: 'Menunggu Pembayaran', color: 'text-amber-500' };
        case 'deny':
          return { status: 'failed', text: 'Ditolak', color: 'text-red-600' };
        case 'cancel':
          return { status: 'failed', text: 'Dibatalkan', color: 'text-red-600' };
        case 'expire':
          return { status: 'failed', text: 'Kadaluarsa', color: 'text-red-600' };
        case 'failure':
          return { status: 'failed', text: 'Gagal', color: 'text-red-600' };
        default:
          return { status: 'pending', text: 'Menunggu Pembayaran', color: 'text-amber-500' };
      }
    }
    
    // Fallback to order status
    if (order.status === 'paid') {
      return { status: 'success', text: 'Berhasil', color: 'text-green-600' };
    }
    
    return { status: 'pending', text: 'Menunggu Pembayaran', color: 'text-amber-500' };
  };

  const shouldShowPayButton = (order: Order) => {
    const paymentStatus = getPaymentStatus(order);
    return paymentStatus.status === 'pending' || paymentStatus.status === 'failed';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <Analytics />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-6 text-center">
            <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold text-red-800 mb-2">Terjadi Kesalahan</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition"
              >
                Refresh Halaman
              </button>
              <button 
                onClick={() => router.push('/produk')}
                className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition"
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
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-full hover:bg-blue-800 transition disabled:opacity-50"
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={64} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Belum Ada Pesanan</h2>
            <p className="text-gray-600 mb-6">Yuk, temukan batik cantik untuk koleksimu!</p>
            <button 
              onClick={() => router.push('/produk')}
              className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition"
            >
              Jelajahi Katalog
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const paymentStatus = getPaymentStatus(order);
              const showPayButton = shouldShowPayButton(order);
              
              return (
                <div key={order.orderId} className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        Order ID: {order.orderId}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      {getStatusIcon(order.status)}
                      <span className={`font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Informasi Pembayaran</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-semibold ${paymentStatus.color}`}>
                          {paymentStatus.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Metode:</span>
                        <div className="flex items-center gap-1">
                          {getPaymentMethodIcon(order.paymentMethod)}
                          <span className="font-semibold">
                            {getPaymentMethodText(order.paymentMethod)}
                          </span>
                        </div>
                      </div>
                      {order.paymentMethod && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Provider:</span>
                          <span className="font-semibold">Midtrans</span>
                        </div>
                      )}
                      {order.transactionId && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">ID Transaksi:</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {order.transactionId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4 mb-4 last:mb-0">
                        <img 
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
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

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Ongkos Kirim</span>
                      <span className="font-semibold">{formatPrice(order.shipping)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">NFT Certificate</span>
                      <span className="font-semibold text-green-600">GRATIS</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-amber-600 text-lg">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-gray-600" />
                      <h4 className="font-semibold text-gray-900">Alamat Pengiriman</h4>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {order.shippingAddress.name}<br />
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}<br />
                      Telp: {order.shippingAddress.phone}
                    </p>
                  </div>

                  {/* NFT Info */}
                  {order.nftTransactionHash && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">NFT Certificate</h4>
                      <p className="text-sm text-gray-600 mb-1">Transaction Hash:</p>
                      <p className="font-mono text-xs text-purple-600 break-all bg-purple-50 p-2 rounded border border-purple-100">
                        {order.nftTransactionHash}
                      </p>
                    </div>
                  )}

                  {/* Estimated Delivery */}
                  {order.estimatedDelivery && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-600" />
                        <span className="text-sm text-gray-600">
                          Estimasi Pengiriman: {formatDate(order.estimatedDelivery)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {showPayButton && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex gap-3 flex-wrap">
                        <button 
                          onClick={loadOrders}
                          className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm flex items-center gap-2"
                        >
                          <RotateCw size={14} />
                          Periksa Status
                        </button>
                        <button 
                          onClick={() => router.push('/checkoutpage')}
                          className="bg-white text-blue-900 border border-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm"
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