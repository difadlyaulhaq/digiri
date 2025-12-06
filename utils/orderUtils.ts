// utils/orderUtils.ts - VERSI DIPERBAIKI LENGKAP
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  writeBatch,
  limit,
  startAfter
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
  addedAt?: string;
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
  midtransOrderId?: string;
  paidAt?: string;
  
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

// Helper untuk generate order ID yang konsisten
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GRLYO-${timestamp}-${random}`;
};

// Helper untuk membersihkan data Firebase
const cleanFirebaseData = (data: any): any => {
  const cleaned = { ...data };
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined || cleaned[key] === null) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

// **FUNGSI BARU: Buat order sebelum pembayaran** 
export const createOrderBeforePayment = async (
  cartItems: OrderItem[],
  shippingAddress: Order['shippingAddress'],
  subtotal: number,
  shipping: number,
  nftFee: number,
  total: number
): Promise<{ orderId: string; orderData: Order; success: boolean }> => {
  try {
    const guestId = typeof window !== 'undefined' 
      ? localStorage.getItem('guestId') || 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      : 'unknown';
    
    // Generate order ID yang akan digunakan di Midtrans
    const orderId = generateOrderId();
    
    // Simpan guestId ke localStorage jika belum ada
    if (typeof window !== 'undefined' && !localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', guestId);
    }
    
    const orderData: Order = {
      orderId,
      guestId,
      items: cartItems,
      shippingAddress,
      status: 'pending',
      subtotal,
      shipping,
      nftFee,
      total,
      paymentMethod: 'midtrans',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('💾 [PREPAYMENT] Menyimpan order ke Firebase:', {
      orderId,
      total: total,
      items: cartItems.length,
      guestId
    });

    // Simpan ke Firebase dengan batch write untuk keamanan
    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, cleanFirebaseData(orderData));
    
    console.log('✅ [PREPAYMENT] Order berhasil disimpan di Firebase');
    
    // Simpan ke localStorage sebagai backup
    saveOrderToLocalStorage(orderData);
    
    return {
      orderId,
      orderData,
      success: true
    };
  } catch (error) {
    console.error('❌ [PREPAYMENT] Error creating order:', error);
    return {
      orderId: '',
      orderData: {} as Order,
      success: false
    };
  }
};

// **FUNGSI BARU: Update order setelah pembayaran berhasil**
export const updateOrderAfterPayment = async (
  orderId: string,
  transactionId: string,
  paymentStatus: string,
  paymentMethod?: string
): Promise<boolean> => {
  try {
    console.log('🔄 [POSTPAYMENT] Memperbarui order:', {
      orderId,
      transactionId,
      paymentStatus
    });

    const orderRef = doc(db, 'orders', orderId);
    
    // Cek apakah order ada
    const orderSnapshot = await getDoc(orderRef);
    if (!orderSnapshot.exists()) {
      console.error('❌ Order tidak ditemukan di Firebase:', orderId);
      
      // Coba cari di localStorage
      if (typeof window !== 'undefined') {
        const ordersJson = localStorage.getItem('orders');
        if (ordersJson) {
          const orders: Order[] = JSON.parse(ordersJson);
          const localOrder = orders.find(o => o.orderId === orderId);
          if (localOrder) {
            console.log('📦 Order ditemukan di localStorage, mencoba sync ke Firebase');
            // Coba sync ke Firebase
            await setDoc(orderRef, cleanFirebaseData(localOrder));
          }
        }
      }
    }

    // Update status pembayaran
    const updateData: any = {
      status: paymentStatus === 'settlement' || paymentStatus === 'capture' ? 'paid' : 'pending',
      paymentStatus,
      transactionId,
      updatedAt: new Date().toISOString()
    };

    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    if (paymentStatus === 'settlement' || paymentStatus === 'capture') {
      updateData.paidAt = new Date().toISOString();
    }

    await updateDoc(orderRef, cleanFirebaseData(updateData));
    
    console.log('✅ [POSTPAYMENT] Order berhasil diperbarui');
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        const orders: Order[] = JSON.parse(ordersJson);
        const updatedOrders = orders.map(order => {
          if (order.orderId === orderId) {
            return { ...order, ...updateData };
          }
          return order;
        });
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
    }

    return true;
  } catch (error) {
    console.error('❌ [POSTPAYMENT] Error updating order:', error);
    return false;
  }
};

// **PERBAIKAN: getOrdersByGuestId dengan query yang aman**
export const getOrdersByGuestId = async (guestId: string): Promise<Order[]> => {
  try {
    console.log('🔍 Mencari orders untuk guestId:', guestId);
    
    // Query sederhana tanpa orderBy untuk menghindari index error
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('guestId', '==', guestId));
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        ...data,
        items: data.items || [],
        shippingAddress: data.shippingAddress || {},
        nftIds: data.nftIds || [],
      } as Order);
    });
    
    // Sort secara manual di client side
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`✅ Ditemukan ${orders.length} orders`);
    return orders;
  } catch (error: any) {
    console.error('Error getting orders:', error);
    
    // Fallback ke localStorage
    if (typeof window !== 'undefined') {
      try {
        const ordersJson = localStorage.getItem('orders');
        if (ordersJson) {
          const allOrders: Order[] = JSON.parse(ordersJson);
          const userOrders = allOrders
            .filter(order => order.guestId === guestId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          return userOrders;
        }
      } catch (localStorageError) {
        console.error('Error accessing localStorage:', localStorageError);
      }
    }
    
    return [];
  }
};

// **FUNGSI BARU: Get All Orders (untuk verify certificate)**
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    console.log('🔍 Mengambil semua orders...');
    
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef);
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        ...data,
        items: data.items || [],
        shippingAddress: data.shippingAddress || {},
        nftIds: data.nftIds || [],
      } as Order);
    });
    
    console.log(`✅ Ditemukan ${orders.length} orders total`);
    return orders;
  } catch (error: any) {
    console.error('Error getting all orders:', error);
    
    // Fallback ke localStorage
    if (typeof window !== 'undefined') {
      try {
        const ordersJson = localStorage.getItem('orders');
        if (ordersJson) {
          const allOrders: Order[] = JSON.parse(ordersJson);
          return allOrders;
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
    console.log('🔍 Mencari order:', orderId);
    
    const orderRef = doc(db, 'orders', orderId);
    const orderSnapshot = await getDoc(orderRef);
    
    if (orderSnapshot.exists()) {
      const data = orderSnapshot.data();
      const orderData: Order = {
        ...data,
        items: data.items || [],
        shippingAddress: data.shippingAddress || {},
        nftIds: data.nftIds || [],
      } as Order;
      
      console.log('✅ Order ditemukan di Firebase');
      return orderData;
    }
    
    console.log('📦 Order tidak ditemukan di Firebase, cek localStorage');
    
    // Fallback ke localStorage
    if (typeof window !== 'undefined') {
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        const orders: Order[] = JSON.parse(ordersJson);
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
          console.log('✅ Order ditemukan di localStorage');
          return order;
        }
      }
    }
    
    console.log('❌ Order tidak ditemukan di mana pun');
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    return null;
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date().toISOString()
    });
    
    // Update localStorage
    saveOrderToLocalStorage({ orderId, status } as Order);
    
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

export const updateNFTStatus = async (
  orderId: string, 
  nftStatus: 'pending' | 'minted' | 'failed', 
  nftIds?: string[], 
  nftTransactionHash?: string,
  nftMintedAt?: string
): Promise<boolean> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    
    const updateData: any = {
      nftStatus,
      updatedAt: new Date().toISOString()
    };

    if (nftIds) updateData.nftIds = nftIds;
    if (nftTransactionHash) updateData.nftTransactionHash = nftTransactionHash;
    if (nftStatus === 'minted') {
      updateData.nftMintedAt = nftMintedAt || new Date().toISOString();
    }

    console.log('📝 Updating NFT status in database:', {
      orderId,
      nftStatus,
      nftIds,
      nftTransactionHash: nftTransactionHash?.substring(0, 20) + '...'
    });

    await updateDoc(orderRef, cleanFirebaseData(updateData));
    
    console.log('✅ NFT status updated successfully');
    
    // Update localStorage
    saveOrderToLocalStorage({ orderId, ...updateData } as Order);
    
    return true;
  } catch (error) {
    console.error('Error updating NFT status:', error);
    return false;
  }
};

export const saveOrderToLocalStorage = (order: Partial<Order>): void => {
  if (typeof window !== 'undefined' && order.orderId) {
    const existingOrdersJson = localStorage.getItem('orders');
    const existingOrders: Order[] = existingOrdersJson ? JSON.parse(existingOrdersJson) : [];
    
    const existingIndex = existingOrders.findIndex(o => o.orderId === order.orderId);
    
    if (existingIndex >= 0) {
      // Update existing order
      existingOrders[existingIndex] = { ...existingOrders[existingIndex], ...order };
    } else {
      // Add new order
      existingOrders.push(order as Order);
    }
    
    localStorage.setItem('orders', JSON.stringify(existingOrders));
  }
};

// **FUNGSI BARU: Verifikasi dan sync order**
export const verifyAndSyncOrder = async (orderId: string): Promise<{ exists: boolean; synced: boolean; order?: Order }> => {
  try {
    // Cek di Firebase
    const firebaseOrder = await getOrderById(orderId);
    
    if (firebaseOrder) {
      return { exists: true, synced: true, order: firebaseOrder };
    }
    
    // Cek di localStorage
    if (typeof window !== 'undefined') {
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        const orders: Order[] = JSON.parse(ordersJson);
        const localOrder = orders.find(o => o.orderId === orderId);
        
        if (localOrder) {
          // Coba sync ke Firebase
          const orderRef = doc(db, 'orders', orderId);
          await setDoc(orderRef, cleanFirebaseData(localOrder));
          
          return { exists: true, synced: true, order: localOrder };
        }
      }
    }
    
    return { exists: false, synced: false };
  } catch (error) {
    console.error('Error verifying order:', error);
    return { exists: false, synced: false };
  }
};

// **FUNGSI BARU: Update status multiple orders**
export const updateMultipleOrderStatuses = async (updates: Array<{ orderId: string; status: Order['status']; transactionId?: string }>): Promise<boolean> => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(update => {
      const orderRef = doc(db, 'orders', update.orderId);
      const updateData: any = {
        status: update.status,
        updatedAt: new Date().toISOString()
      };
      
      if (update.status === 'paid') {
        updateData.paymentStatus = 'settlement';
        updateData.paidAt = new Date().toISOString();
      }
      
      if (update.transactionId) {
        updateData.transactionId = update.transactionId;
      }
      
      batch.update(orderRef, cleanFirebaseData(updateData));
    });
    
    await batch.commit();
    
    console.log(`✅ Updated ${updates.length} orders`);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      const ordersJson = localStorage.getItem('orders');
      if (ordersJson) {
        const orders: Order[] = JSON.parse(ordersJson);
        const updatedOrders = orders.map(order => {
          const update = updates.find(u => u.orderId === order.orderId);
          if (update) {
            return { ...order, status: update.status };
          }
          return order;
        });
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating multiple orders:', error);
    return false;
  }
};

// **FUNGSI BARU: Search orders by various criteria**
export const searchOrders = async (criteria: {
  nftId?: string;
  transactionHash?: string;
  orderId?: string;
  customerEmail?: string;
}): Promise<Order[]> => {
  try {
    console.log('🔍 Searching orders with criteria:', criteria);
    
    const allOrders = await getAllOrders();
    let filteredOrders = [...allOrders];
    
    // Filter berdasarkan criteria
    if (criteria.nftId) {
      filteredOrders = filteredOrders.filter(order => 
        order.nftIds && order.nftIds.some(id => 
          id.toLowerCase().includes(criteria.nftId!.toLowerCase())
        )
      );
    }
    
    if (criteria.transactionHash) {
      filteredOrders = filteredOrders.filter(order => 
        order.nftTransactionHash && 
        order.nftTransactionHash.toLowerCase().includes(criteria.transactionHash!.toLowerCase())
      );
    }
    
    if (criteria.orderId) {
      filteredOrders = filteredOrders.filter(order => 
        order.orderId.toLowerCase().includes(criteria.orderId!.toLowerCase())
      );
    }
    
    if (criteria.customerEmail) {
      filteredOrders = filteredOrders.filter(order => 
        order.shippingAddress.email?.toLowerCase().includes(criteria.customerEmail!.toLowerCase())
      );
    }
    
    console.log(`✅ Found ${filteredOrders.length} orders matching criteria`);
    return filteredOrders;
  } catch (error) {
    console.error('Error searching orders:', error);
    return [];
  }
};