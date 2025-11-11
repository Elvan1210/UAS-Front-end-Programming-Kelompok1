// frontend/src/components/NetworkStatusHandler.tsx

'use client';

import { useEffect } from 'react';
import { syncPendingTransactions } from '@/lib/syncManager';

export function NetworkStatusHandler() {
  
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Koneksi kembali online. Memeriksa antrean...');
      syncPendingTransactions();
    };

    const handleOffline = () => {
      console.log('📵 Koneksi terputus. Mode offline aktif.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Coba sinkronisasi saat app load, jika sedang online
    if (navigator.onLine) {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Komponen ini tidak merender apapun ke UI
  return null;
}