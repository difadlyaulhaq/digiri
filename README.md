# 🏛️ GiriloyoVerse

![GiriloyoVerse Banner]([public/logo-web.png])

> **Warisan Budaya Bertemu Teknologi Masa Depan.**
> Platform *Phygital* (Physical + Digital) untuk pelestarian, edukasi, dan perdagangan Batik Tulis Giriloyo yang diakui UNESCO.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

## 📖 Tentang Proyek

**GiriloyoVerse** adalah aplikasi web imersif yang mengangkat Desa Wisata Batik Giriloyo ke ranah digital. Proyek ini bukan sekadar *e-commerce*, melainkan ekosistem edukasi dan pelestarian budaya yang menggabungkan pengalaman nyata dengan teknologi blockchain dan AI.

Visi utama kami adalah konsep **"Phygital"**: Setiap pembelian fisik Batik Tulis akan disertai dengan sertifikat keaslian digital dalam bentuk **NFT** (Non-Fungible Token).

### ✨ Fitur Utama

* **🛍️ Marketplace Phygital & NFT**: Katalog batik tulis eksklusif. Beli batiknya, dapatkan NFT-nya secara otomatis (via Crossmint API) sebagai bukti keaslian abadi.
* **🤖 AI Insight (Asisten Pakar Batik)**: Bingung pilih motif? AI kami (ditenagai Google Gemini) akan merekomendasikan batik berdasarkan kepribadian dan kebutuhan acara Anda.
* **🎮 Gamifikasi Budaya**:
    * *Mencanting Virtual*: Rasakan sensasi membatik langsung dari browser.
    * *Kuis Cerdas Budaya*: Kompetisi pengetahuan batik interaktif.
* **🏫 Eduwisata Booking System**: Pesan paket wisata (Half Day, Full Day, Study Tour) untuk sekolah atau grup langsung melalui aplikasi.
* **💳 Pembayaran Terintegrasi**: Mendukung QRIS, E-Wallet, dan Transfer Bank (via Midtrans).

## 🛠️ Teknologi yang Digunakan

Proyek ini dibangun dengan *stack* teknologi modern untuk performa tinggi dan pengalaman pengguna yang mulus.

* **Framework**: [Next.js 16](https://nextjs.org/) (Pages Router)
* **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Integrasi (Planned/In-Progress)**:
    * Payment: Midtrans Snap
    * Blockchain/NFT: Crossmint API
    * AI: Google Gemini API

## 🚀 Cara Menjalankan (Getting Started)

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer lokal Anda.

### Prasyarat

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (versi 18 atau lebih baru) dan npm/yarn/pnpm.

### Instalasi

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/username-anda/giriloyoverse.git](https://github.com/username-anda/giriloyoverse.git)
    cd giriloyoverse
    ```

2.  **Instal dependensi:**
    ```bash
    npm install
    # atau
    yarn install
    # atau
    pnpm install
    ```

3.  **Jalankan server pengembangan:**
    ```bash
    npm run dev
    ```

4.  **Buka di browser:**
    Kunjungi [http://localhost:3000](http://localhost:3000) untuk melihat hasilnya.

## 📂 Struktur Proyek

Berikut adalah gambaran struktur folder utama proyek ini:
giriloyoverse/ ├── components/ # Komponen UI yang dapat digunakan kembali (Navbar, Footer, dll) ├── pages/ # Halaman aplikasi (Next.js Pages Router) │ ├── api/ # API Routes (Backend serverless) │ ├── bookingwisatapage.tsx # Halaman Booking Eduwisata │ ├── checkoutpage.tsx # Halaman Pembayaran & Form │ ├── index.tsx # Landing Page Utama │ └── productdetailpage.tsx # Detail Produk & Zoom Gambar ├── public/ # Aset statis (Gambar Batik, Logo, Icon) ├── styles/ # File CSS global └── ...konfigurasi (tailwind, tsconfig, eslint, package.json)
## 🗺️ Roadmap Pengembangan

- [x] **Fase 1: UI/UX & Frontend Core** (Landing Page, Katalog, Detail Produk).
- [x] **Fase 2: Sistem Booking** (Formulir pemesanan paket wisata).
- [ ] **Fase 3: Integrasi Backend** (NestJS setup, Database PostgreSQL).
- [ ] **Fase 4: Payment Gateway** (Integrasi Midtrans Snap).
- [ ] **Fase 5: Web3 & AI** (Integrasi Crossmint NFT Minting & Gemini AI).

## 🤝 Berkontribusi

Kontribusi sangat diterima! Jika Anda ingin membantu melestarikan budaya batik melalui kode:

1.  *Fork* repositori ini.
2.  Buat *branch* fitur baru (`git checkout -b fitur-keren`).
3.  *Commit* perubahan Anda (`git commit -m 'Menambahkan fitur keren'`).
4.  *Push* ke branch tersebut (`git push origin fitur-keren`).
5.  Buat *Pull Request*.

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<div align="center">
  <p>Dibuat dengan ❤️ dan ☕ di Yogyakarta</p>
  <p><b>Melestarikan Budaya, Satu Baris Kode Sekaligus.</b></p>
</div>
