// components/MidtransScript.tsx
import { useEffect } from 'react';

const MidtransScript = () => {
  useEffect(() => {
    // Cek apakah script sudah ada
    const existingScript = document.querySelector('script[src*="midtrans.com"]');
    if (existingScript) {
      return; // Script sudah ada, tidak perlu menambahkan lagi
    }

    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!);
    script.async = true;
    script.onload = () => {
      console.log('✅ Midtrans Snap.js loaded successfully');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Midtrans Snap.js');
    };
    
    document.body.appendChild(script);

    return () => {
      // Hapus script hanya jika komponen unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
};

export default MidtransScript;