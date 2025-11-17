// pages/api/test-ai-chat.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import products from '@/data/products';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    // Data produk untuk context
    const productsContext = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      motif: p.motif,
      category: p.category,
      artisan: p.artisan
    }));

    const prompt = `
Anda AI assistant batik. Balas dengan JSON: 
{"response": "jawaban", "recommendedProducts": [id], "type": "recommendation|general|product_info|cs"}

Data produk: ${JSON.stringify(productsContext)}

Pertanyaan: "${message}"

Berikan respon helpful tentang batik.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanText);
      res.status(200).json(parsed);
    } catch {
      res.status(200).json({
        response: cleanText,
        type: 'general'
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      response: "Maaf, AI sedang tidak dapat diakses.",
      type: 'cs',
      error: error.message 
    });
  }
}