"use client";

import { useEffect, useState } from "react";
import VirtualOffice from "./components/VirtualOffice";
import LoginScreen from "./components/LoginScreen";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Periksa sesi login saat aplikasi dibuka
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem("ekalaya_auth_user");
      if (savedUserStr) {
        const user = JSON.parse(savedUserStr);
        if (user && user.id) {
          setCurrentUser(user);
        }
      }
    } catch (e) {
      console.error("Gagal membaca auth:", e);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("ekalaya_auth_user");
    } catch (e) {}
    setCurrentUser(null);
  };

  // Layar Loading Awal
  if (isCheckingAuth) {
    return (
      <main className="w-screen h-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xl text-white shadow-xl shadow-cyan-500/25 mb-3 animate-pulse">
          E
        </div>
        <p className="text-xs text-slate-400 font-mono tracking-wider">MEMERIKSA AKSES KANTOR...</p>
      </main>
    );
  }

  // Jika belum login, tampilkan LoginScreen pengaman kantor
  if (!currentUser) {
    return (
      <main className="w-screen h-screen overflow-hidden bg-slate-950">
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </main>
    );
  }

  // Jika sudah terverifikasi, buka Kantor Virtual 3D
  return (
    <main className="w-screen h-screen overflow-hidden bg-slate-950">
      <VirtualOffice currentUser={currentUser} onLogout={handleLogout} />
    </main>
  );
}
