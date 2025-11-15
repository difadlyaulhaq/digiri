// utils/cartUtils.ts
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  slug: string;
}

// Helper function to get guest ID
const getGuestId = (): string => {
  let guestId = localStorage.getItem('guestId');
  
  if (!guestId) {
    // Generate unique guest ID
    guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestId', guestId);
    
    // Set expiration (optional: 30 days)
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    localStorage.setItem('guestExpiry', expiry.toISOString());
  }
  
  return guestId;
};

// Event system untuk update real-time cart count
const triggerCartUpdateEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('cartUpdated'));
  }
};

// Firebase Cart Functions
export const addToCart = async (product: CartItem, selectedSize: string, selectedColor: string): Promise<boolean> => {
  try {
    const guestId = getGuestId();
    const cartRef = doc(db, 'carts', guestId);
    
    const cartSnapshot = await getDoc(cartRef);
    const cartItem = {
      ...product,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
      addedAt: new Date().toISOString()
    };

    if (cartSnapshot.exists()) {
      // Update existing cart
      const cartData = cartSnapshot.data();
      const existingItemIndex = cartData.items.findIndex(
        (item: CartItem) => 
          item.id === product.id && 
          item.size === selectedSize && 
          item.color === selectedColor
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const updatedItems = [...cartData.items];
        updatedItems[existingItemIndex].quantity += 1;
        
        await updateDoc(cartRef, {
          items: updatedItems,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Add new item
        await updateDoc(cartRef, {
          items: arrayUnion(cartItem),
          updatedAt: new Date().toISOString()
        });
      }
    } else {
      // Create new cart
      await setDoc(cartRef, {
        items: [cartItem],
        guestId: guestId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    triggerCartUpdateEvent();
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    // Fallback to localStorage
    return addToCartLocal(product, selectedSize, selectedColor);
  }
};

export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const guestId = getGuestId();
    const cartRef = doc(db, 'carts', guestId);
    const cartSnapshot = await getDoc(cartRef);
    
    if (cartSnapshot.exists()) {
      return cartSnapshot.data().items || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting cart:', error);
    // Fallback to localStorage
    return getCartItemsLocal();
  }
};

export const removeFromCart = async (itemId: number): Promise<CartItem[]> => {
  try {
    const guestId = getGuestId();
    const cartRef = doc(db, 'carts', guestId);
    const cartSnapshot = await getDoc(cartRef);
    
    if (cartSnapshot.exists()) {
      const cartData = cartSnapshot.data();
      const updatedItems = cartData.items.filter((item: CartItem) => item.id !== itemId);
      
      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: new Date().toISOString()
      });
      
      triggerCartUpdateEvent();
      return updatedItems;
    }
    return [];
  } catch (error) {
    console.error('Error removing from cart:', error);
    // Fallback to localStorage
    return removeFromCartLocal(itemId);
  }
};

export const updateCartItemQuantity = async (itemId: number, newQuantity: number): Promise<CartItem[]> => {
  try {
    const guestId = getGuestId();
    const cartRef = doc(db, 'carts', guestId);
    const cartSnapshot = await getDoc(cartRef);
    
    if (cartSnapshot.exists()) {
      const cartData = cartSnapshot.data();
      const updatedItems = cartData.items.map((item: CartItem) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      await updateDoc(cartRef, {
        items: updatedItems,
        updatedAt: new Date().toISOString()
      });
      
      triggerCartUpdateEvent();
      return updatedItems;
    }
    return [];
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    // Fallback to localStorage
    return updateCartItemQuantityLocal(itemId, newQuantity);
  }
};

export const getCartItemCount = async (): Promise<number> => {
  try {
    const items = await getCartItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return getCartItemCountLocal();
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    const guestId = getGuestId();
    const cartRef = doc(db, 'carts', guestId);
    
    await updateDoc(cartRef, {
      items: [],
      updatedAt: new Date().toISOString()
    });
    
    triggerCartUpdateEvent();
  } catch (error) {
    console.error('Error clearing cart:', error);
    clearCartLocal();
  }
};

// LocalStorage Fallback Functions
const addToCartLocal = (product: CartItem, selectedSize: string, selectedColor: string): boolean => {
  const existingCart = localStorage.getItem('cartItems');
  const cartItems: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
  
  const existingItemIndex = cartItems.findIndex(
    item => item.id === product.id && item.size === selectedSize && item.color === selectedColor
  );

  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity += 1;
  } else {
    cartItems.push({
      ...product,
      size: selectedSize,
      color: selectedColor,
      quantity: 1
    });
  }

  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  triggerCartUpdateEvent();
  return true;
};

const getCartItemsLocal = (): CartItem[] => {
  const existingCart = localStorage.getItem('cartItems');
  return existingCart ? JSON.parse(existingCart) : [];
};

const removeFromCartLocal = (itemId: number): CartItem[] => {
  const existingCart = localStorage.getItem('cartItems');
  const cartItems: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
  const updatedCart = cartItems.filter(item => item.id !== itemId);
  localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  triggerCartUpdateEvent();
  return updatedCart;
};

const updateCartItemQuantityLocal = (itemId: number, newQuantity: number): CartItem[] => {
  const existingCart = localStorage.getItem('cartItems');
  const cartItems: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
  const updatedCart = cartItems.map(item =>
    item.id === itemId ? { ...item, quantity: newQuantity } : item
  );
  localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  triggerCartUpdateEvent();
  return updatedCart;
};

const getCartItemCountLocal = (): number => {
  const existingCart = localStorage.getItem('cartItems');
  const cartItems: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

const clearCartLocal = (): void => {
  localStorage.removeItem('cartItems');
  triggerCartUpdateEvent();
};