// data/products.ts
const products = [
  {
    id: 1,
    slug: "batik-Sido Mukti-klasik-premium",
    name: "Batik Sido Mukti Klasik Premium",
    price:  1250000,
    originalPrice: 1250000,
    discount: 29,
    rating: 4.9,
    reviews: 127,
    sold: 245,
    artisan: "Mbah Parmi",
    location: "Giriloyo, Yogyakarta",
    image: "/sido-mukti-bledak.jpg",
    images: [
      "/sido-mukti-bledak.jpg",
      // "/sido-mukti-bledak2.jpg",
      // "/sido-mukti-bledak3.jpg",
      // "/sido-mukti-bledak4.jpg"
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'sogan', name: 'Sogan Natural', hex: '#8B7355' },
      // { id: 'indigo', name: 'Indigo Klasik', hex: '#1E3A8A' },
      // { id: 'merah', name: 'Merah Merapi', hex: '#991B1B' }
    ],
    description: "Motif Sido Mukti Bledak adalah salah satu motif klasik yang memiliki nilai filosofis tinggi dalam budaya Jawa, melambangkan harapan akan kemuliaan, kemurnian, dan umur panjang. Setiap helai kain ini diproses secara eksklusif menggunakan teknik batik tulis asli (bukan cetak), dikerjakan dengan ketelitian tinggi oleh pengrajin berpengalaman untuk menghasilkan detail motif yang otentik dan bernilai seni tinggi.",
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
    motif: "Sido Mukti bledak",
    category: "klasik",
    featured: true
  },
  {
    id: 2,
    slug: "batik Sido Mukti Rining tulis",
    name: "Batik Sido Mukti Rining Tulis",
    price: 1500000,
    originalPrice: 1500000,
    discount: 20,
    rating: 4.8,
    reviews: 89,
    sold: 150,
    artisan: "Pak Supardi",
    location: "Giriloyo, Yogyakarta",
    image: "/Sido Mukti Rining.jpg",
    images: [
      "/Sido Mukti Rining.jpg",
      // "/parang2.png",
      // "/parang3.png",
      // "/parang4.png"
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'sogan', name: 'Sogan Natural', hex: '#8B7355' },
      { id: 'biru', name: 'Biru Indigo', hex: '#1E3A8A' }
    ],
   description: "Hadirkan nuansa klasik yang mewah dengan Batik Sido Mukti Rining. Berbeda dengan motif biasa, varian 'Rining' ini menonjolkan detail latar yang sangat halus dan rapat, menciptakan efek visual yang elegan dan eksklusif. Motif utamanya melambangkan harapan menjadi orang yang berwibawa dan sejahtera. Dibuat 100% dengan teknik tulis tangan tradisional, kain ini menawarkan tekstur visual yang kaya dan nilai seni yang tak lekang oleh waktu.",
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
    motif: "Sido Mukti Rining",
    category: "klasik",
    featured: true
  },
  {
    id: 3,
    slug: "batik-Sido Mukti Singgit",
    name: "Batik Sido Mukti Singgit",
    price: 1500000,
    originalPrice: 1500000,
    discount: 14,
    rating: 4.7,
    reviews: 203,
    sold: 189,
    artisan: "Bu Siti",
    location: "Giriloyo, Yogyakarta",
    image: "/Sido Mukti Singgit .jpg",
    images: [
      "/Sido Mukti Singgit .jpg",
      // "/sogan2.png",
      // "/sogan3.png"
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'sogan', name: 'Sogan Natural', hex: '#8B7355' }
    ],
    description: "Perpaduan motif batik-Sido Mukti Singgit klasik dengan sentuhan modern",
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
    motif: "Sido Mukti Singgit",
    category: "modern",
    featured: false
  },
  {
    id: 4,
    slug: "batik-Wahyu-Tumurun-elegan",
    name: "Batik Wahyu Tumurun Elegan",
    price: 850000,
    originalPrice: 850000,
    discount: 15,
    rating: 4.9,
    reviews: 67,
    sold: 98,
    artisan: "Ibu Wahyuni",
    location: "Giriloyo, Yogyakarta",
    image: "/Wahyu Tumurun.jpg",
    images: [
      "/Wahyu Tumurun.jpg",
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'sogan', name: 'Coklat', hex: '#8B7355' },
      // { id: 'merah', name: 'Merah Merapi', hex: '#991B1B' }
    ],
    description: "Motif Wahyu Tumurun melukiskan doa yang tulus akan turunnya anugerah dan petunjuk dari Tuhan Yang Maha Esa. Dengan ornamen utama berupa mahkota terbang dan burung merak atau sepasang ayam, batik ini menyimbolkan harapan akan datangnya kebahagiaan, pangkat, dan kedudukan yang mulia. Sangat sering dikenakan dalam momen sakral seperti pernikahan, dengan harapan kedua mempelai senantiasa diberkahi keharmonisan dan kemuliaan yang langgeng.",
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
    motif: "Wahyu Tumurun ",
    category: "klasik",
    featured: false
  },
  {
    id: 5,
    slug: "batik-Wahyu-Tumurun-Bledhak",
    name: "Batik Wahyu Tumurun Bledhak",
    price: 1350000,
    originalPrice: 1350000,
    discount: 15,
    rating: 4.6,
    reviews: 145,
    sold: 167,
    artisan: "Pak Budi",
    location: "Giriloyo, Yogyakarta",
    image: "/Wahyu Tumurun Bledhak.jpg",
    images: [
      "/Wahyu Tumurun Bledhak.jpg",
      // "/Wahyu Tumurun Bledhak2.jpg",
      // "/Wahyu Tumurun Bledhak3.jpg"
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'bledhak', name: 'Bledhak', hex: '#fffff' },
      // { id: 'merah', name: 'Merah Merapi', hex: '#991B1B' }
    ],
    description: "Motif Wahyu Tumurun melukiskan doa yang tulus akan turunnya anugerah dan petunjuk dari Tuhan Yang Maha Esa. Dengan ornamen utama berupa mahkota terbang dan burung merak atau sepasang ayam, batik ini menyimbolkan harapan akan datangnya kebahagiaan, pangkat, dan kedudukan yang mulia. Sangat sering dikenakan dalam momen sakral seperti pernikahan, dengan harapan kedua mempelai senantiasa diberkahi keharmonisan dan kemuliaan yang langgeng.",
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
    motif: "Wahyu Tumurun Bledhak",
    category: "kontemporer",
    featured: true
  },
  {
    id: 6,
    slug: "batik-Wahyu-Tumurun-Cecek",
    name: "Batik Wahyu Tumurun Cecek",
    price: 1200000,
    originalPrice: 120000,
    discount: 16,
    rating: 5.0,
    reviews: 56,
    sold: 78,
    artisan: "Bu Lastri",
    location: "Giriloyo, Yogyakarta",
    image: "/Wahyu Tumurun Cecek.jpg",
    images: [
      "/Wahyu Tumurun Cecek.jpg",
      // "/Wahyu Tumurun Cecek2.jpg",
      // "/Wahyu Tumurun Cecek3.jpg"
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'cecek', name: 'cecek', hex: '#ffff' },
      // { id: 'merah', name: 'Merah Merapi', hex: '#991B1B' }
    ],
     description: "Motif Wahyu Tumurun melukiskan doa yang tulus akan turunnya anugerah dan petunjuk dari Tuhan Yang Maha Esa. Dengan ornamen utama berupa mahkota terbang dan burung merak atau sepasang ayam, batik ini menyimbolkan harapan akan datangnya kebahagiaan, pangkat, dan kedudukan yang mulia. Sangat sering dikenakan dalam momen sakral seperti pernikahan, dengan harapan kedua mempelai senantiasa diberkahi keharmonisan dan kemuliaan yang langgeng.",
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
  },
  {
    id: 7,
    slug: "batik-Parang-Pari-Kesit",
    name: "Batik Parang Pari Kesit",
    price: 1200000,
    originalPrice: 1200000,
    discount: 10,
    rating: 4.8,
    reviews: 98,
    sold: 134,
    artisan: "Mbah Harjo",
    location: "Giriloyo, Yogyakarta",
    image: "/Parang Pari Kesit.jpg",
    images: [
      "/Parang Pari Kesit.jpg",
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'sogan', name: 'Sogan Natural', hex: '#8B7355' }
    ],
    description: "Motif Parang Pari Kesit adalah salah satu varian dari motif parang yang sarat akan filosofi mendalam dalam budaya Jawa. 'Pari Kesit' secara harfiah berarti padi yang terpotong', melambangkan siklus kehidupan manusia yang terus berputar antara kelahiran, kematian, dan kelahiran kembali. Motif ini mengajarkan tentang pentingnya keseimbangan, kesederhanaan, dan ketabahan dalam menjalani hidup. Dengan garis-garis diagonal yang khas, motif ini menciptakan pola visual yang dinamis namun tetap harmonis, mencerminkan filosofi hidup yang seimbang dan penuh makna.",
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
    motif: "Parang Pari Kesit",
    category: "klasik",
    featured: false
  },
  // Parang Cecek
  {
    id: 8,
    slug: "batik-Parang-Cecek",
    name: "Batik Parang Cecek",
    price: 1250000,
    originalPrice: 1250000,
    discount: 12,
    rating: 4.7,
    reviews: 76,
    sold: 112,
    artisan: "Pak Joko",
    location: "Giriloyo, Yogyakarta",
    image: "/Parang Cecek.jpg",
    images: [
      "/Parang Cecek.jpg",
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'cecek', name: 'Cecek Natural', hex: '#ffff' }
    ],
    description: "Motif Parang Cecek adalah salah satu varian dari motif parang yang sarat akan filosofi mendalam dalam budaya Jawa. 'Cecek' merujuk pada pola titik-titik kecil yang menghiasi latar belakang motif utama, menambah dimensi visual yang unik dan menarik. Motif ini melambangkan kekuatan, keberanian, dan keteguhan hati dalam menghadapi tantangan hidup. Dengan garis-garis diagonal yang khas dipadukan dengan titik-titik cecek, motif ini menciptakan pola visual yang dinamis namun tetap harmonis, mencerminkan filosofi hidup yang seimbang dan penuh makna.",
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
    motif: "Parang Cecek",
    category: "klasik",
    featured: false
  },
  // Parang
  {
    id: 9,
    slug: "batik-Parang",
    name: "Batik Parang",
    price: 1200000,
    originalPrice: 1200000,
    discount: 18,
    rating: 4.9,
    reviews: 150,
    sold: 200,
    artisan: "Bu Rina",
    location: "Giriloyo, Yogyakarta",
    image: "/Parang.jpg",
    images: [
      "/Parang.jpg",
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'putih', name: 'Putih Natural', hex: '#ffffff' }
    ],
    description: "Motif Parang adalah salah satu motif batik tertua dan paling dihormati dalam budaya Jawa, yang sarat akan filosofi mendalam. Motif ini melambangkan kekuatan, keberanian, dan keteguhan hati dalam menghadapi tantangan hidup. Dengan garis-garis diagonal yang khas, motif Parang menciptakan pola visual yang dinamis namun tetap harmonis, mencerminkan filosofi hidup yang seimbang dan penuh makna. Batik dengan motif Parang sering kali dikenakan oleh para bangsawan dan tokoh penting sebagai simbol status dan kehormatan.",
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
    motif: "Parang",
    category: "klasik",
    featured: true,
  },
  // Nitik Nogosari
  {
    id: 10,
    slug: "batik-Nitik-Nogosari",
    name: "Batik Nitik Nogosari",
    price: 1350000,
    originalPrice: 1350000,
    discount: 20,
    rating: 4.8,
    reviews: 110,
    sold: 140,
    artisan: "Mbah Sastro",
    location: "Giriloyo, Yogyakarta",
    image: "/Nitik Nogosari.jpg",
    images: [
      "/Nitik Nogosari.jpg",
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'nogosari', name: 'Nogosari', hex: '#D4AF37' }
    ],
    description: "Motif Nitik Nogosari adalah salah satu motif batik yang kaya akan filosofi dan makna dalam budaya Jawa. 'Nitik' berarti titik-titik kecil yang membentuk pola halus, sementara 'Nogosari' merujuk pada tanaman padi yang melambangkan kemakmuran dan kesejahteraan. Motif ini mencerminkan harapan akan kehidupan yang sejahtera dan berkelimpahan. Dengan pola titik-titik yang rapat dan teratur, motif Nitik Nogosari menciptakan tampilan visualyang elegan dan penuh arti, menjadikannya pilihan yang sempurna untuk mereka yang menghargai seni batik tradisional dengan sentuhan makna mendalam.",
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
    motif: "Nitik Nogosari",
    category: "klasik",
    featured: false
  },
  // Nitik Dopo Tangu 
  {
    id: 11,
    slug: "batik-Nitik-Dopo-Tangu",
    name: "Batik Nitik Dopo Tangu",
    price: 1250000,
    originalPrice: 1250000,
    discount: 15,
    rating: 4.7,
    reviews: 95,
    sold: 120,
    artisan: "Pak Slamet",
    location: "Giriloyo, Yogyakarta",
    image: "/Nitik Dopo Tangu.jpg",
    images: [
      "/Nitik Dopo Tangu.jpg",
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'dopo-tangu', name: 'Dopo Tangu', hex: '#A0522D' }
    ],
    description: "Motif Nitik Dopo Tangu adalah salah satu motif batik yang kaya akan filosofi dan makna dalam budaya Jawa. 'Nitik' berarti titik-titik kecil yang membentuk pola halus, sementara 'Dopo Tangu' merujuk pada tanaman yang melambangkan ketabahan dan keteguhan hati. Motif ini mencerminkan harapan akan kehidupan yang penuh keteguhan dan keberanian dalam menghadapi tantangan. Dengan pola titik-titik yang rapat dan teratur, motif Nitik Dopo Tangu menciptakan tampilan visual yang elegan dan penuh arti, menjadikannya pilihan yang sempurna untuk mereka yang menghargai seni batik tradisional dengan sentuhan makna mendalam.",
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
    motif: "Nitik Dopo Tangu",
    category: "klasik",
    featured: false
  },
  // Nitik Cakar Ayam
  {
    id: 12,
    slug: "batik-Nitik-Cakar-Ayam",
    name: "Batik Nitik Cakar Ayam",
    price: 1300000,
    originalPrice: 1300000,
    discount: 18,
    rating: 4.9,
    reviews: 130,
    sold: 160,
    artisan: "Bu Yanti",
    location: "Giriloyo, Yogyakarta",
    image: "/Nitik Cakar Ayam.jpg",
    images: [
      "/Nitik Cakar Ayam.jpg",
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'cakar-ayam', name: 'Cakar Ayam', hex: '#FFDEAD' }
    ],
    description: "Motif Nitik Cakar Ayam adalah salah satu motif batik yang kaya akan filosofi dan makna dalam budaya Jawa. 'Nitik' berarti titik-titik kecil yang membentuk pola halus, sementara 'Cakar Ayam' merujuk pada pola yang menyerupai jejak cakar ayam, melambangkan ketekunan dan kerja keras. Motif ini mencerminkan harapan akan kehidupan yang penuh usaha dan dedikasi dalam mencapai tujuan. Dengan pola titik-titik yang rapat dan teratur, motif Nitik Cakar Ayam menciptakan tampilan visual yang elegan dan penuh arti, menjadikannya pilihan yang sempurna untuk mereka yang menghargai seni batik tradisional dengan sentuhan makna mendalam.",
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
    motif: "Nitik Cakar Ayam",
    category: "klasik",
    featured: false
  },
  // Gelombang cinta
  {
    id: 13,
    slug: "batik-Gelombang-Cinta",
    name: "Batik Gelombang Cinta",
    price: 1100000,
    originalPrice: 1100000,
    discount: 22,
    rating: 4.6,
    reviews: 80,
    sold:105,
    artisan: "Mbah Lilik",
    location: "Giriloyo, Yogyakarta",
    image: "/Gelombang Cinta.jpg",
    images: [
      "/Gelombang Cinta.jpg",
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'gelombang-cinta', name: 'Gelombang Cinta', hex: '#87CEEB' }
    ],
    description: "Motif Gelombang Cinta adalah salah satu motif batik yang memancarkan keindahan dan makna mendalam dalam budaya Jawa. Motif ini menggambarkan gelombang laut yang melambangkan arus kehidupan yang terus bergerak maju, penuh dengan dinamika dan perubahan. 'Cinta' dalam nama motif ini menambahkan dimensi emosional, melambangkan kasih sayang, hubungan, dan harmoni dalam kehidupan manusia. Dengan pola gelombang yang mengalir dan harmonis, motif Gelombang Cinta menciptakan tampilan visual yang menenangkan dan penuh arti, menjadikannya pilihan yang sempurna untuk mereka yang menghargai seni batik tradisional dengan sentuhan makna mendalam.",
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
    motif: "Gelombang Cinta",
    category: "kontemporer",
    featured: false
  },
  // Kendhit Kawung
  {
    id: 14,
    slug: "batik-Kendhit-Kawung",
    name: "Batik Kendhit Kawung",
    price: 1150000,
    originalPrice: 1150000,
    discount: 17,
    rating: 4.8,
    reviews: 90,
    sold: 130,
    artisan: "Pak Darto",
    location: "Giriloyo, Yogyakarta",
    image: "/Kendhit Kawung.jpg",
    images: [
      "/Kendhit Kawung.jpg",
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { id: 'kendhit-kawung', name: 'Kendhit Kawung', hex: '#D2B48C' }
    ],
    description: "Motif Kendhit Kawung adalah salah satu motif batik yang kaya akan filosofi dan makna dalam budaya Jawa. 'Kendhit' merujuk pada pola geometris yang terdiri dari lingkaran-lingkaran kecil yang saling berhubungan, sementara 'Kawung' adalah simbol buah aren yang melambangkan kesucian, keabadian, dan keseimbangan. Motif ini mencerminkan harapan akan kehidupan yang harmonis dan seimbang. Dengan pola geometris yang teratur dan simetris, motif Kendhit Kawung menciptakan tampilan visual yang elegan dan penuh arti, menjadikannya pilihan yang sempurna untuk mereka yang menghargai seni batik tradisional dengan sentuhan makna mendalam.",
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
    motif: "Kendhit Kawung",
    category: "klasik",
    featured: false
  }, 
  //batik laba laba
  {
    id: 15,
    slug: "batik-Laba-Laba",
    name: "Batik Laba Laba",
    price: 1400000,
    originalPrice: 1400000,
    discount: 19,
    rating: 4.9,
    reviews: 115,
    sold: 150,
    artisan: "Bu Endang",
    location: "Giriloyo, Yogyakarta",
    image: "/labalaba.jpg",
    images: [
      "/labalaba.jpg",
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'laba-laba', name: 'Laba Laba', hex: '#708090' }
    ],
    description: "Motif Laba Laba adalah salah satu motif batik yang memancarkan keindahan dan makna mendalam dalam budaya Jawa. Motif ini menggambarkan jaring laba-laba yang melambangkan keterhubungan, kesabaran, dan ketekunan dalam menjalani kehidupan. Laba-laba dikenal sebagai makhluk yang rajin dan tekun dalam membangun jaringnya, mencerminkan nilai-nilai kerja keras dan dedikasi. Dengan pola jaring yang rumit dan simetris, motif Laba Laba menciptakan tampilan visual yang menarik dan penuh arti, menjadikannya pilihan yang sempurna untuk mereka yang menghargai seni batik tradisional dengan sentuhan makna mendalam.",
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
    motif: "Laba Laba",
    category: "kontemporer",
    featured: false
  }
];
export default products;