// lib/geminiService.ts
import { GoogleGenAI } from "@google/genai";
import products from '@/data/products';

// API Key - pastikan sudah di set di .env.local
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('GEMINI_API_KEY tidak ditemukan. Pastikan variabel GEMINI_API_KEY sudah di-set di .env.local');
}

// Klien akan mengambil API key dari environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

// Data produk
const getProductsContext = () => {
  return products.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    motif: product.motif,
    category: product.category,
    artisan: product.artisan,
    description: product.description,
    nftIncluded: product.nftIncluded
  }));
};

// TIDAK PERLU INTERFACE RUMIT LAGI
// export interface AIResponse { ... }

export class BatikAIService {
  private productsContext;

  constructor() {
    this.productsContext = getProductsContext();
  }

  // Diubah untuk mengembalikan string biasa
  async sendMessage(userMessage: string): Promise<string> {
    try {
      console.log('Mengirim pesan ke Gemini AI...');
      
      // System prompt baru yang lebih sederhana (Mode CS)
      const systemPrompt = `
Anda adalah Customer Service Assistant untuk Desa Wisata Batik Giriloyo.
Anda ramah, membantu, dan informatif.
Tugas Anda adalah menjawab pertanyaan user dalam bahasa Indonesia.

ANDA MEMILIKI AKSES KE DATA PRODUK KAMI:
${JSON.stringify(this.productsContext, null, 2)}

PERAN ANDA:
1. Jawab pertanyaan umum tentang Desa Wisata Giriloyo.
2. Jawab pertanyaan tentang batik, motif, dan proses pembuatan.
3. Berikan rekomendasi produk jika user meminta. Gunakan data produk di atas sebagai referensi.
4. Jawablah secara natural dan konvensional, seperti seorang CS.
5. JANGAN gunakan format JSON. Berikan jawaban Anda sebagai teks biasa.

PERTANYAAN USER: "${userMessage}"

JAWABAN ANDA (dalam Bahasa Indonesia):
      `.trim();

      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: systemPrompt,
      });

      const responseText = result?.text ?? "Maaf, saya tidak mengerti maksud Anda. Bisa diulangi lagi?";
      console.log('Response dari Gemini:', responseText);

      // Langsung kembalikan teks, tidak perlu parsing JSON
      return responseText;

    } catch (error) {
      console.error(' Error Gemini AI:', error);
      return "Maaf, saat ini saya sedang mengalami gangguan teknis. Silakan hubungi customer service kami langsung untuk bantuan lebih lanjut.";
    }
  }

  // Fungsi getRecommendations() bisa dihapus karena tidak spesifik lagi
  // Cukup panggil sendMessage() untuk semua kebutuhan
}

export const batikAIService = new BatikAIService();