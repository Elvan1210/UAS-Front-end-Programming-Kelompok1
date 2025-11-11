'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// --- PERUBAHAN DI SINI ---
// 1. 'User' sekarang punya 'role'
interface User {
  email: string;
  role: 'admin' | 'kasir'; // Tipe role yang spesifik
}

// 2. 'AuthContextType' disesuaikan
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}
// --- AKHIR PERUBAHAN ---

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {}, 
  logout: () => {}, 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userEmail = localStorage.getItem('loggedInUser');
      const token = localStorage.getItem('authToken');
      
      // --- PERUBAHAN DI SINI ---
      // 3. Kita juga ambil 'role' dari localStorage
      const userRole = localStorage.getItem('userRole'); 
      // --- AKHIR PERUBAHAN ---

      // 4. Kita butuh email DAN role untuk login
      if (token && userEmail && userRole) {
        setUser({ 
          email: userEmail, 
          role: userRole as 'admin' | 'kasir' // <-- Set user dengan role
        }); 
      }
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    // Fungsi ini hanya set state. Penyimpanan localStorage
    // akan kita lakukan di halaman login
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('loggedInUser');
    // --- PERUBAHAN DI SINI ---
    // 5. Hapus 'role' saat logout
    localStorage.removeItem('userRole'); 
    // --- AKHIR PERUBAHAN ---
    router.push('/login');
  };

  const value = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);