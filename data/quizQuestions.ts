// data/quizQuestions.ts
const quizQuestions = {
  level1: [
    {
      id: 1,
      question: "Apa alat utama yang digunakan untuk melukis (menerakan) lilin panas (malam) ke kain dalam proses Batik Tulis?",
      options: [
        "Kuas",
        "Spidol Khusus", 
        "Canting",
        "Stempel (Cap)"
      ],
      correctAnswer: 2,
      timeLimit: 30,
      explanation: "Tepat! Canting adalah 'pena' perajin. Mengendalikan aliran 'malam' panas dari canting agar goresannya stabil dan tidak bocor membutuhkan keahlian bertahun-tahun."
    },
    {
      id: 2,
      question: "Berapa rata-rata waktu yang dibutuhkan perajin untuk menyelesaikan SATU (1) helai Batik Tulis Alus (premium) dari kain putih hingga siap pakai?",
      options: [
        "1-2 Hari",
        "1-2 Minggu",
        "1-3 Bulan",
        "1-2 Tahun"
      ],
      correctAnswer: 2,
      timeLimit: 30,
      explanation: "Benar! Prosesnya sangat panjang: menggambar pola, nyanting, mewarnai, melorod (menghilangkan lilin), dan mengulanginya untuk setiap warna. Ini adalah karya yang lahir dari kesabaran."
    },
    {
      id: 3,
      question: "Apa yang terjadi jika seorang perajin Batik Tulis membuat kesalahan goresan 'malam' (lilin) di tengah proses?",
      options: [
        "Bisa dihapus dengan penghapus khusus",
        "Bisa dicuci dengan air dan sabun",
        "Kesalahan itu bersifat permanen dan tidak bisa dihapus",
        "Bisa ditimpa dengan spidol putih"
      ],
      correctAnswer: 2,
      timeLimit: 25,
      explanation: "Ini dia tekanannya! Goresan 'malam' yang salah sebenarnya bisa dikerik atau dihilangkan dengan minyak tanah/air panas, namun metode ini akan mempengaruhi kualitas kain di area tersebut. Pengrajin profesional biasanya menghindari kesalahan sejak awal karena koreksinya sulit dan berisiko."
    },
    {
      id: 4,
      question: "'Lorod' adalah salah satu tahap penting dalam pembatikan. Apa tujuannya?",
      options: [
        "Memberi parfum pada kain",
        "Menghilangkan 'malam' (lilin) dari kain dengan air panas",
        "Mengeringkan kain di bawah sinar matahari",
        "Menyeterika kain agar rapi"
      ],
      correctAnswer: 1,
      timeLimit: 25,
      explanation: "Tepat! Setelah kain diwarnai, 'malam' harus dihilangkan (dilorod) agar bagian yang ditutupinya muncul kembali. Proses ini seringkali harus diulang berkali-kali untuk setiap lapisan warna."
    },
    {
      id: 5,
      question: "Mengapa dalam proses pewarnaan tradisional, kain seringkali dicelup berulang kali dalam satu warna?",
      options: [
        "Agar kainnya lebih berat",
        "Agar warnanya meresap ke serat kain secara permanen (tahan lama)",
        "Agar menghemat pewarna",
        "Karena perajin lupa sudah berapa kali"
      ],
      correctAnswer: 1,
      timeLimit: 30,
      explanation: "Benar. Pewarnaan alami (natural dye) butuh kesabaran. Kain dicelup, diangin-anginkan, dicelup lagi, berhari-hari. Proses berulang ini membuat warna meresap sempurna dan tahan lama, berbeda dengan pewarna tekstil pabrik yang instan namun (seringkali) tidak ramah lingkungan."
    }
  ],
  level2: [
    {
      id: 6,
      question: "Apa perbedaan fundamental antara 'Batik Tulis' dengan 'Kain Motif Batik/Printing'?",
      options: [
        "Tidak ada bedanya, sama-sama batik",
        "Batik Tulis dibuat dengan 'malam' (lilin) sebagai perintang warna, Batik Printing dicetak mesin",
        "Batik Tulis lebih mahal, Batik Printing lebih murah",
        "B dan C benar"
      ],
      correctAnswer: 3,
      timeLimit: 30,
      explanation: "Tepat. Batik Tulis adalah karya seni (prosesnya menggunakan 'malam'). Batik Printing adalah tekstil pabrikan (seperti print kaos). Perbedaan proses inilah yang menciptakan perbedaan nilai yang sangat jauh."
    },
    {
      id: 7,
      question: "Mana dari pernyataan berikut yang paling tepat?",
      options: [
        "Batik Tulis, Batik Cap, dan Batik Printing adalah jenis batik yang setara",
        "Hanya Batik Tulis dan Batik Cap yang merupakan 'Batik' (karena menggunakan 'malam')",
        "Batik Printing adalah batik modern",
        "Batik Tulis sudah kuno dan tidak relevan"
      ],
      correctAnswer: 1,
      timeLimit: 30,
      explanation: "Ini penting! Menurut definisi UNESCO, 'Batik' adalah proses yang menggunakan lilin (malam) sebagai perintang warna. Batik Printing tidak menggunakan 'malam', sehingga ia hanyalah 'Tekstil Bermotif Batik'."
    },
    {
      id: 8,
      question: "Apa ciri fisik paling mudah untuk membedakan Batik Tulis Asli dengan Batik Printing (Pabrikan)?",
      options: [
        "Batik Tulis warnanya selalu cokelat (sogan)",
        "Batik Printing selalu rapi sempurna dan warnanya hanya satu sisi (sisi belakang pudar)",
        "Batik Tulis selalu ada tanda tangan perajinnya",
        "Batik Tulis tidak boleh disetrika"
      ],
      correctAnswer: 1,
      timeLimit: 25,
      explanation: "Lihatlah sisi belakang kain! Batik Printing 99% pasti pudar/putih di baliknya. Batik Tulis (karena dilukis) 'malam'-nya akan tembus, sehingga sisi depan dan belakang warnanya sama-sama hidup."
    },
    {
      id: 9,
      question: "Mengapa pembelian Kain Motif Batik/Printing yang seringkali mengaku sebagai batik, sangat merugikan perajin Batik Tulis?",
      options: [
        "Karena membuat perajin jadi malas",
        "Karena merusak harga pasar dan 'mencuri' konsumen yang tidak teredukasi",
        "Karena bahan pewarna printing membuat polusi",
        "Karena motifnya selalu meniru"
      ],
      correctAnswer: 1,
      timeLimit: 30,
      explanation: "Inilah masalah utamanya. Perajin yang mdedikasikan 3 bulan hidupnya (nilai karya Rp 3 juta) harus bersaing di rak yang sama dengan tekstil pabrikan (nilai produksi Rp 30 ribu). Ini adalah kompetisi yang tidak adil."
    },
    {
      id: 10,
      question: "Pada tahun 2009, UNESCO menetapkan Batik Indonesia sebagai...",
      options: [
        "Warisan Dunia (World Heritage)",
        "Karya Agung Warisan Budaya Lisan dan Takbenda Manusia (Masterpiece of the Oral and Intangible Heritage of Humanity)",
        "Salah satu dari Tujuh Keajaiban Dunia",
        "Pakaian Tradisional Paling Rumit"
      ],
      correctAnswer: 1,
      timeLimit: 30,
      explanation: "Tepat! Pengakuan ini diberikan bukan hanya pada 'kain'-nya, tetapi pada keseluruhan 'proses', 'filosofi', dan 'budaya' yang hidup di sekitarnya, yang diwariskan turun-temurun."
    }
  ],
  level3: [
    {
      id: 11,
      question: "Apa masalah terbesar yang dihadapi perajin Batik Tulis saat ini, yang mengancam keberlangsungan budaya ini?",
      options: [
        "Kekurangan pasokan 'malam' dan canting",
        "Kurangnya pengakuan dari luar negeri",
        "Rendahnya kesejahteraan (pendapatan) yang membuat regenerasi perajin terhambat",
        "Terlalu banyak turis yang berkunjung"
      ],
      correctAnswer: 2,
      timeLimit: 30,
      explanation: "Ini adalah fakta yang menyedihkan. Kita memuji batik sebagai warisan luhur, namun banyak perajinnya hidup dalam kemiskinan. Kesejahteraan mereka adalah kunci utama pelestarian."
    },
    {
      id: 12,
      question: "Perajin batik tulis adalah seorang 'seniman'. Goresan cantingnya memiliki 'rasa' dan 'jiwa'. Apa yang membedakan goresan tangannya dengan mesin printing?",
      options: [
        "Goresan tangan tidak bisa rapi sempurna, ada 'cacat' indah yang manusiawi",
        "Goresan tangan selalu lurus sempurna",
        "Goresan tangan lebih tebal",
        "Goresan tangan tidak tembus"
      ],
      correctAnswer: 0,
      timeLimit: 30,
      explanation: "Tepat! Dalam Batik Tulis, ada istilah 'ada tumpahan 'malam' yang bercerita'. Ketidaksempurnaan yang artistik inilah yang membuatnya 'hidup' dan bernilai tinggi."
    },
    {
      id: 13,
      question: "Di Giriloyo, Yogyakarta, ratusan perajin perempuan mdedikasikan hidupnya untuk Batik Tulis. Dengan membeli karya mereka, Anda membantu...",
      options: [
        "Membuat mereka cepat kaya raya",
        "Memberdayakan ekonomi perempuan dan komunitas",
        "Menghabiskan stok 'malam' mereka",
        "Menjaga tradisi tanpa memberi dampak ekonomi"
      ],
      correctAnswer: 1,
      timeLimit: 30,
      explanation: "Benar. Pembelian Anda berdampak langsung. Anda tidak hanya membeli kain, Anda memberi upah yang adil, memberdayakan perempuan, dan menjaga dapur mereka tetap 'ngebul'."
    },
    {
      id: 14,
      question: "Setelah memahami proses, filosofi, dan urgensinya, apa cara terbaik Anda untuk ikut melestarikan Batik Tulis?",
      options: [
        "Menawar harga Batik Tulis semurah mungkin agar laku keras",
        "Hanya membeli 'Kain Motif Batik/Printing' karena lebih murah dan praktis",
        "Bangga membeli Batik Tulis Asli dengan harga yang pantas, dan menceritakan nilainya",
        "Menyimpan kuis ini untuk diri sendiri"
      ],
      correctAnswer: 2,
      timeLimit: 30,
      explanation: "INILAH JAWABANNYA! Jadilah 'Konsumen Sadar'. Dengan membeli karya asli dan menghargai perajinnya secara adil, Anda telah menjadi pahlawan pelestari budaya yang sesungguhnya."
    },
    {
      id: 15,
      question: "Apa yang membuat Batik Tulis memiliki nilai seni yang tidak bisa ditiru oleh mesin?",
      options: [
        "Setiap goresan mengandung cerita dan emosi perajinnya",
        "Harganya yang sangat mahal",
        "Warnanya yang lebih cerah",
        "Motifnya yang selalu sama"
      ],
      correctAnswer: 0,
      timeLimit: 30,
      explanation: "Benar! Batik Tulis adalah mahakarya yang lahir dari hati dan jiwa perajin. Setiap helainya unik, mengandung cerita, doa, dan cinta yang tidak akan pernah bisa direproduksi mesin."
    }
  ]
};

export default quizQuestions;