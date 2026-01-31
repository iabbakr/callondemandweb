"use client";

import React, { useState } from "react";
import axios from "axios";
import { 
  Send, 
  Megaphone, 
  AlertCircle,
  Loader2,
  Info,
  Zap,
  ShieldAlert,
  History
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useApp } from "@/context/AppContext";
import toast from "react-hot-toast";

const BACKEND_URL = 'https://callondemand-backend.onrender.com';

export default function BroadcastManager() {
  const { userProfile } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    type: "admin_notification", 
    target: "all"
  });

  /**
   * SECURITY AUDIT LOGGING
   */
  const logAdminAction = async (sentCount: number) => {
    try {
      await addDoc(collection(db, "audit_logs"), {
        adminId: userProfile?.uid,
        adminName: userProfile?.fullName,
        actionType: "BROADCAST",
        description: `launched a global broadcast [${formData.title}] to ${sentCount} devices.`,
        timestamp: serverTimestamp(),
        ipAddress: "System_Web",
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }
  };

  /**
   * BROADCAST HISTORY LOGGING
   */
  const saveToHistory = async (sentCount: number) => {
    try {
      await addDoc(collection(db, "broadcast_history"), {
        title: formData.title,
        body: formData.body,
        sentBy: userProfile?.fullName || "Admin",
        adminId: userProfile?.uid,
        sentCount: sentCount,
        timestamp: serverTimestamp(),
        type: formData.type
      });
    } catch (e) {
      console.error("History logging failed", e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) return toast.error("Please fill all fields");

    const confirmSend = window.confirm(`CRITICAL: You are about to send a push notification to EVERY user. Proceed?`);
    if (!confirmSend) return;

    setLoading(true);
    try {
      // 1. Send via Backend API
      const response = await axios.post(`${BACKEND_URL}/api/notifications/broadcast`, formData);
      const sentCount = response.data.sentCount || 0;
      
      // 2. Log to History and Security Audit
      await Promise.all([
        saveToHistory(sentCount),
        logAdminAction(sentCount)
      ]);
      
      toast.success(`Broadcast deployed to ${sentCount} devices!`);
      setFormData({ ...formData, title: "", body: "" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to deploy broadcast.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* --- HEADER --- */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <Megaphone className="text-primary" /> System Broadcast
          </h1>
          <p className="text-slate-500 font-medium">Global Push Notification Engine</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/broadcast/history"
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <History size={16} /> View History
          </Link>
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            Live Ready
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* --- FORM SECTION --- */}
        <div className="lg:col-span-3 space-y-8">
          <form onSubmit={handleSend} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Notification Title</label>
                <input 
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
                  placeholder="e.g. Flash Sale Live! 🔥"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Main Message</label>
                <textarea 
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-600 resize-none placeholder:text-slate-300 shadow-inner"
                  placeholder="Type the content that appears on the lock screen..."
                  value={formData.body}
                  onChange={e => setFormData({...formData, body: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Zap size={20} fill="currentColor" /> Deploy Broadcast</>}
            </button>
          </form>

          {/* Warning Card */}
          <div className="p-6 bg-red-50 rounded-[32px] border border-red-100 flex items-start gap-4">
            <ShieldAlert className="text-red-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-black text-red-900 text-sm">Audited Action</p>
              <p className="text-xs text-red-700 font-medium leading-relaxed mt-1">
                Your name will be logged alongside this broadcast in the Security Audit. 
                Spamming notifications may lead to decreased app retention rates.
              </p>
            </div>
          </div>
        </div>

        {/* --- PREVIEW SECTION --- */}
        <aside className="lg:col-span-2 space-y-8">
          <div className="relative mx-auto w-full max-w-[300px] aspect-[9/19] bg-slate-900 rounded-[3.5rem] p-4 border-[10px] border-slate-800 shadow-2xl flex flex-col items-center">
            {/* Dynamic Notch */}
            <div className="w-24 h-6 bg-slate-800 rounded-full mb-8" />
            
            <div className="w-full flex justify-between px-4 mb-10 opacity-40 text-white">
              <span className="text-[10px] font-bold">09:41</span>
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-white" />
                <div className="w-3 h-1 bg-white rounded-full" />
              </div>
            </div>

            {/* Notification Banner */}
            <div className="w-full bg-white/10 backdrop-blur-2xl p-4 rounded-[1.5rem] border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-primary rounded-lg flex items-center justify-center text-[8px] font-bold text-white">C</div>
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">CallOnDemand • Just Now</span>
              </div>
              <h4 className="text-white font-bold text-xs truncate mb-1">
                {formData.title || "Subject Line"}
              </h4>
              <p className="text-white/70 text-[11px] leading-snug line-clamp-3">
                {formData.body || "Compose your message to see a live preview of the mobile experience."}
              </p>
            </div>
            
            <div className="mt-auto mb-2 w-28 h-1 bg-white/20 rounded-full" />
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100">
            <h4 className="text-slate-900 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
              <Info size={16} className="text-primary" /> Optimization
            </h4>
            <div className="space-y-4">
              <TipItem text="Keep titles to 1-5 words for best visibility." />
              <TipItem text="Use emojis sparingly to highlight key actions." />
              <TipItem text="Include a clear 'call to action' in the body." />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
      <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{text}</p>
    </div>
  );
}