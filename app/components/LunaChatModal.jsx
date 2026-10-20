"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Search,
  TrendingUp,
  Package,
  FileText,
  RotateCcw,
  Zap,
} from "lucide-react";
import { getStoredLeads } from "@/lib/crmStore";

/**
 * LunaChatModal — Karakter AI Sales Assistant Fungsional
 * Memenuhi Spesifikasi Konsep 3:
 * - Panel interaksi chat responsif (Desktop & Mobile)
 * - State machine karakter: idle, listening, thinking, speaking, working, completed, error
 * - Structured task result panel (Search Leads, Lead Summary, Product Info, Draft Follow-up)
 * - Integrasi ke POST /api/ai/character (n8n / Grounded Knowledge Base)
 */
export default function LunaChatModal({
  isOpen,
  onClose,
  currentUser = null,
  activeSubscription = null,
  onCharacterStateChange = null,
  onOpenCrmWorkspace = null,
}) {
  const [characterState, setCharacterState] = useState("idle"); // idle, listening, thinking, speaking, working, completed, error
  const [messages, setMessages] = useState([
    {
      id: "init_1",
      sender: "luna",
      text: "Halo! Saya Luna, AI Sales Assistant resmi Ekalaya Office. 💼✨\nSaya dapat membantu Anda mengecek pipeline CRM, menyusun draf pesan WhatsApp follow-up, serta melihat katalog paket bisnis.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeTaskResult, setActiveTaskResult] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll ke pesan terbaru
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTaskResult, isOpen]);

  // Sinkronkan state karakter ke 3D animation di Three.js jika ada callback
  const updateCharacterState = (newState) => {
    setCharacterState(newState);
    if (onCharacterStateChange) {
      onCharacterStateChange(newState);
    }
  };

  if (!isOpen) return null;

  // Kirim pesan ke POST /api/ai/character
  const handleSendMessage = async (textToSend = null, actionPayload = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsgId = "user_" + Date.now();
    const newMsg = {
      id: userMsgId,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
    updateCharacterState("thinking");

    try {
      const response = await fetch("/api/ai/character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: "npc-luna",
          message: text,
          conversationId: "conv_" + (currentUser?.id || "anon"),
          user: {
            id: currentUser?.id || "user_anon",
            name: currentUser?.name || "Pengguna",
            role: currentUser?.role || "member",
          },
          organization: {
            id: "org_ekalaya",
            plan: activeSubscription?.planName || "Free",
          },
          actionPayload,
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateCharacterState("speaking");
        const botMsg = {
          id: "luna_" + Date.now(),
          sender: "luna",
          text: data.message,
          source: data.source,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);

        // Jika terdapat aksi terstruktur (Step 5 Business Tools)
        if (data.action) {
          if (data.action.type === "VIEW_LEADS") {
            const currentLeads = getStoredLeads();
            setActiveTaskResult({
              type: "VIEW_LEADS",
              title: data.action.title,
              leads: currentLeads.slice(0, 5),
            });
          } else {
            setActiveTaskResult(data.action);
          }
        }

        setTimeout(() => {
          updateCharacterState("completed");
          setTimeout(() => updateCharacterState("idle"), 3000);
        }, 1200);
      } else {
        updateCharacterState("error");
        setMessages((prev) => [
          ...prev,
          {
            id: "err_" + Date.now(),
            sender: "luna",
            isError: true,
            text: `⚠️ ${data.message || "Gagal memproses permintaan."}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setTimeout(() => updateCharacterState("idle"), 4000);
      }
    } catch (err) {
      console.error("Error communicating with Luna:", err);
      updateCharacterState("error");
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Date.now(),
          sender: "luna",
          isError: true,
          text: "⚠️ Koneksi ke server asisten AI gagal. Silakan coba kembali sesaat lagi.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setTimeout(() => updateCharacterState("idle"), 4000);
    }
  };

  const handleCopyDraft = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Label badge state karakter (Step 2)
  const getStateBadge = () => {
    switch (characterState) {
      case "listening":
        return { label: "Mendengarkan...", color: "bg-blue-500/20 text-blue-300 border-blue-500/40" };
      case "thinking":
        return { label: "Sedang Berpikir...", color: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse" };
      case "speaking":
        return { label: "Berbicara...", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
      case "working":
        return { label: "Menjalankan n8n...", color: "bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse" };
      case "completed":
        return { label: "Tugas Selesai", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" };
      case "error":
        return { label: "Kendala Koneksi", color: "bg-rose-500/20 text-rose-300 border-rose-500/40" };
      default:
        return { label: "Siap Membantu 24/7", color: "bg-slate-800 text-slate-300 border-slate-700" };
    }
  };

  const badge = getStateBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[720px] overflow-hidden">
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white font-bold text-lg">
              ✨
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Luna</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Bot className="w-2.5 h-2.5" />
                  AI Sales Assistant
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] px-2 py-0.2 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-[10px] text-slate-500">n8n Workflow Engine</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95 border border-slate-700/60"
            title="Tutup Panel Luna"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QUICK ACTION PROMPT PILLS */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleSendMessage("Cari daftar prospek CRM")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all active:scale-95 whitespace-nowrap"
          >
            <Search className="w-3 h-3 text-cyan-400" />
            <span>Cari Prospek CRM</span>
          </button>
          <button
            onClick={() => handleSendMessage("Berikan ringkasan pipeline penjualan dan omzet")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 hover:border-emerald-500/40 transition-all active:scale-95 whitespace-nowrap"
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Ringkasan Omzet</span>
          </button>
          <button
            onClick={() => handleSendMessage("Berapa harga paket dan katalog resmi?")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/40 transition-all active:scale-95 whitespace-nowrap"
          >
            <Package className="w-3 h-3 text-amber-400" />
            <span>Katalog Paket</span>
          </button>
          <button
            onClick={() => handleSendMessage("Buatkan draf follow-up WhatsApp untuk prospek")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 hover:border-purple-500/40 transition-all active:scale-95 whitespace-nowrap"
          >
            <FileText className="w-3 h-3 text-purple-400" />
            <span>Draf WhatsApp</span>
          </button>
        </div>

        {/* CHAT CONVERSATION HISTORY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "luna" && (
                <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex-shrink-0 mt-0.5">
                  L
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none"
                    : msg.isError
                    ? "bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-tl-none"
                    : "bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-slate-400">
                  <span className="font-semibold text-cyan-300">
                    {msg.sender === "user" ? "Anda" : "Luna (AI Assistant)"}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed text-[12px]">{msg.text}</p>
                {msg.source && (
                  <div className="mt-2 text-[9px] text-slate-400 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-cyan-400" />
                    <span>Sumber: {msg.source === "n8n_workflow" ? "Workflow n8n" : "Basis Pengetahuan Grounded"}</span>
                  </div>
                )}
              </div>
              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200 text-xs font-bold flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* TASK RESULT PANEL (STEP 2 & 5) */}
          {activeTaskResult && (
            <div className="p-4 rounded-2xl bg-slate-850 border border-cyan-500/40 shadow-xl space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <span className="font-bold text-xs text-cyan-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {activeTaskResult.title}
                </span>
                <button
                  onClick={() => setActiveTaskResult(null)}
                  className="text-slate-400 hover:text-white text-[11px]"
                >
                  Tutup Hasil
                </button>
              </div>

              {/* JIKA RESULT ADALAH VIEW_LEADS */}
              {activeTaskResult.type === "VIEW_LEADS" && (
                <div className="space-y-2">
                  {activeTaskResult.leads?.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-white text-[11px]">{lead.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {lead.company} • {lead.phone}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {lead.status}
                        </span>
                        <button
                          onClick={() => {
                            handleSendMessage(
                              `Buatkan pesan follow up untuk ${lead.name}`,
                              { leadName: lead.name, leadId: lead.id }
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold shadow-sm"
                        >
                          Follow Up
                        </button>
                      </div>
                    </div>
                  ))}
                  {onOpenCrmWorkspace && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCrmWorkspace();
                      }}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-center font-semibold text-[11px] transition-all"
                    >
                      Buka di Meja Kerja CRM Lengkap →
                    </button>
                  )}
                </div>
              )}

              {/* JIKA RESULT ADALAH DRAFT_PREVIEW */}
              {activeTaskResult.type === "DRAFT_PREVIEW" && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                    {activeTaskResult.draftText}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyDraft(activeTaskResult.draftText)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-cyan-600/25"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isCopied ? "Tersalin!" : "Salin Pesan"}</span>
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(activeTaskResult.draftText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-emerald-600/25 text-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              {/* JIKA RESULT ADALAH LEAD_SUMMARY */}
              {activeTaskResult.type === "LEAD_SUMMARY" && (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400">Total Nilai Pipeline</div>
                    <div className="font-extrabold text-cyan-300 text-sm mt-0.5">
                      Rp {activeTaskResult.stats.totalPipelineIdr.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    <div className="text-[10px] text-slate-400">Prospek Aktif</div>
                    <div className="font-extrabold text-emerald-400 text-sm mt-0.5">
                      {activeTaskResult.stats.activeLeadsCount} Calon Klien
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BOX */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tanyakan ke Luna: cari lead, susun draf, katalog..."
            disabled={characterState === "thinking"}
            className="flex-1 bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || characterState === "thinking"}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-md shadow-cyan-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Kirim Pesan ke Luna"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
