"use client";

import React, { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { 
  Search, Archive, Calendar, User, 
  ChevronRight, Filter, FileSearch, Trash2 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SupportArchives() {
  const [archives, setArchives] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the archived collection
    const q = query(collection(db, "archivedChats"), orderBy("resolvedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setArchives(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  // Filter logic
  const filteredArchives = useMemo(() => {
    return archives.filter(item => 
      item.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [archives, searchTerm]);

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">Accessing Archives...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resolved Tickets</h1>
          <p className="text-slate-500 font-medium">Historical record of all closed support cases</p>
        </div>

        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            placeholder="Search by name, email or message..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[20px] outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* Archives Table/List */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-slate-50">
          {filteredArchives.map((ticket) => (
            <Link 
              key={ticket.id} 
              href={`/support/admin/${ticket.id}`} // Clicking re-opens the thread view
              className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg group-hover:text-primary transition-colors">
                    {ticket.userName}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{ticket.userEmail}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="text-[10px] font-bold text-green-500 uppercase">Resolved</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-10">
                {/* Meta details hidden on small mobile */}
                <div className="hidden lg:flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">
                      {ticket.resolvedAt?.toDate ? ticket.resolvedAt.toDate().toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Reference: {ticket.id.slice(0, 8)}
                  </p>
                </div>
                
                <ChevronRight size={24} className="text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {filteredArchives.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <FileSearch size={32} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No matching archives</h3>
            <p className="text-slate-400 font-medium">Try searching for a different name or email</p>
          </div>
        )}
      </div>

      {/* Storage Tip */}
      <div className="p-6 bg-slate-900 rounded-[32px] text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Archive size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-black text-sm">Automated Backup</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Resolved tickets are stored for 12 months</p>
          </div>
        </div>
      </div>
    </div>
  );
}