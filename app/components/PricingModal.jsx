"use client";

import { useState, useEffect } from "react";
import {
  X,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  Clock,
  ArrowRight,
  ExternalLink,
  Receipt,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  SUBSCRIPTION_PLANS,
  getStoredSubscription,
  activateSubscription,
  activateSubscriptionAsync,
  getStoredTransactions,
} from "@/lib/subscriptionStore";

export default function PricingModal({ isOpen, onClose, onSubscriptionUpdated, currentUser }) {
  const [currentSub, setCurrentSub] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("plans"); // "plans" | "history"

  // Checkout State
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isSuccessPaid, setIsSuccessPaid] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        setCurrentSub(getStoredSubscription());
        setTransactions(getStoredTransactions());
        setSelectedPlanId(null);
        setCheckoutData(null);
        setIsSuccessPaid(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Mulai Checkout ke Backend API
  const handleSelectPlan = async (planId) => {
    if (planId === "free") return;
    setIsLoadingCheckout(true);
    setSelectedPlanId(planId);

    try {
      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          customerEmail: currentUser?.email || "customer@ekalaya.com",
          customerName: currentUser?.name || "Pelanggan Ekalaya",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCheckoutData(data);
      } else {
        alert("Gagal memproses checkout: " + (data.error || ""));
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Terjadi kendala saat menghubungi server pembayaran.");
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  // Simulasi Pembayaran Sukses di Mode Sandbox
  const handleSimulateSandboxPayment = async () => {
    if (!checkoutData) return;

    const activated = await activateSubscriptionAsync(
      checkoutData.orderId,
      checkoutData.planId,
      {
        paymentMethod: "QRIS / Virtual Account (Sandbox Simulator)",
      },
      currentUser
    );

    if (activated) {
      setCurrentSub(activated);
      setTransactions(getStoredTransactions());
      setIsSuccessPaid(true);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

      if (onSubscriptionUpdated) {
        onSubscriptionUpdated(activated);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Pilih Paket Langganan Ekalaya AI Office
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Payment Sandbox Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tingkatkan kuota asisten AI dan jumlah anggota tim tanpa batas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Paket Saat Ini */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <span className="text-slate-400">Paket Aktif:</span>
              <span className="font-bold text-cyan-300 capitalize">
                {currentSub?.planName || currentSub?.planId || "Free Trial"}
              </span>
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
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/60">
          <button
            onClick={() => {
              setActiveTab("plans");
              setCheckoutData(null);
              setIsSuccessPaid(false);
            }}
            className={`py-3 px-4 border-b-2 font-medium text-xs sm:text-sm transition ${
              activeTab === "plans"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Pilihan Paket &amp; Upgrade
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm transition ${
              activeTab === "history"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Receipt className="w-4 h-4" />
            Riwayat Pembayaran ({transactions.length})
          </button>
        </div>

        {/* KONTEN UTAMA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">

          {/* ===================== TAB 1: PILIHAN PAKET & CHECKOUT ===================== */}
          {activeTab === "plans" && !checkoutData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(SUBSCRIPTION_PLANS)
                  .filter((p) => p.id !== "free")
                  .map((plan) => {
                    const isCurrent = currentSub?.planId === plan.id;
                    const isBusiness = plan.id === "business";

                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                          isBusiness
                            ? "bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-900 border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/40"
                            : "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                        }`}
                      >
                        {isBusiness && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[10px] tracking-wider uppercase px-3 py-0.5 rounded-full shadow-lg">
                            Paling Populer
                          </span>
                        )}

                        <div className="space-y-4">
                          <div>
                            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                              {plan.name}
                            </span>
                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="text-2xl font-black text-white">
                                Rp {plan.price.toLocaleString("id-ID")}
                              </span>
                              <span className="text-xs text-slate-400">/ bulan</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Kapasitas: <strong className="text-cyan-300">{plan.aiLimitPerDay} Permintaan AI/hari</strong>
                            </p>
                          </div>

                          <div className="space-y-2 border-t border-slate-800/80 pt-3">
                            {plan.features.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800/60">
                          {isCurrent ? (
                            <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                              Paket Aktif Anda Saat Ini
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSelectPlan(plan.id)}
                              disabled={isLoadingCheckout}
                              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg active:scale-95 ${
                                isBusiness
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25"
                                  : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                              }`}
                            >
                              <span>Pilih Paket {plan.name}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* JAMINAN KEAMANAN & SANDBOX NOTICE */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    Metode pembayaran terenkripsi standar Midtrans &amp; Bank Indonesia. Mode Sandbox gratis untuk simulasi tanpa pemotongan saldo.
                  </span>
                </div>
                <span className="text-[11px] text-cyan-400 shrink-0 font-mono">
                  Garansi 7 Hari Uang Kembali
                </span>
              </div>
            </div>
          )}

          {/* ===================== CHECKOUT / INVOICE VIEW ===================== */}
          {activeTab === "plans" && checkoutData && (
            <div className="max-w-xl mx-auto bg-slate-800/50 border border-cyan-500/40 rounded-3xl p-6 space-y-6 shadow-2xl">
              {!isSuccessPaid ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                        Invoice Tagihan Resmi
                      </span>
                      <h3 className="text-base font-bold text-white">{checkoutData.orderId}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Total Pembayaran:</span>
                      <p className="text-xl font-black text-amber-300">
                        Rp {checkoutData.amount.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* DETAIL PEMBAYARAN SANDBOX */}
                  <div className="space-y-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <QrCode className="w-4 h-4 text-cyan-400" />
                      <span>Instruksi Pembayaran QRIS &amp; Virtual Account</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded-xl">
                        <span className="text-slate-400">BCA Virtual Account:</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {checkoutData.paymentDetails?.bcaVirtualAccount || "880123456789"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-800/60 p-2.5 rounded-xl">
                        <span className="text-slate-400">Mandiri Bill Code:</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {checkoutData.paymentDetails?.mandiriBillCode || "700123456789"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Mode Simulator Sandbox Aktif
                      </p>
                      <p className="text-slate-300">
                        Anda tidak akan dikenakan biaya nyata. Tekan tombol simulasi di bawah untuk menguji verifikasi webhook dan aktivasi otomatis kuota AI secara instan.
                      </p>
                    </div>
                  </div>

                  {/* TOMBOL AKSI */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => setCheckoutData(null)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 transition"
                    >
                      Kembali ke Pilihan Paket
                    </button>

                    <button
                      onClick={handleSimulateSandboxPayment}
                      className="w-full flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Simulasikan Pembayaran Berhasil (Sandbox)
                    </button>
                  </div>
                </>
              ) : (
                /* STATUS PEMBAYARAN BERHASIL */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Pembayaran Terverifikasi! 🎉</h3>
                    <p className="text-xs text-slate-300">
                      Paket <strong>{currentSub?.planName}</strong> telah aktif pada akun Anda.
                    </p>
                    <p className="text-xs text-cyan-300 font-mono">
                      Kuota AI Anda telah ditingkatkan menjadi {currentSub?.aiLimitPerDay} permintaan per hari.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutData(null);
                      onClose();
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition"
                  >
                    Tutup &amp; Mulai Gunakan Fitur
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 2: RIWAYAT TRANSAKSI ===================== */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-xs">
                  Belum ada riwayat transaksi pembayaran.
                </div>
              ) : (
                transactions.map((tx, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-xs text-white">{tx.orderId}</span>
                      <p className="text-xs text-slate-400">
                        {tx.planName} • {tx.paymentMethod}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(tx.timestamp).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">
                        Rp {tx.amount.toLocaleString("id-ID")}
                      </span>
                      <span className="block text-[10px] text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase font-mono">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
