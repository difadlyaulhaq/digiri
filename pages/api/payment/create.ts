// pages/api/payment/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
const midtransClient = require('midtrans-client');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { orderId, amount, customerDetails, items, shipping, nftFee } = req.body;

  // Validasi input
  if (!orderId || !amount || !customerDetails || !items) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create Snap API instance
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    // Hitung ulang total dari item details untuk memastikan consistency
    const itemsTotal = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const shippingCost = shipping || 25000;
    const nftCost = nftFee || 0;
    const calculatedTotal = itemsTotal + shippingCost + nftCost;

    console.log('🔢 Amount calculations:', {
      itemsTotal,
      shippingCost,
      nftCost,
      calculatedTotal,
      receivedAmount: amount
    });

    // Siapkan item details untuk Midtrans
    const itemDetails = [
      // Items produk
      ...items.map((item: any) => ({
        id: item.id.toString(),
        price: item.price,
        quantity: item.quantity,
        name: `${item.name} (${item.size}, ${item.color})`,
        brand: 'Desa Wisata Batik Giriloyo',
        category: 'Batik',
        merchant_name: 'Desa Wisata Batik Giriloyo'
      })),
      // Biaya pengiriman
      {
        id: 'shipping',
        price: shippingCost,
        quantity: 1,
        name: 'Biaya Pengiriman',
        category: 'Shipping'
      },
      // Biaya NFT (jika ada)
      ...(nftCost > 0 ? [{
        id: 'nft',
        price: nftCost,
        quantity: 1,
        name: 'NFT Certificate',
        category: 'Digital'
      }] : [])
    ];

    // Validasi: pastikan gross_amount sama dengan total item details
    const itemDetailsTotal = itemDetails.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    if (Math.abs(calculatedTotal - itemDetailsTotal) > 100) {
      console.warn('⚠️  Amount mismatch, using calculated total');
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: calculatedTotal, // Gunakan calculated total
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: customerDetails.name.split(' ')[0] || customerDetails.name,
        last_name: customerDetails.name.split(' ').slice(1).join(' ') || '',
        email: customerDetails.email,
        phone: customerDetails.phone,
        billing_address: {
          first_name: customerDetails.name.split(' ')[0] || customerDetails.name,
          last_name: customerDetails.name.split(' ').slice(1).join(' ') || '',
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerDetails.address,
          city: customerDetails.city,
          postal_code: customerDetails.postalCode,
          country_code: 'IDN'
        },
        shipping_address: {
          first_name: customerDetails.name.split(' ')[0] || customerDetails.name,
          last_name: customerDetails.name.split(' ').slice(1).join(' ') || '',
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerDetails.address,
          city: customerDetails.city,
          postal_code: customerDetails.postalCode,
          country_code: 'IDN'
        }
      },
      item_details: itemDetails,
            callbacks: {
        finish: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/success`,
        error: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/error`,
        pending: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/checkout/pending`
      }
    };

    console.log('🔄 Creating Midtrans transaction:', {
      orderId,
      gross_amount: calculatedTotal,
      item_count: itemDetails.length,
      item_total: itemDetailsTotal
    });

    const transaction = await snap.createTransaction(parameter);
    
    console.log('✅ Midtrans transaction created successfully');

    res.status(200).json({
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });

  } catch (error: any) {
    console.error('❌ Midtrans error:', error);
    
    // Berikan error message yang lebih detail
    let errorMessage = 'Failed to create payment transaction';
    if (error.ApiResponse && error.ApiResponse.error_messages) {
      errorMessage = error.ApiResponse.error_messages.join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({ 
      error: errorMessage,
      details: error.ApiResponse || error.message 
    });
  }
}