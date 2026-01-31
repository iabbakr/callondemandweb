"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Search, User, MessageCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AdminInbox() {
  const [chats, setChats] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "adminInbox"), orderBy("updatedAt", "desc"));
    return onSnapshot(q, (snap) => {
      setChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const filtered = chats.filter(c => 
    c.userName?.toLowerCase().includes(search.toLowerCase()) || 
    c.userEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Customer Support</h1>
          <p className="text-slate-500 font-medium">{chats.length} active conversations</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            placeholder="Search customer..." 
            className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
          {filtered.map((chat) => (
            <Link 
              key={chat.id} 
              href={`/support/admin/${chat.id}`}
              className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl">
                  {chat.userName?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900">{chat.userName}</h4>
                  <p className="text-sm text-slate-500 line-clamp-1">{chat.lastMessage}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {chat.updatedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full mt-1 inline-block">
                      {chat.unreadCount} NEW
                    </span>
                  )}
                </div>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-primary transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}