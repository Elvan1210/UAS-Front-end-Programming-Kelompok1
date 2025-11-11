// frontend/src/lib/offlineStorage.ts

'use client';

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
export interface OfflineTransactionPayload {
  offlineId: string; // ID unik untuk local, misal timestamp
  cashierName: string;
  items: {
    productId: string;
    nama: string;
    harga: number;
    quantity: number;
  }[];
  totalPrice: number;
  paymentAmount: number;
  changeAmount: number;
  paymentMethod: string;
  createdAt: string; 
}

const MENU_CACHE_KEY = 'menuCache';
const TRANSACTION_QUEUE_KEY = 'transactionQueue';

// --- Helper untuk localStorage ---
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

// --- Fungsi untuk Menu ---
export const saveMenusToCache = (menus: Product[]) => {
  setItem(MENU_CACHE_KEY, menus);
  console.log('✅ Cache menu berhasil disimpan.');
};

export const getMenusFromCache = (): Product[] | null => {
  return getItem(MENU_CACHE_KEY);
};

// --- Fungsi untuk Antrean Transaksi ---
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