// frontend/src/lib/offlineStorage.ts

'use client';

// ======================
// TIPE DATA
// ======================

// Tipe data dari kasir/page.tsx
interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  gambar: string;
}

// Tipe data transaksi yang akan kita simpan
// Disesuaikan dengan Schema Backend Order.js
export interface OfflineTransactionPayload {
  offlineId: string;
  cashierName: string;
  items: {
    productId: string;
    nama: string;
    harga: number;
    quantity: number;
    fotoUrl: string; // Disesuaikan dengan backend (fotoUrl), bukan gambar
  }[];
  totalPrice: number;
  paymentAmount: number;
  changeAmount: number;
  paymentMethod: string;
  createdAt: string;
}

// ======================
// KONSTANTA KEY LOCALSTORAGE
// ======================
const MENU_CACHE_KEY = 'menuCache';
const TRANSACTION_QUEUE_KEY = 'transactionQueue';
const TRANSACTION_HISTORY_KEY = 'transactionHistory';

// ======================
// HELPER UNTUK LOCALSTORAGE
// ======================
const setItem = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const getItem = (key: string) => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  return null;
};

// ======================
// MENU CACHE
// ======================
export const saveMenusToCache = (menus: Product[]) => {
  setItem(MENU_CACHE_KEY, menus);
  console.log('✅ Cache menu berhasil disimpan.');
};

export const getMenusFromCache = (): Product[] | null => {
  return getItem(MENU_CACHE_KEY);
};

// ======================
// ANTREAN TRANSAKSI OFFLINE
// ======================
export const getTransactionQueue = (): OfflineTransactionPayload[] => {
  return getItem(TRANSACTION_QUEUE_KEY) || [];
};

export const saveTransactionToQueue = (transactionData: OfflineTransactionPayload) => {
  const queue = getTransactionQueue();
  queue.push(transactionData);
  setItem(TRANSACTION_QUEUE_KEY, queue);
  console.log('💾 Transaksi disimpan ke antrean offline:', transactionData.offlineId);
};

export const clearTransactionQueue = () => {
  setItem(TRANSACTION_QUEUE_KEY, []);
  console.log('🗑️ Antrean transaksi offline berhasil dikosongkan.');
};

// ======================
// CACHE HISTORY TRANSAKSI
// ======================

export const saveHistoryToCache = (history: OfflineTransactionPayload[]) => {
  setItem(TRANSACTION_HISTORY_KEY, history);
  console.log('✅ Riwayat transaksi disimpan ke cache lokal.');
};

export const getHistoryFromCache = (): OfflineTransactionPayload[] | null => {
  const data = getItem(TRANSACTION_HISTORY_KEY);
  if (data) {
    console.log('📦 Riwayat transaksi diambil dari cache lokal.');
  } else {
    console.log('⚠️ Tidak ada riwayat transaksi di cache.');
  }
  return data;
};

export const clearHistoryCache = () => {
  setItem(TRANSACTION_HISTORY_KEY, []);
  console.log('🗑️ Riwayat transaksi dihapus dari cache lokal.');
};