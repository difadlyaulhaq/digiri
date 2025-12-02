// utils/orderUtils.ts - FIXED: REMOVED ALL LIMITS
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
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
  
  nftTransactionHash?: string;
  nftStatus?: 'pending' | 'minted' | 'failed';
  nftMintedAt?: string;
  nftIds?: string[];
  
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'settlement' | 'capture' | 'deny' | 'cancel' | 'expire' | 'failure';
  transactionId?: string;
  
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GRLYO-${timestamp}-${random}`;
};

const cleanFirebaseData = (data: any): any => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

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

    if (nftTransactionHash) orderData.nftTransactionHash = nftTransactionHash;
    if (paymentMethod) orderData.paymentMethod = paymentMethod;
    if (paymentStatus) orderData.paymentStatus = paymentStatus;
    if (transactionId) orderData.transactionId = transactionId;

    const cleanedOrderData = cleanFirebaseData(orderData);

    console.log('💾 Menyimpan order ke Firebase:', {
      orderId,
      status: orderData.status,
      itemsCount: items.length,
      total: total
    });

    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, cleanedOrderData);
    saveOrderToLocalStorage(cleanedOrderData as Order);

    return cleanedOrderData as Order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Gagal membuat pesanan');
  }
};

// ✅ FIXED: Menghapus semua limit, ambil SEMUA orders
export const getOrdersByGuestId = async (guestId: string): Promise<Order[]> => {
  try {
    console.log('🔍 Mencari SEMUA orders untuk guestId:', guestId);
    
    const ordersRef = collection(db, 'orders');
    
    // Query tanpa limit - ambil semua data
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
    
    // Sort manual di client
    const sortedOrders = orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    console.log(`✅ Ditemukan SEMUA ${sortedOrders.length} orders (NO LIMIT)`);
    return sortedOrders;
    
  } catch (error) {
    console.error('❌ Error getting orders:', error);
    
    if (typeof window !== 'undefined') {
      try {
        const ordersJson = localStorage.getItem('orders');
        if (ordersJson) {
          const allOrders: Order[] = JSON.parse(ordersJson);
          const userOrders = allOrders
            .filter(order => order.guestId === guestId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          console.log(`📦 Fallback: Ditemukan SEMUA ${userOrders.length} orders dari localStorage (NO LIMIT)`);
          return userOrders;
        }
      } catch (localStorageError) {
        console.error('Error accessing localStorage:', localStorageError);
      }
    }
    
    return [];
  }
};

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

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updateData = cleanFirebaseData({
      status,
      updatedAt: new Date().toISOString()
    });

    await updateDoc(orderRef, updateData);

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
    
    const updateData: any = {
      nftStatus,
      updatedAt: new Date().toISOString()
    };

    if (nftIds) updateData.nftIds = nftIds;
    if (nftTransactionHash) updateData.nftTransactionHash = nftTransactionHash;
    if (nftStatus === 'minted') updateData.nftMintedAt = new Date().toISOString();

    const cleanedUpdateData = cleanFirebaseData(updateData);

    await updateDoc(orderRef, cleanedUpdateData);

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