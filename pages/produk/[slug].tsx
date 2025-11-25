// pages/produk/[slug].tsx - DIPERBAIKI
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ShoppingCart, Heart, Share2, Award, ZoomIn, Sparkles, Check, Star, MapPin, Clock, Plus, Minus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import products from '@/data/products';
import { addToCart } from '@/utils/cartUtils';
import { Analytics } from "@vercel/analytics/next"

interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produk tidak ditemukan</h1>
          <button 
            onClick={() => router.push('/produk')}
            className="bg-blue-900 text-white px-6 py-3 rounded-full hover:bg-blue-800"
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
    
    const selectedColorName = product.colors.find((c: ProductColor) => c.id === selectedColor)?.name || '';
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColorName,
      quantity: quantity,
      image: product.images[0],
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
    
    const selectedColorName = product.colors.find((c: ProductColor) => c.id === selectedColor)?.name || '';
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColorName,
      quantity: quantity,
      image: product.images[0],
      slug: product.slug
    };

    await addToCart(cartItem, selectedSize, selectedColorName);
    setAddingToCart(false);
    
    router.push('/checkoutpage');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Analytics />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <button onClick={() => router.push('/')} className="hover:text-blue-900">Home</button>
          <span>/</span>
          <button onClick={() => router.push('/produk')} className="hover:text-blue-900">Katalog</button>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div 
              className="relative h-96 lg:h-[500px] bg-gray-100 rounded-3xl overflow-hidden cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isZoomed ? 'scale-110' : 'scale-100'
                }`}
              />
              <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition">
                <ZoomIn size={20} className="text-gray-700" />
              </button>
              
              {/* Badges */}
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{product.discount}%
                </div>
              )}
              {product.nftIncluded && (
                <div className="absolute top-16 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Award size={12} />
                  NFT Included
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-3 overflow-x-auto pb-4">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={` shrink-0 w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-900' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span className="font-bold text-gray-900">{product.rating}</span>
                  <span>({product.reviews} ulasan)</span>
                </div>
                <span>•</span>
                <span>{product.sold} terjual</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{product.artisan}, {product.location}</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-amber-600">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-2">
              {product.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={16} className="text-green-600" />
                  {feature}
                </div>
              ))}
            </div>

            {/* Size Selection */}
            {/* <div>
              <h3 className="font-bold text-gray-900 mb-3">Pilih Ukuran</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-xl border-2 font-semibold transition ${
                      selectedSize === size
                        ? 'border-blue-900 bg-blue-100 text-blue-900'
                        : 'border-gray-200 hover:border-blue-600 text-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div> */}

            {/* Color Selection */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Pilih Warna</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color: ProductColor) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition ${
                      selectedColor === color.id
                        ? 'border-blue-900 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-600'
                    }`}
                  >
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="font-medium text-gray-700">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Jumlah</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 border-2 border-gray-400 rounded-xl px-4 py-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 text-black bg-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold text-lg w-8 text-center text-black">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 text-black bg-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>Proses: {product.processingTime}</span>
                </div>
              </div>
            </div>

            {/* NFT Info */}
            {product.nftIncluded && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-purple-600" size={24} />
                  <div>
                    <p className="font-bold text-purple-700 text-sm">NFT Certificate Included</p>
                    <p className="text-xs text-gray-600">Sertifikat keaslian digital akan dikirim ke email Anda</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedSize || !selectedColor}
                className="flex-1 bg-white text-blue-900 border-2 border-blue-900 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
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
                className="flex-1 bg-gradient-to-r from-blue-900 to-slate-900 text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? 'Menambahkan...' : 'Beli Sekarang'}
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex gap-4 pt-4">
              {/* <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border transition ${
                  isFavorited
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart size={20} className={isFavorited ? 'fill-red-600' : ''} />
                {isFavorited ? 'Disukai' : 'Suka'}
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition">
                <Share2 size={20} />
                Bagikan
              </button> */}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;