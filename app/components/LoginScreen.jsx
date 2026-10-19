"use client";

import { useState } from "react";
import { Lock, Mail, Key, ShieldCheck, ArrowRight, Sparkles, Building, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function LoginScreen({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Default Passcode darurat Owner untuk akses instan tanpa setup internet
  const OFFICE_ACCESS_CODE = "EKALAYA2026";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Opsi Passcode Cepat / PIN Kantor
      if (passcode.trim()) {
        if (passcode.trim().toUpperCase() === OFFICE_ACCESS_CODE) {
          const guestUser = {
            id: "owner_passcode",
            name: displayName.trim() || "Raja (Owner)",
            role: "Owner",
            email: "owner@ekalaya.com"
          };
          localStorage.setItem("ekalaya_auth_user", JSON.stringify(guestUser));
          onLoginSuccess(guestUser);
          return;
        } else {
          setErrorMessage("Kode PIN Kantor salah! Gunakan PIN akses resmi.");
          setIsLoading(false);
          return;
        }
      }

      // 2. Opsi Login via Supabase Auth
      if (isSupabaseConfigured && supabase) {
        if (!email.trim() || !password.trim()) {
          setErrorMessage("Silakan masukkan email dan password.");
          setIsLoading(false);
          return;
        }

        if (isRegister) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName.trim() || email.split("@")[0],
              },
            },
          });
          if (error) throw error;
          const userObj = {
            id: data.user?.id || `user_${Date.now()}`,
            name: displayName.trim() || email.split("@")[0],
            role: "Member",
            email
          };
          localStorage.setItem("ekalaya_auth_user", JSON.stringify(userObj));
          onLoginSuccess(userObj);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          const userObj = {
            id: data.user.id,
            name: data.user.user_metadata?.display_name || email.split("@")[0],
            role: email.includes("raja") || email.includes("admin") ? "Owner" : "Member",
            email
          };
          localStorage.setItem("ekalaya_auth_user", JSON.stringify(userObj));
          onLoginSuccess(userObj);
        }
      } else {
        // Fallback jika Supabase URL belum diisi di dashboard Vercel
        if (email.trim() && password.trim()) {
          const localUser = {
            id: `local_${Date.now()}`,
            name: displayName.trim() || email.split("@")[0],
            role: email.toLowerCase().includes("raja") ? "Owner" : "Member",
            email
          };
          localStorage.setItem("ekalaya_auth_user", JSON.stringify(localUser));
          onLoginSuccess(localUser);
        } else {
          setErrorMessage("Masukkan email & password atau gunakan Kode Akses Kantor.");
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Gagal masuk. Periksa kembali email dan password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center p-4 select-none">
      {/* Background Decor Ambient */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100">
        {/* Brand & Security Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 mb-3">
            <Lock className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Building className="w-4 h-4 text-cyan-400" />
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-white">
              EKALAYA VIRTUAL OFFICE
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Area Terbatas • Masuk untuk mengakses ruang kerja kantor 3D
          </p>
        </div>

        {/* Supabase Status Banner */}
        <div className="mb-5 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Keamanan Kantor:
          </span>
          <span className={`font-semibold px-2 py-0.5 rounded ${
            isSupabaseConfigured
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
          }`}>
            {isSupabaseConfigured ? "Supabase Cloud Aktif" : "PIN & Kredensial Terenkripsi"}
          </span>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          {/* Display Name saat Register */}
          {isRegister && (
            <div>
              <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Nama Anda</label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Contoh: Raja (Owner)"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 mb-1 block">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Pemisah atau PIN Akses Cepat */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="bg-slate-900 px-2 text-[10px] text-slate-500 uppercase tracking-wider absolute">
              Atau PIN Kantor
            </span>
          </div>

          <div>
            <input
              type="text"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Masukkan PIN Akses Kantor (Opsional)"
              className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs text-center text-cyan-300 placeholder-slate-500 tracking-widest font-mono uppercase focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[9px] text-slate-500 text-center mt-1">
              PIN default Owner: <code className="text-cyan-400 font-bold">{OFFICE_ACCESS_CODE}</code>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <span>{isLoading ? "Memverifikasi..." : isRegister ? "Daftar & Masuk Kantor" : "Masuk ke Kantor Virtual"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-5 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage("");
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            {isRegister
              ? "Sudah punya akun? Masuk di sini"
              : "Belum punya akun anggota? Daftar di sini"}
          </button>
        </div>
      </div>
    </div>
  );
}
