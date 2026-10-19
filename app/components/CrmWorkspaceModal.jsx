"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Users,
  Sparkles,
  Bot,
  Plus,
  Search,
  Filter,
  Phone,
  Building,
  TrendingUp,
  CheckCircle,
  Copy,
  ExternalLink,
  BookOpen,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Send,
  Trash2,
  Edit,
  Clock,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  getStoredLeads,
  addLead,
  updateLead,
  deleteLead,
  getLeadStats,
  getDailyQuota,
  incrementQuotaUsage,
  LEAD_STATUSES,
} from "@/lib/crmStore";
import { BUSINESS_KNOWLEDGE_BASE } from "@/lib/knowledgeBase";

export default function CrmWorkspaceModal({ isOpen, onClose, onOpenPricing = null, currentUser }) {
  const [activeTab, setActiveTab] = useState("crm"); // "crm" | "ai" | "kb"
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [quota, setQuota] = useState({ used: 0, remaining: 20, limit: 20 });

  // State Form Tambah/Edit Prospek
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    source: "WhatsApp",
    interest: "Paket Starter (Rp99.000)",
    estimatedValue: 99000,
    status: "New",
    notes: "",
  });

  // State AI Sales Assistant
  const [selectedLeadForAi, setSelectedLeadForAi] = useState(null);
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiProviderInfo, setAiProviderInfo] = useState("");
  const [copiedToast, setCopiedToast] = useState(false);

  // Load leads dan kuota
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      Promise.resolve().then(() => {
        if (!isMounted) return;
        const stored = getStoredLeads();
        setLeads(stored);
        setQuota(getDailyQuota());
        if (stored.length > 0 && !selectedLeadForAi) {
          setSelectedLeadForAi(stored[0]);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedLeadForAi]);

  const stats = useMemo(() => getLeadStats(leads), [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead.phone && lead.phone.includes(searchQuery));
      const matchStatus = statusFilter === "ALL" || lead.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  if (!isOpen) return null;

  // Handle Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingLeadId) {
      const updated = updateLead(editingLeadId, formData);
      setLeads(updated);
    } else {
      const updated = addLead(formData);
      setLeads(updated);
    }

    setIsFormOpen(false);
    setEditingLeadId(null);
    setFormData({
      name: "",
      company: "",
      phone: "",
      source: "WhatsApp",
      interest: "Paket Starter (Rp99.000)",
      estimatedValue: 99000,
      status: "New",
      notes: "",
    });
  };

  const handleEditClick = (lead) => {
    setEditingLeadId(lead.id);
    setFormData({
      name: lead.name,
      company: lead.company || "",
      phone: lead.phone || "",
      source: lead.source || "WhatsApp",
      interest: lead.interest || "Paket Starter",
      estimatedValue: lead.estimatedValue || 99000,
      status: lead.status || "New",
      notes: lead.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (leadId) => {
    if (confirm("Hapus prospek ini dari CRM?")) {
      const updated = deleteLead(leadId);
      setLeads(updated);
      if (selectedLeadForAi?.id === leadId) {
        setSelectedLeadForAi(updated[0] || null);
      }
    }
  };

  const handleStatusChange = (leadId, newStatus) => {
    const updated = updateLead(leadId, { status: newStatus });
    setLeads(updated);
    if (newStatus === "Won") {
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Jalankan AI Sales Assistant
  const runAiAssistant = async (taskType) => {
    if (quota.remaining <= 0) {
      if (
        onOpenPricing &&
        confirm(
          `Kuota harian AI Anda telah habis (${quota.used}/${quota.limit}).\n\nIngin upgrade paket langganan sekarang untuk mendapatkan kuota hingga 100 - 1.000 permintaan per hari?`
        )
      ) {
        onOpenPricing();
      } else {
        alert(`Kuota harian AI Anda telah habis (${quota.used}/${quota.limit}). Kuota akan direset besok.`);
      }
      return;
    }

    setAiLoading(true);
    setAiResult("");
    setAiProviderInfo("");

    try {
      const response = await fetch("/api/ai/sales-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType,
          lead: selectedLeadForAi,
          userQuery: aiCustomPrompt,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAiResult(data.result);
        setAiProviderInfo(data.provider || "Ekalaya Grounding Engine");
        const updatedQuota = incrementQuotaUsage();
        if (updatedQuota) setQuota(updatedQuota);
      } else {
        setAiResult("Gagal mendapatkan respons AI: " + (data.error || "Terjadi kesalahan."));
      }
    } catch (err) {
      console.error("AI error:", err);
      setAiResult("Gagal menghubungi endpoint AI server. Silakan coba kembali.");
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const openWhatsAppDirect = (phone, text) => {
    if (!phone) {
      alert("Nomor telepon prospek belum terisi.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "").replace(/^0/, "62");
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Ekalaya CRM &amp; AI Sales Workspace
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Phase 2 MVP
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pusat manajemen prospek &amp; otomatisasi tindak lanjut penjualan terintegrasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indikator Kuota AI & Tombol Upgrade */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">Kuota AI:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {quota.remaining}/{quota.limit}
                </span>
              </div>
              {onOpenPricing && (
                <button
                  type="button"
                  onClick={onOpenPricing}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:to-cyan-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition shadow-sm"
                  title="Pilih Paket & Upgrade Kuota AI"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Upgrade
                </button>
              )}
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
            onClick={() => setActiveTab("crm")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm transition ${
              activeTab === "crm"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Pipeline &amp; Prospek ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm transition ${
              activeTab === "ai"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            AI Sales Assistant
          </button>
          <button
            onClick={() => setActiveTab("kb")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs sm:text-sm transition ${
              activeTab === "kb"
                ? "border-cyan-400 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Basis Pengetahuan Resmi
          </button>
        </div>

        {/* KONTEN UTAMA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">

          {/* ===================== TAB 1: CRM & PIPELINE ===================== */}
          {activeTab === "crm" && (
            <div className="space-y-6">
              {/* STATS CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                  <p className="text-[11px] text-slate-400">Total Prospek</p>
                  <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                  <p className="text-[11px] text-cyan-400">Pipeline Aktif</p>
                  <p className="text-xl font-bold text-cyan-300 mt-1">{stats.active}</p>
                </div>
                <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                  <p className="text-[11px] text-emerald-400">Deals Menang (Won)</p>
                  <p className="text-xl font-bold text-emerald-300 mt-1">{stats.won}</p>
                </div>
                <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                  <p className="text-[11px] text-amber-400">Potensi Omzet</p>
                  <p className="text-xl font-bold text-amber-300 mt-1">
                    Rp {stats.potentialRevenue.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {/* ACTION BAR: SEARCH, FILTER & TAMBAH */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama, perusahaan, atau WhatsApp..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="ALL">Semua Status</option>
                    {LEAD_STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setEditingLeadId(null);
                    setFormData({
                      name: "",
                      company: "",
                      phone: "",
                      source: "WhatsApp",
                      interest: "Paket Starter (Rp99.000)",
                      estimatedValue: 99000,
                      status: "New",
                      notes: "",
                    });
                    setIsFormOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Prospek
                </button>
              </div>

              {/* DAFTAR LEADS */}
              <div className="space-y-3">
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="text-xs">Tidak ada data prospek yang cocok dengan pencarian.</p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    const statusObj =
                      LEAD_STATUSES.find((s) => s.id === lead.status) || LEAD_STATUSES[0];
                    return (
                      <div
                        key={lead.id}
                        className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white">{lead.name}</span>
                            {lead.company && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {lead.company}
                              </span>
                            )}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusObj.color}`}
                            >
                              {statusObj.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                            {lead.phone && (
                              <span className="flex items-center gap-1 font-mono text-cyan-300">
                                <Phone className="w-3 h-3 text-cyan-400" />
                                {lead.phone}
                              </span>
                            )}
                            <span>Minat: <strong className="text-slate-300">{lead.interest}</strong></span>
                            <span>
                              Nilai: <strong className="text-amber-300">Rp {(lead.estimatedValue || 0).toLocaleString("id-ID")}</strong>
                            </span>
                          </div>

                          {lead.notes && (
                            <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2 rounded-xl mt-2">
                              &ldquo;{lead.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* STATUS DROPDOWN & AKSI */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400"
                          >
                            {LEAD_STATUSES.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.label}
                              </option>
                            ))}
                          </select>

                          <button
                            onClick={() => {
                              setSelectedLeadForAi(lead);
                              setActiveTab("ai");
                              runAiAssistant("followup_draft");
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-medium transition"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            AI Follow-Up
                          </button>

                          <button
                            onClick={() => handleEditClick(lead)}
                            className="p-1.5 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition"
                            title="Edit Prospek"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteClick(lead.id)}
                            className="p-1.5 rounded-xl hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition"
                            title="Hapus Prospek"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ===================== TAB 2: AI SALES ASSISTANT ===================== */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              {/* TARGET PROSPEK SELECTOR */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  1. Pilih Prospek Target untuk Ditindaklanjuti:
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <select
                    value={selectedLeadForAi?.id || ""}
                    onChange={(e) => {
                      const found = leads.find((l) => l.id === e.target.value);
                      setSelectedLeadForAi(found || null);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} {l.company ? `(${l.company})` : ""} — Status: {l.status}
                      </option>
                    ))}
                  </select>

                  {selectedLeadForAi && (
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>WhatsApp:</span>
                      <strong className="text-cyan-300 font-mono">
                        {selectedLeadForAi.phone || "Belum ada nomor"}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK ACTION BUTTONS */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  2. Pilih Tugas Otomasi AI:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => runAiAssistant("followup_draft")}
                    disabled={aiLoading}
                    className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/40 rounded-xl text-cyan-200 text-xs font-medium transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-cyan-400" />
                    Draf Follow-Up WhatsApp
                  </button>

                  <button
                    onClick={() => runAiAssistant("next_step_recommendation")}
                    disabled={aiLoading}
                    className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 text-xs font-medium transition disabled:opacity-50"
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Rekomendasi Langkah Jual
                  </button>

                  <button
                    onClick={() => runAiAssistant("product_query")}
                    disabled={aiLoading}
                    className="flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-200 text-xs font-medium transition disabled:opacity-50"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Tanya Produk &amp; Harga Resmi
                  </button>
                </div>
              </div>

              {/* OUTPUT BOX */}
              <div className="bg-slate-950/70 border border-cyan-500/30 rounded-2xl p-4 shadow-inner space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold text-white">Hasil Draf AI Sales Assistant</span>
                  </div>
                  {aiProviderInfo && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Sumber: {aiProviderInfo}
                    </span>
                  )}
                </div>

                {aiLoading ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
                    <p className="text-xs">
                      Menghasilkan draf personal berbasis Basis Pengetahuan Resmi...
                    </p>
                  </div>
                ) : aiResult ? (
                  <div className="space-y-4">
                    <textarea
                      readOnly
                      rows={6}
                      value={aiResult}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 font-sans focus:outline-none resize-none leading-relaxed"
                    />

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Informasi terverifikasi dari Basis Pengetahuan Ekalaya</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(aiResult)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-xl transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedToast ? "Tersalin!" : "Salin Pesan"}
                        </button>

                        <button
                          onClick={() => openWhatsAppDirect(selectedLeadForAi?.phone, aiResult)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Buka di WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-xs">
                      Klik salah satu tombol tugas di atas untuk membuat draf pesan atau rekomendasi.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== TAB 3: BASIS PENGETAHUAN RESMI ===================== */}
          {activeTab === "kb" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Katalog Paket Langganan Ekalaya AI Office
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  AI Sales Assistant dilatih untuk merekomendasikan harga dan fitur berikut tanpa mengarang:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {BUSINESS_KNOWLEDGE_BASE.plans.map((p) => (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border ${
                        p.id === "business"
                          ? "bg-cyan-950/30 border-cyan-500/50 ring-1 ring-cyan-500/30"
                          : "bg-slate-800/40 border-slate-700/60"
                      } space-y-3`}
                    >
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
                          {p.name}
                        </span>
                        <p className="text-lg font-bold text-white mt-1">
                          {p.priceFormatted || "Gratis"}
                        </p>
                        <p className="text-[11px] text-slate-400">{p.idealFor}</p>
                      </div>

                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {p.features.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* KEBIJAKAN & METODE PEMBAYARAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Metode Pembayaran Resmi
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    {BUSINESS_KNOWLEDGE_BASE.paymentMethods.map((m, idx) => (
                      <li key={idx}>• {m}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Garansi &amp; Keamanan Data
                  </h4>
                  <p className="text-xs text-slate-300">
                    • {BUSINESS_KNOWLEDGE_BASE.guaranteesAndPolicies.refundPolicy}
                  </p>
                  <p className="text-xs text-slate-300">
                    • {BUSINESS_KNOWLEDGE_BASE.guaranteesAndPolicies.trialPolicy}
                  </p>
                  <p className="text-xs text-slate-300">
                    • {BUSINESS_KNOWLEDGE_BASE.guaranteesAndPolicies.dataSecurity}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FORM TAMBAH / EDIT PROSPEK */}
        {isFormOpen && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">
                  {editingLeadId ? "Edit Prospek" : "Tambah Prospek Baru"}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Nama Prospek / PIC *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Budi Santoso"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1">Nama Perusahaan / Toko</label>
                    <input
                      type="text"
                      placeholder="Contoh: Toko Laptop Jaya"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Nomor WhatsApp</label>
                    <input
                      type="text"
                      placeholder="Contoh: 08123456789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1">Minat Paket</label>
                    <select
                      value={formData.interest}
                      onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Paket Starter (Rp99.000)">Paket Starter (Rp99.000)</option>
                      <option value="Paket Business (Rp299.000)">Paket Business (Rp299.000)</option>
                      <option value="Paket Pro (Rp699.000)">Paket Pro (Rp699.000)</option>
                      <option value="Custom Enterprise">Custom Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Status Prospek</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Klien butuh demo kantor 3D hari Kamis..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20"
                  >
                    Simpan Prospek
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
