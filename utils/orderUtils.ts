// utils/orderUtils.ts
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
  
  // Tambahan field untuk Midtrans
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

// Create new order
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
    const guestId = localStorage.getItem('guestId') || 'unknown';
    const orderId = generateOrderId();
    
    const order: Order = {
      orderId,
      guestId,
      items,
      shippingAddress,
      status: paymentStatus === 'settlement' || paymentStatus === 'capture' ? 'paid' : 'pending',
      subtotal,
      shipping,
      nftFee,
      total,
      nftTransactionHash,
      paymentMethod,
      paymentStatus: paymentStatus as any,
      transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };

    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, order);

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Gagal membuat pesanan');
  }
};

// Get orders by guest ID - dengan fallback jika index belum ready
export const getOrdersByGuestId = async (guestId: string): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    
    // Coba query dengan orderBy dulu
    try {
      const q = query(
        ordersRef, 
        where('guestId', '==', guestId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        orders.push(doc.data() as Order);
      });
      
      return orders;
    } catch (indexError) {
      console.warn('Index not ready, falling back to client-side sorting:', indexError);
      
      // Fallback: query tanpa orderBy, sort di client
      const q = query(ordersRef, where('guestId', '==', guestId));
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        orders.push(doc.data() as Order);
      });
      
      // Sort manually di client
      return orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  } catch (error) {
    console.error('Error getting orders:', error);
    
    // Fallback ke localStorage untuk development
    if (typeof window !== 'undefined') {
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        const allOrders: Order[] = JSON.parse(ordersJson);
        return allOrders.filter(order => order.guestId === guestId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date().toISOString()
    });
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