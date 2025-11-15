// data/products.ts
const products = [
  {
    id: 1,
    slug: "batik-kawung-klasik-premium",
    name: "Batik Kawung Klasik Premium",
    price: 850000,
    originalPrice: 1200000,
    discount: 29,
    rating: 4.9,
    reviews: 127,
    sold: 245,
    artisan: "Mbah Parmi",
    location: "Giriloyo, Yogyakarta",
    image: "/kawung.png",
    images: [
      "/kawung.png",
      "/kawung2.png",
      "/kawung3.png",
      "/kawung4.png"
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'sogan', name: 'Sogan Natural', hex: '#8B7355' },
      { id: 'indigo', name: 'Indigo Klasik', hex: '#1E3A8A' },
      { id: 'merah', name: 'Merah Merapi', hex: '#991B1B' }
    ],
    description: "Batik Kawung adalah salah satu motif batik tertua dan paling dihormati dalam tradisi Jawa. Motif ini melambangkan kesempurnaan, kemurnian, dan umur panjang. Setiap goresan dibuat dengan tangan oleh pengrajin berpengalaman menggunakan teknik tulis tradisional yang telah diwariskan turun-temurun.",
    features: [
      "100% Katun Premium",
      "Pewarna Alami",
      "Proses Tulis Tangan (7-14 hari)",
      "Sertifikat Keaslian",
      "NFT Digital Gratis",
      "Garansi Luntur 1 Tahun"
    ],
    processingTime: "7-14 hari kerja",
    nftIncluded: true,
    motif: "Kawung",
    category: "klasik",
    featured: true
  },
  {
    id: 2,
    slug: "batik-parang-rusak-tulis",
    name: "Batik Parang Rusak Tulis",
    price: 1200000,
    originalPrice: 1500000,
    discount: 20,
    rating: 4.8,
    reviews: 89,
    sold: 150,
    artisan: "Pak Supardi",
    location: "Giriloyo, Yogyakarta",
    image: "/parang.png",
    images: [
      "/parang.png",
      "/parang2.png",
      "/parang3.png",
      "/parang4.png"
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'sogan', name: 'Sogan Natural', hex: '#8B7355' },
      { id: 'biru', name: 'Biru Indigo', hex: '#1E3A8A' }
    ],
    description: "Batik Parang Rusak merupakan motif batik yang memiliki makna perjuangan dan tidak mudah menyerah.",
    features: [
      "100% Katun Premium",
      "Pewarna Alami",
      "Proses Tulis Tangan (10-15 hari)",
      "Sertifikat Keaslian",
      "NFT Digital Gratis",
      "Garansi Luntur 1 Tahun"
    ],
    processingTime: "10-15 hari kerja",
    nftIncluded: true,
    motif: "Parang",
    category: "klasik",
    featured: true
  },
  {
    id: 3,
    slug: "batik-sogan-modern",
    name: "Batik Sogan Modern",
    price: 950000,
    originalPrice: 1100000,
    discount: 14,
    rating: 4.7,
    reviews: 203,
    sold: 189,
    artisan: "Bu Siti",
    location: "Giriloyo, Yogyakarta",
    image: "/sogan.png",
    images: [
      "/sogan.png",
      "/sogan2.png",
      "/sogan3.png"
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'sogan', name: 'Sogan Natural', hex: '#8B7355' }
    ],
    description: "Perpaduan motif sogan klasik dengan sentuhan modern",
    features: [
      "100% Katun Premium",
      "Pewarna Alami",
      "Proses Tulis Tangan (7-14 hari)",
      "Sertifikat Keaslian",
      "NFT Digital Gratis",
      "Garansi Luntur 1 Tahun"
    ],
    processingTime: "7-14 hari kerja",
    nftIncluded: true,
    motif: "Sogan",
    category: "modern",
    featured: false
  },
  {
    id: 4,
    slug: "batik-truntum-elegan",
    name: "Batik Truntum Elegan",
    price: 1100000,
    originalPrice: 1300000,
    discount: 15,
    rating: 4.9,
    reviews: 67,
    sold: 98,
    artisan: "Ibu Wahyuni",
    location: "Giriloyo, Yogyakarta",
    image: "/truntum.png",
    images: [
      "/truntum.png",
      "/truntum2.png",
      "/truntum3.png"
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'sogan', name: 'Sogan Natural', hex: '#8B7355' },
      { id: 'merah', name: 'Merah Merapi', hex: '#991B1B' }
    ],
    description: "Motif truntum yang elegan dengan makna cinta yang tumbuh",
    features: [
      "100% Katun Premium",
      "Pewarna Alami",
      "Proses Tulis Tangan (7-14 hari)",
      "Sertifikat Keaslian",
      "NFT Digital Gratis",
      "Garansi Luntur 1 Tahun"
    ],
    processingTime: "7-14 hari kerja",
    nftIncluded: true,
    motif: "Truntum",
    category: "klasik",
    featured: false
  },
  {
    id: 5,
    slug: "batik-mega-mendung",
    name: "Batik Mega Mendung",
    price: 980000,
    originalPrice: 1150000,
    discount: 15,
    rating: 4.6,
    reviews: 145,
    sold: 167,
    artisan: "Pak Budi",
    location: "Giriloyo, Yogyakarta",
    image: "/mega-mendung.png",
    images: [
      "/mega-mendung.png",
      "/mega-mendung2.png",
      "/mega-mendung3.png"
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'biru', name: 'Biru Indigo', hex: '#1E3A8A' },
      { id: 'merah', name: 'Merah Merapi', hex: '#991B1B' }
    ],
    description: "Motif awan yang indah dengan gradasi warna yang memukau",
    features: [
      "100% Katun Premium",
      "Pewarna Alami",
      "Proses Tulis Tangan (7-14 hari)",
      "Sertifikat Keaslian",
      "NFT Digital Gratis",
      "Garansi Luntur 1 Tahun"
    ],
    processingTime: "7-14 hari kerja",
    nftIncluded: true,
    motif: "Mega Mendung",
    category: "kontemporer",
    featured: true
  },
  {
    id: 6,
    slug: "batik-sekar-jagad",
    name: "Batik Sekar Jagad",
    price: 1350000,
    originalPrice: 1600000,
    discount: 16,
    rating: 5.0,
    reviews: 56,
    sold: 78,
    artisan: "Bu Lastri",
    location: "Giriloyo, Yogyakarta",
    image: "/sekar-jagad.png",
    images: [
      "/sekar-jagad.png",
      "/sekar-jagad2.png",
      "/sekar-jagad3.png"
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'sogan', name: 'Sogan Natural', hex: '#8B7355' },
      { id: 'biru', name: 'Biru Indigo', hex: '#1E3A8A' }
    ],
    description: "Motif peta dunia yang simbolis dan penuh makna filosofis",
    features: [
      "100% Katun Premium",
      "Pewarna Alami",
      "Proses Tulis Tangan (7-14 hari)",
      "Sertifikat Keaslian",
      "NFT Digital Gratis",
      "Garansi Luntur 1 Tahun"
    ],
    processingTime: "7-14 hari kerja",
    nftIncluded: true,
    motif: "Sekar Jagad",
    category: "klasik",
    featured: false
  }
];
export default products;