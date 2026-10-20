"use client";

import { useEffect, useState, useRef } from "react";
import VirtualOffice from "./components/VirtualOffice";
import LoginScreen from "./components/LoginScreen";
import {
  supabase,
  isSupabaseConfigured,
  ensureUserProfile,
  formatUserAuthObject,
} from "@/lib/supabase";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isMountedRef = useRef(true);

  // Periksa sesi Supabase saat aplikasi dibuka / di-refresh, dan pantau perubahannya
  useEffect(() => {
    isMountedRef.current = true;

    // Timeout darurat 3 detik agar pengguna tidak terjebak loading selamanya bila jaringan offline
    const timeoutTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setIsCheckingAuth(false);
      }
    }, 3000);

    const checkAuthAsync = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          // 1. Validasi sesi resmi dari Supabase Auth
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error("Error getSession Supabase:", error.message);
          }

          if (session?.user) {
            // Ambil profil dari public.profiles berdasarkan auth.uid()
            const profile = await ensureUserProfile(session.user);
            const userObj = formatUserAuthObject(session.user, profile, "supabase");
            if (isMountedRef.current) {
              setCurrentUser(userObj);
              try {
                localStorage.setItem("ekalaya_auth_user", JSON.stringify(userObj));
              } catch {}
            }
          } else {
            // Jika tidak ada sesi Supabase, periksa apakah ada sesi PIN darurat sementara
            const hasEmergencyPin = sessionStorage.getItem("ekalaya_emergency_pin");
            if (hasEmergencyPin) {
              const emergencyUser = {
                id: "emergency-pin-session",
                name: "Tamu Darurat (PIN)",
                role: "member", // Role PIN darurat TIDAK BOLEH menjadi Owner
                isEmergencyPin: true,
                authMethod: "emergency_pin",
                email: "emergency@ekalaya.local",
              };
              if (isMountedRef.current) {
                setCurrentUser(emergencyUser);
              }
            } else {
              if (isMountedRef.current) {
                setCurrentUser(null);
                try {
                  localStorage.removeItem("ekalaya_auth_user");
                } catch {}
              }
            }
          }
        } else {
          // Fallback lokal jika Supabase belum dikonfigurasi
          const savedUserStr = localStorage.getItem("ekalaya_auth_user");
          if (savedUserStr) {
            const user = JSON.parse(savedUserStr);
            if (user && user.id) {
              // Pastikan fallback lokal tidak memberikan role owner tanpa Supabase
              user.role = "member";
              setCurrentUser(user);
            }
          }
        }
      } catch (e) {
        console.error("Gagal memeriksa sesi auth:", e);
      } finally {
        if (isMountedRef.current) {
          setIsCheckingAuth(false);
          clearTimeout(timeoutTimer);
        }
      }
    };

    checkAuthAsync();

    // 2. Pantau perubahan status autentikasi Supabase secara real-time
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMountedRef.current) return;

        if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          try {
            localStorage.removeItem("ekalaya_auth_user");
            sessionStorage.removeItem("ekalaya_emergency_pin");
          } catch {}
          return;
        }

        if (session?.user) {
          try {
            const profile = await ensureUserProfile(session.user);
            const userObj = formatUserAuthObject(session.user, profile, "supabase");
            if (isMountedRef.current) {
              setCurrentUser(userObj);
              try {
                localStorage.setItem("ekalaya_auth_user", JSON.stringify(userObj));
              } catch {}
            }
          } catch (err) {
            console.error("Gagal memperbarui profil pengguna dari auth change:", err);
          }
        }
      });
      authListener = data?.subscription;
    }

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutTimer);
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  // 3. Logout harus memanggil supabase.auth.signOut() sebelum membersihkan state
  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Gagal melakukan Supabase signOut:", error.message);
        }
      }
    } catch (e) {
      console.error("Kesalahan saat signOut:", e);
    } finally {
      try {
        localStorage.removeItem("ekalaya_auth_user");
        sessionStorage.removeItem("ekalaya_emergency_pin");
      } catch {}
      setCurrentUser(null);
    }
  };

  // Layar Loading Awal dengan Tombol Bypass Pengaman
  if (isCheckingAuth) {
    return (
      <main className="w-screen h-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xl text-white shadow-xl shadow-cyan-500/25 mb-3 animate-pulse">
          E
        </div>
        <p className="text-xs text-slate-400 font-mono tracking-wider mb-4">MEMERIKSA AKSES KANTOR...</p>
        <button
          type="button"
          onClick={() => setIsCheckingAuth(false)}
          className="text-[11px] text-cyan-400/80 hover:text-cyan-300 hover:underline font-mono tracking-wide"
        >
          Masuk Langsung ke Gerbang Login &rarr;
        </button>
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
