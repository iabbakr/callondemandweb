"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { 
  ShieldCheck, 
  History, 
  UserPlus, 
  Wallet, 
  AlertTriangle,
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the 'audit_logs' collection for real-time security updates
    const q = query(
      collection(db, "audit_logs"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const getActionIcon = (type: string) => {
    switch (type) {
      case "ROLE_CHANGE": return <ShieldCheck className="text-purple-500" size={18} />;
      case "WALLET_ADJUST": return <Wallet className="text-green-500" size={18} />;
      case "USER_BAN": return <AlertTriangle className="text-red-500" size={18} />;
      default: return <History className="text-slate-400" size={18} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security Audit</h1>
          <p className="text-slate-500 font-medium">Platform management and administrative tracking</p>
        </div>
        <div className="bg-slate-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Live Monitoring
        </div>
      </header>

      {/* --- LOG FEED --- */}
      <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="p-20 text-center animate-pulse opacity-20 font-black uppercase text-xs tracking-widest">
              Syncing Security Logs...
            </div>
          ) : logs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-slate-50/50 transition-colors flex items-center gap-6 group">
              {/* Action Type Icon */}
              <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
                {getActionIcon(log.actionType)}
              </div>

              {/* Log Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {log.actionType.replace('_', ' ')}
                  </span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span className="text-[10px] font-bold text-slate-400">
                    {log.timestamp?.toDate ? format(log.timestamp.toDate(), "MMM d, HH:mm:ss") : "Just now"}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  <span className="font-black text-slate-900">{log.adminName}</span>
                  {" "}{log.description}{" "}
                  <span className="font-black text-primary italic cursor-pointer hover:underline">
                    {log.targetUserName}
                  </span>
                </p>
              </div>

              {/* Meta Data Badge */}
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="bg-slate-100 px-3 py-1 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                  ID: {log.id.slice(0, 8)}
                </div>
                {log.ipAddress && (
                  <span className="text-[9px] font-bold text-slate-300 font-mono">{log.ipAddress}</span>
                )}
              </div>
              
              <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
            </div>
          ))}

          {!loading && logs.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold">
              No administrative actions recorded yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}