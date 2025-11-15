// pages/produk/[slug].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ShoppingCart, Heart, Share2, Award, ZoomIn, Sparkles, Check, Star, MapPin, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import products from '@/data/products';
import { addToCart } from '@/utils/cartUtils';

const ProductDetailPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Find product by slug
  const product = products.find(p => p.slug === slug);

  // Set default size and color when product is available
  useEffect(() => {
    if (product) {
      if (!selectedSize && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      if (!selectedColor && product.colors.length > 0) {
        setSelectedColor(product.colors[0].id);
      }
    }
  }, [product, selectedSize, selectedColor]);

  // Redirect if product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">Produk tidak ditemukan</h1>
          <button 
            onClick={() => router.push('/produk')}
            className="bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700"
          >
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      alert('Pilih ukuran dan warna terlebih dahulu');
      return;
    }

    setAddingToCart(true);
    
    const selectedColorName = product.colors.find((c: { id: string; name: string; hex: string }) => c.id === selectedColor)?.name || '';
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColorName,
      quantity: quantity,
      image: product.image,
      slug: product.slug
    };

    await addToCart(cartItem, selectedSize, selectedColorName);
    setAddingToCart(false);
    
    alert(`${product.name} berhasil ditambahkan ke keranjang!`);
  };

  const handleBuyNow = async () => {
    if (!selectedSize || !selectedColor) {
      alert('Pilih ukuran dan warna terlebih dahulu');
      return;
    }

    setAddingToCart(true);
    
    const selectedColorName = product.colors.find((c: { id: string; name: string; hex: string }) => c.id === selectedColor)?.name || '';
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColorName,
      quantity: quantity,
      image: product.image,
      slug: product.slug
    };

    await addToCart(cartItem, selectedSize, selectedColorName);
    setAddingToCart(false);
    
    router.push('/checkoutpage');
  };

  // ... rest of the component remains the same until action buttons

  // Update the action buttons section:
  {/* Action Buttons */}
  <div className="flex gap-4 pt-4">
    <button
      onClick={handleAddToCart}
      disabled={addingToCart || !selectedSize || !selectedColor}
      className="flex-1 bg-white text-amber-800 border-2 border-amber-800 px-8 py-4 rounded-full font-bold hover:bg-amber-50 transition text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {addingToCart ? (
        <>
          <div className="w-5 h-5 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
          Menambahkan...
        </>
      ) : (
        <>
          <ShoppingCart size={20} />
          Keranjang
        </>
      )}
    </button>
    <button
      onClick={handleBuyNow}
      disabled={addingToCart || !selectedSize || !selectedColor}
      className="flex-1 bg-gradient-to-r from-amber-800 to-amber-900 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {addingToCart ? 'Menambahkan...' : 'Beli Sekarang'}
    </button>
  </div>
}
export default ProductDetailPage;