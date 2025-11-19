// frontend/src/lib/syncManager.ts

'use client';

import { 
  getTransactionQueue, 
  clearTransactionQueue, 
  type OfflineTransactionPayload 
} from './offlineStorage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Flag untuk mencegah sinkronisasi ganda
let isSyncing = false;

export const syncPendingTransactions = async () => {
  if (typeof window === 'undefined' || !navigator.onLine || isSyncing) {
    return;
  }

  isSyncing = true;
  console.log('🔄 Memulai sinkronisasi antrean transaksi...');

  const queue = getTransactionQueue();
  if (queue.length === 0) {
    console.log('✅ Tidak ada antrean untuk disinkronisasi.');
    isSyncing = false;
    return;
  }

  console.log(`📤 Menemukan ${queue.length} transaksi di antrean.`);

  const failedTransactions: OfflineTransactionPayload[] = [];
  
  for (const tx of queue) {
    // Mapping ulang agar sesuai dengan Backend Order.js
    const payload = {
      items: tx.items.map(item => ({
        productId: item.productId,
        nama: item.nama,
        harga: item.harga,
        quantity: item.quantity,
        fotoUrl: item.fotoUrl // Field ini harus ada di Backend Schema
      })),
      totalPrice: tx.totalPrice,
      paymentAmount: tx.paymentAmount,
      changeAmount: tx.changeAmount,
      paymentMethod: tx.paymentMethod,
    };

    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Cek pesan error
        const errorData = await res.json();
        console.warn(`❌ Gagal sinkronisasi transaksi ${tx.offlineId}:`, errorData.message);
        failedTransactions.push(tx);
      } else {
        console.log(`✅ Transaksi ${tx.offlineId} berhasil disinkronisasi.`);
      }

    } catch (error) {
      console.error(`❌ Error jaringan saat sinkronisasi ${tx.offlineId}:`, error);
      failedTransactions.push(tx);
    }
  }

  // Simpan kembali transaksi yang gagal ke localStorage
  clearTransactionQueue(); 
  if (failedTransactions.length > 0) {
    localStorage.setItem('transactionQueue', JSON.stringify(failedTransactions)); 
    console.log(`⚠️ ${failedTransactions.length} transaksi gagal disimpan kembali ke antrean.`);
  } else {
    console.log('🎉 Semua antrean berhasil disinkronisasi!');
  }

  isSyncing = false;
};