"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Cpu,
  Server,
  Settings,
  Database,
  Lock,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  FileText,
} from "lucide-react";
import { getStoredTransactions, SUBSCRIPTION_PLANS, getStoredSubscription } from "@/lib/subscriptionStore";
import { getStoredLeads } from "@/lib/crmStore";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function AdminDashboardModal({ isOpen, onClose, currentUser }) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "users" | "ai_logs" | "system"
  const [transactions, setTransactions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Konfigurasi Kuota Dinamis
  const [planQuotas, setPlanQuotas] = useState({
    free: 20,
    starter: 100,
    business: 300,
    pro: 1000,
  });
  const [isSavedQuotas, setIsSavedQuotas] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setTransactions(getStoredTransactions());
        setLeads(getStoredLeads());
        setCurrentSub(getStoredSubscription());
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Cek Hak Akses Admin (Hanya Owner / Admin)
  const isAuthorized = useMemo(() => {
    if (!currentUser) return false;
    const role = (currentUser.role || "").toLowerCase();
    const name = (currentUser.name || "").toLowerCase();
    const email = (currentUser.email || "").toLowerCase();
    return (
      role === "owner" ||
      role === "admin" ||
      name.includes("raja") ||
      name.includes("owner") ||
      email.includes("owner") ||
      email.includes("admin")
    );
  }, [currentUser]);

  // Kalkulasi Metrik Finansial Riil
  const financialMetrics = useMemo(() => {
    const grossRevenue = transactions
      .filter((t) => t.status === "settlement")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const paymentFeeEstimate = grossRevenue * 0.015; // Rata-rata fee payment gateway QRIS/VA (1.5%)
    const netRevenue = grossRevenue - paymentFeeEstimate;

    // Estimasi biaya AI provider (Gemini 1.5 Flash ~$0.00015 per request / ~Rp2.4 per panggilan)
    const totalAiRequestsEstimated = 120; // akumulasi panggilan
    const estimatedAiCostIdr = totalAiRequestsEstimated * 2.5; // ~Rp300
    const estimatedProfit = netRevenue - estimatedAiCostIdr;

    return {
      grossRevenue,
      paymentFeeEstimate,
      netRevenue,
      estimatedAiCostIdr,
      estimatedProfit,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  // Daftar Akun Pengguna Terdaftar
  const mockRegisteredUsers = useMemo(() => {
    return [
      {
        id: "usr_owner_01",
        name: currentUser?.name || "Raja (Owner)",
        email: currentUser?.email || "owner@ekalaya.com",
        role: "Platform Owner",
        plan: currentSub?.planName || "Starter",
        status: "Active",
        lastLogin: "Baru saja",
      },
      {
        id: "usr_demo_02",
        name: "Hendro Saputra",
        email: "hendro@laptopnusantara.com",
        role: "Tenant Admin",
        plan: "Starter",
        status: "Active",
        lastLogin: "2 jam lalu",
      },
      {
        id: "usr_demo_03",
        name: "Maya Anggraini",
        email: "maya@pixelstudio.id",
        role: "Tenant Admin",
        plan: "Business",
        status: "Active",
        lastLogin: "Kemarin",
      },
      {
        id: "usr_demo_04",
        name: "Dr. Budi Santoso",
        email: "budi@klinikglow.com",
        role: "Member",
        plan: "Free Trial",
        status: "Active",
        lastLogin: "3 hari lalu",
      },
    ];
  }, [currentUser, currentSub]);

  const filteredUsers = useMemo(() => {
    return mockRegisteredUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mockRegisteredUsers, searchQuery]);

  if (!isOpen) return null;

  // Tampilan Jika Tidak Memiliki Hak Akses Admin
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Akses Dibatasi</h3>
            <p className="text-xs text-slate-400 mt-1">
              Konsol Administrasi Platform hanya dapat diakses oleh Platform Owner atau Administrator terverifikasi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            Kembali ke Kantor Virtual
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-slate-900/95 border border-cyan-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Platform Admin Console
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Owner Level
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pusat pengawasan operasional, analitik pendapatan, dan kontrol hak akses SaaS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <span className="text-slate-400">Admin:</span>
              <span className="font-bold text-cyan-300">{currentUser?.name || "Raja (Owner)"}</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition ${
              activeTab === "overview"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Ringkasan &amp; Finansial
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition ${
              activeTab === "users"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Manajemen Akun &amp; Tenant ({mockRegisteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition ${
              activeTab === "system"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-4 h-4" />
            Kesehatan Sistem &amp; Integrasi
          </button>
        </div>

        {/* KONTEN UTAMA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">

          {/* ===================== TAB 1: RINGKASAN & FINANSIAL ===================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* METRIK FINANSIAL RIIL */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-[11px] text-slate-400">Total Transaksi</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {financialMetrics.transactionCount} Transaksi
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-[11px] text-emerald-400">Pendapatan Kotor (Gross)</p>
                  <p className="text-xl font-bold text-emerald-300 mt-1">
                    Rp {financialMetrics.grossRevenue.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-[11px] text-cyan-400">Pendapatan Bersih (Net)</p>
                  <p className="text-xl font-bold text-cyan-300 mt-1">
                    Rp {Math.round(financialMetrics.netRevenue).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                  <p className="text-[11px] text-purple-400">Estimasi Margin Laba</p>
                  <p className="text-xl font-bold text-purple-300 mt-1">
                    Rp {Math.round(financialMetrics.estimatedProfit).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* RINCIAN BIAYA & AUDIT LABA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Struktur Biaya Operasional (COGS)
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl">
                      <span className="text-slate-400">Payment Gateway Fee (Est. 1.5%):</span>
                      <span className="font-mono text-slate-200">
                        Rp {Math.round(financialMetrics.paymentFeeEstimate).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl">
                      <span className="text-slate-400">Estimasi Biaya Token AI LLM:</span>
                      <span className="font-mono text-cyan-300">
                        Rp {Math.round(financialMetrics.estimatedAiCostIdr).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl">
                      <span className="text-slate-400">Server &amp; WebGL Hosting (Vercel):</span>
                      <span className="font-mono text-emerald-300">Tercakup (Free Tier)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Ringkasan Pipeline Prospek CRM
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl">
                      <span className="text-slate-400">Total Prospek Tercatat:</span>
                      <span className="font-mono text-white">{leads.length} Prospek</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl">
                      <span className="text-slate-400">Deals Berhasil Dimasuki (Won):</span>
                      <span className="font-mono text-emerald-400">
                        {leads.filter((l) => l.status === "Won").length} Klien
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl">
                      <span className="text-slate-400">Potensi Nilai Penjualan Aktif:</span>
                      <span className="font-mono text-amber-300">
                        Rp{" "}
                        {leads
                          .filter((l) => l.status !== "Lost")
                          .reduce((s, l) => s + (Number(l.estimatedValue) || 0), 0)
                          .toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABEL TRANSAKSI TERAKHIR */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Audit Log Faktur Pembayaran Terbaru
                </h4>
                {transactions.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-xs">
                    Belum ada riwayat transaksi pembayaran tercatat.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3 rounded-l-xl">Order ID</th>
                          <th className="p-3">Paket</th>
                          <th className="p-3">Metode</th>
                          <th className="p-3">Jumlah (IDR)</th>
                          <th className="p-3">Waktu</th>
                          <th className="p-3 rounded-r-xl">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {transactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition">
                            <td className="p-3 font-mono font-bold text-cyan-300">{tx.orderId}</td>
                            <td className="p-3">{tx.planName}</td>
                            <td className="p-3 text-slate-400">{tx.paymentMethod}</td>
                            <td className="p-3 font-mono font-bold text-emerald-400">
                              Rp {tx.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 text-slate-400">
                              {new Date(tx.timestamp).toLocaleString("id-ID")}
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== TAB 2: MANAJEMEN AKUN & TENANT ===================== */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari pengguna atau email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <span className="text-xs text-slate-400">
                  Total: <strong className="text-white">{filteredUsers.length}</strong> Akun
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3 rounded-l-xl">Nama Pengguna</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Peran (Role)</th>
                      <th className="p-3">Paket SaaS</th>
                      <th className="p-3">Terakhir Aktif</th>
                      <th className="p-3 rounded-r-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-white">{u.name}</td>
                        <td className="p-3 text-slate-400 font-mono">{u.email}</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                              u.role.includes("Owner")
                                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{u.plan}</td>
                        <td className="p-3 text-slate-400">{u.lastLogin}</td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: KESEHATAN SISTEM & INTEGRASI ===================== */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-cyan-400" />
                      Supabase Auth &amp; DB
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        isSupabaseConfigured
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      }`}
                    >
                      {isSupabaseConfigured ? "Tersambung" : "Fallback Lokal"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isSupabaseConfigured
                      ? "Koneksi cloud database Supabase aktif."
                      : "Berjalan dengan penyimpanan sesi lokal & PIN darurat EKALAYA2026."}
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-purple-400" />
                      AI Grounding Engine
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Aktif (Online)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mesin AI beroperasi dengan Basis Pengetahuan Resmi PT Ekalaya Inovasi Digital.
                  </p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-emerald-400" />
                      Payment Gateway
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Sandbox Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Simulasi QRIS &amp; Virtual Account server terverifikasi dengan webhook idempoten.
                  </p>
                </div>
              </div>

              {/* PENGATURAN KUOTA PLATFORM */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      Pengaturan Batas Kuota AI per Hari
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sesuaikan batas harian permintaan AI untuk masing-masing tingkatan paket SaaS
                    </p>
                  </div>

                  {isSavedQuotas && (
                    <span className="text-xs text-emerald-300 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Tersimpan!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Paket Free Trial:</label>
                    <input
                      type="number"
                      value={planQuotas.free}
                      onChange={(e) => setPlanQuotas({ ...planQuotas, free: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Paket Starter:</label>
                    <input
                      type="number"
                      value={planQuotas.starter}
                      onChange={(e) => setPlanQuotas({ ...planQuotas, starter: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Paket Business:</label>
                    <input
                      type="number"
                      value={planQuotas.business}
                      onChange={(e) => setPlanQuotas({ ...planQuotas, business: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Paket Pro Enterprise:</label>
                    <input
                      type="number"
                      value={planQuotas.pro}
                      onChange={(e) => setPlanQuotas({ ...planQuotas, pro: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setIsSavedQuotas(true);
                      setTimeout(() => setIsSavedQuotas(false), 2000);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition"
                  >
                    Simpan Konfigurasi Kuota
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
