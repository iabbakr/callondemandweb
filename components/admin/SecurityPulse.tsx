"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { ShieldAlert, TrendingUp, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SecurityPulse() {
  const [stats, setStats] = useState({
    suspensions24h: 0,
    totalLogs24h: 0,
    loading: true
  });

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        // Calculate timestamp for 24 hours ago
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const firestoreTimestamp = Timestamp.fromDate(twentyFourHoursAgo);

        const logsRef = collection(db, "audit_logs");
        const q = query(logsRef, where("timestamp", ">=", firestoreTimestamp));
        
        const snap = await getDocs(q);
        const allLogs = snap.docs.map(d => d.data());
        
        const suspensions = allLogs.filter(log => log.actionType === "USER_BAN").length;

        setStats({
          suspensions24h: suspensions,
          totalLogs24h: snap.size,
          loading: false
        });
      } catch (e) {
        console.error("Pulse check failed", e);
      }
    };

    fetchPulse();
  }, []);

  return (
    <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
      {/* Background Decor */}
      <ShieldAlert className="absolute -right-6 -bottom-6 text-white/5" size={140} />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="bg-primary/20 p-3 rounded-2xl text-primary border border-primary/20">
            <ShieldAlert size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            24H Security Pulse
          </span>
        </div>

        <div className="mt-8 space-y-2">
          {stats.loading ? (
            <Loader2 className="animate-spin text-slate-700" size={32} />
          ) : (
            <>
              <h2 className="text-4xl font-black tracking-tighter">
                {stats.suspensions24h}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Account Suspensions
              </p>
            </>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400">
              {stats.totalLogs24h} Total Admin Actions
            </span>
          </div>
          <div className={cn(
            "px-2 py-1 rounded text-[8px] font-black uppercase",
            stats.suspensions24h > 5 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
          )}>
            {stats.suspensions24h > 5 ? "Elevated" : "Normal"}
          </div>
        </div>
      </div>
    </div>
  );
}