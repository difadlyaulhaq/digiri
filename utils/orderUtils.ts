// utils/orderUtils.ts - DIPERBAIKI
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  slug: string;
}

export interface Order {
  orderId: string;
  guestId: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    notes: string;
  };
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping: number;
  nftFee: number;
  total: number;
  
  // NFT Related Fields
  nftTransactionHash?: string;
  nftStatus?: 'pending' | 'minted' | 'failed';
  nftMintedAt?: string;
  nftIds?: string[]; // Array of NFT IDs untuk multiple items
  
  // Payment Fields
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'settlement' | 'capture' | 'deny' | 'cancel' | 'expire' | 'failure';
  transactionId?: string;
  
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

// Generate order ID
const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GRLYO-${timestamp}-${random}`;
};

// Helper function untuk membersihkan data sebelum disimpan ke Firebase
const cleanFirebaseData = (data: any): any => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

// Create new order - DIPERBAIKI
export const createOrder = async (
  items: OrderItem[],
  shippingAddress: Order['shippingAddress'],
  subtotal: number,
  shipping: number,
  nftFee: number,
  total: number,
  nftTransactionHash?: string,
  paymentMethod?: string,
  paymentStatus?: string,
  transactionId?: string
): Promise<Order> => {
  try {
    const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') || 'unknown' : 'unknown';
    const orderId = generateOrderId();
    
    // Buat order object tanpa field undefined
    const orderData: any = {
      orderId,
      guestId,
      items,
      shippingAddress,
      status: paymentStatus === 'settlement' || paymentStatus === 'capture' ? 'paid' : 'pending',
      subtotal,
      shipping,
      nftFee,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Hanya tambahkan field jika ada nilainya
    if (nftTransactionHash) orderData.nftTransactionHash = nftTransactionHash;
    if (paymentMethod) orderData.paymentMethod = paymentMethod;
    if (paymentStatus) orderData.paymentStatus = paymentStatus;
    if (transactionId) orderData.transactionId = transactionId;

    // Bersihkan data sebelum disimpan
    const cleanedOrderData = cleanFirebaseData(orderData);

    console.log('💾 Menyimpan order ke Firebase:', {
      orderId,
      status: orderData.status,
      itemsCount: items.length,
      total: total
    });

    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, cleanedOrderData);

    // Juga simpan ke localStorage sebagai fallback
    saveOrderToLocalStorage(cleanedOrderData as Order);

    return cleanedOrderData as Order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Gagal membuat pesanan');
  }
};

// Get orders by guest ID - dengan improvement error handling
export const getOrdersByGuestId = async (guestId: string): Promise<Order[]> => {
  try {
    console.log('🔍 Mencari orders untuk guestId:', guestId);
    
    const ordersRef = collection(db, 'orders');
    
    // Coba query dengan cara yang lebih sederhana dulu
    const q = query(
      ordersRef, 
      where('guestId', '==', guestId)
    );
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      const orderData = doc.data() as Order;
      console.log('📦 Order ditemukan:', orderData.orderId);
      orders.push(orderData);
    });
    
    // Sort manually di client side untuk menghindari index issues
    const sortedOrders = orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`✅ Ditemukan ${sortedOrders.length} orders`);
    return sortedOrders;
    
  } catch (error) {
    console.error('❌ Error getting orders:', error);
    
    // Fallback ke localStorage untuk development
    if (typeof window !== 'undefined') {
      try {
        const ordersJson = localStorage.getItem('orders');
        if (ordersJson) {
          const allOrders: Order[] = JSON.parse(ordersJson);
          const userOrders = allOrders.filter(order => order.guestId === guestId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          console.log(`📦 Fallback: Ditemukan ${userOrders.length} orders dari localStorage`);
          return userOrders;
        }
      } catch (localStorageError) {
        console.error('Error accessing localStorage:', localStorageError);
      }
    }
    
    return [];
  }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnapshot = await getDoc(orderRef);
    
    if (orderSnapshot.exists()) {
      return orderSnapshot.data() as Order;
    }
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    
    // Fallback ke localStorage
    if (typeof window !== 'undefined') {
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        const orders: Order[] = JSON.parse(ordersJson);
        return orders.find(order => order.orderId === orderId) || null;
      }
    }
    
    return null;
  }
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData = cleanFirebaseData({
      status,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(orderRef, updateData);

    // Juga update di localStorage
    if (typeof window !== 'undefined') {
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        const orders: Order[] = JSON.parse(ordersJson);
        const updatedOrders = orders.map(order => 
          order.orderId === orderId ? { ...order, ...updateData } : order
        );
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

// Simpan order ke localStorage sebagai fallback (untuk development)
export const saveOrderToLocalStorage = (order: Order): void => {
  if (typeof window !== 'undefined') {
    const existingOrdersJson = localStorage.getItem('orders');
    const existingOrders: Order[] = existingOrdersJson ? JSON.parse(existingOrdersJson) : [];
    
    const updatedOrders = [...existingOrders.filter(o => o.orderId !== order.orderId), order];
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  }
};

export const updateNFTStatus = async (orderId: string, nftStatus: 'pending' | 'minted' | 'failed', nftIds?: string[], nftTransactionHash?: string): Promise<boolean> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    // Buat update data tanpa field undefined
    const updateData: any = {
      nftStatus,
      updatedAt: new Date().toISOString()
    };

    if (nftIds) updateData.nftIds = nftIds;
    if (nftTransactionHash) updateData.nftTransactionHash = nftTransactionHash;
    if (nftStatus === 'minted') updateData.nftMintedAt = new Date().toISOString();

    // Bersihkan data sebelum update
    const cleanedUpdateData = cleanFirebaseData(updateData);

    await updateDoc(orderRef, cleanedUpdateData);

    // Juga update di localStorage
    if (typeof window !== 'undefined') {
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        const orders: Order[] = JSON.parse(ordersJson);
        const updatedOrders = orders.map(order => 
          order.orderId === orderId ? { ...order, ...cleanedUpdateData } : order
        );
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating NFT status:', error);
    return false;
  }
};