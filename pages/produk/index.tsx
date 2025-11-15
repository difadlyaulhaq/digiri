import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, Filter, Grid, List, Star, Award, MapPin, ShoppingCart } from 'lucide-react';

// Data produk (dalam aplikasi nyata ini akan dari API)
import products from '@/data/products';
import { addToCart } from '@/utils/cartUtils';

const categories = [
  { id: 'all', name: 'Semua Motif', count: products.length },
  { id: 'klasik', name: 'Klasik Tradisional', count: products.filter(p => p.category === 'klasik').length },
  { id: 'modern', name: 'Modern', count: products.filter(p => p.category === 'modern').length },
  { id: 'kontemporer', name: 'Kontemporer', count: products.filter(p => p.category === 'kontemporer').length }
];

const priceRanges = [
  { id: 'all', name: 'Semua Harga', min: 0, max: Infinity },
  { id: 'under-1m', name: 'Dibawah 1 Juta', min: 0, max: 1000000 },
  { id: '1m-2m', name: '1 - 2 Juta', min: 1000000, max: 2000000 },
  { id: 'above-2m', name: 'Diatas 2 Juta', min: 2000000, max: Infinity }
];

const ProductCatalog = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async (product: any) => {
  setAddingToCart(product.id);
  
  const defaultSize = product.sizes[0];
  const defaultColor = product.colors[0].name;
  
  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    size: defaultSize,
    color: defaultColor,
    quantity: 1,
    image: product.image,
    slug: product.slug
  };

  addToCart(cartItem, defaultSize, defaultColor);
  
  // Trigger manual update untuk navbar
  window.dispatchEvent(new Event('cartUpdated'));
  
  await new Promise(resolve => setTimeout(resolve, 500));
  setAddingToCart(null);
  
  alert('Produk berhasil ditambahkan ke keranjang!');
};

  const handleQuickCheckout = (product: any) => {
    const defaultSize = product.sizes[0];
    const defaultColor = product.colors[0].name;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
      image: product.image,
      slug: product.slug
    };

    addToCart(cartItem, defaultSize, defaultColor);
    router.push('/checkoutpage');
  };

  // Filter products
  const filteredProducts = products
    .filter(product => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      
      // Price range filter
      const priceRange = priceRanges.find(range => range.id === selectedPriceRange);
      if (priceRange && (product.price < priceRange.min || product.price > priceRange.max)) {
        return false;
      }
      
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.motif.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.artisan.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
        default:
          return b.sold - a.sold;
      }
    });

  return (
    <>
      <Head>
        <title>Katalog Batik - Desa Wisata Batik Giriloyo</title>
        <meta name="description" content="Jelajahi koleksi batik tulis premium dari pengrajin Giriloyo dengan sertifikat NFT" />
      </Head>
      
      <div className="min-h-screen bg-amber-50">
        <Navbar />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4">Katalog Batik</h1>
              <p className="text-lg lg:text-xl opacity-90 max-w-2xl mx-auto">
                Temukan batik tulis autentik dengan kualitas premium dan sertifikat NFT
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="lg:w-1/4 space-y-6">
              {/* Search */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-stone-800 mb-4">Pencarian</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari batik, motif, atau pengrajin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-stone-800 mb-4">Kategori Motif</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex justify-between items-center p-3 rounded-lg transition ${
                        selectedCategory === category.id
                          ? 'bg-amber-100 text-amber-800 font-semibold'
                          : 'hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-sm bg-stone-200 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-stone-800 mb-4">Rentang Harga</h3>
                <div className="space-y-2">
                  {priceRanges.map(range => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedPriceRange(range.id)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        selectedPriceRange === range.id
                          ? 'bg-amber-100 text-amber-800 font-semibold'
                          : 'hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* NFT Badge */}
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="text-purple-600" size={24} />
                  <h3 className="font-bold text-stone-800">NFT Certificate</h3>
                </div>
                <p className="text-sm text-stone-600">
                  Setiap pembelian batik dilengkapi dengan NFT sebagai sertifikat keaslian digital
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Toolbar */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-stone-600">
                      Menampilkan <span className="font-bold text-stone-800">{filteredProducts.length}</span> produk
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-stone-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="popular">Paling Populer</option>
                      <option value="price-low">Harga Terendah</option>
                      <option value="price-high">Harga Tertinggi</option>
                      <option value="rating">Rating Tertinggi</option>
                    </select>

                    {/* View Toggle */}
                    <div className="flex border border-stone-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 transition ${
                          viewMode === 'grid' 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-white text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <Grid size={20} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 transition ${
                          viewMode === 'list' 
                            ? 'bg-amber-600 text-white' 
                            : 'bg-white text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <List size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Filter size={48} className="text-stone-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Tidak ada produk ditemukan</h3>
                  <p className="text-stone-600">Coba ubah filter pencarian Anda</p>
                </div>
              ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:-translate-y-2 group border border-stone-100"
                    >
                      <div className="relative h-64 overflow-hidden bg-stone-100">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                        
                        {/* Badges */}
                        {product.discount > 0 && (
                          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            -{product.discount}%
                          </div>
                        )}
                        {product.nftIncluded && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <Award size={12} />
                            NFT
                          </div>
                        )}
                        {product.featured && (
                          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-stone-800 px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                            🔥 Featured
                          </div>
                        )}
                      </div>
                      
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-stone-800 text-lg leading-tight">{product.name}</h3>
                        </div>
                        
                        <p className="text-stone-600 text-sm mb-3 flex items-center gap-2">
                          <MapPin size={14} />
                          {product.artisan} • {product.location}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star size={16} className="text-amber-500 fill-amber-500" />
                            <span className="font-bold text-stone-800 text-sm">{product.rating}</span>
                          </div>
                          <span className="text-stone-400">•</span>
                          <span className="text-stone-600 text-sm">{product.reviews} ulasan</span>
                          <span className="text-stone-400">•</span>
                          <span className="text-stone-600 text-sm">{product.sold} terjual</span>
                        </div>
                        
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-2xl font-bold text-amber-700">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-sm text-stone-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={addingToCart === product.id}
                            className="w-full bg-amber-100 text-amber-800 py-3 rounded-full font-semibold hover:bg-amber-200 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {addingToCart === product.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
                                Menambahkan...
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={16} />
                                Tambah ke Keranjang
                              </>
                            )}
                          </button>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Link href={`/produk/${product.slug}`}>
                              <button className="w-full bg-white text-amber-800 border-2 border-amber-800 py-3 rounded-full font-semibold hover:bg-amber-50 transition">
                                Lihat Detail
                              </button>
                            </Link>
                            <button
                              onClick={() => handleQuickCheckout(product)}
                              className="w-full bg-gradient-to-r from-amber-800 to-amber-900 text-amber-50 py-3 rounded-full font-semibold hover:shadow-lg transition"
                            >
                              Beli Sekarang
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // List View
                <div className="space-y-4">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition border border-stone-100"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                          {product.nftIncluded && (
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                              <Award size={12} />
                              NFT
                            </div>
                          )}
                        </div>
                        
                        <div className="md:w-2/3 p-6">
                          <div className="flex flex-col h-full">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-stone-800 text-xl">{product.name}</h3>
                                {product.discount > 0 && (
                                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    -{product.discount}%
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-stone-600 text-sm mb-3 flex items-center gap-2">
                                <MapPin size={14} />
                                {product.artisan} • {product.location}
                              </p>
                              
                              <p className="text-stone-700 mb-4 line-clamp-2">{product.description}</p>
                              
                              <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                  <Star size={16} className="text-amber-500 fill-amber-500" />
                                  <span className="font-bold text-stone-800">{product.rating}</span>
                                  <span className="text-stone-600 text-sm">({product.reviews} ulasan)</span>
                                </div>
                                <span className="text-stone-600 text-sm">{product.sold} terjual</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-amber-700">
                                  {formatPrice(product.price)}
                                </span>
                                {product.originalPrice > product.price && (
                                  <span className="text-sm text-stone-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  disabled={addingToCart === product.id}
                                  className="bg-amber-100 text-amber-800 px-4 py-3 rounded-full font-semibold hover:bg-amber-200 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {addingToCart === product.id ? (
                                    <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <ShoppingCart size={16} />
                                  )}
                                  Tambah
                                </button>
                                
                                <Link href={`/produk/${product.slug}`}>
                                  <button className="bg-white text-amber-800 border-2 border-amber-800 px-6 py-3 rounded-full font-semibold hover:bg-amber-50 transition">
                                    Detail
                                  </button>
                                </Link>
                                
                                <button
                                  onClick={() => handleQuickCheckout(product)}
                                  className="bg-gradient-to-r from-amber-800 to-amber-900 text-amber-50 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition"
                                >
                                  Beli
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ProductCatalog;