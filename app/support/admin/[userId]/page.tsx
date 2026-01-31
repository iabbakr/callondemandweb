"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, updateDoc, setDoc, deleteDoc 
} from "firebase/firestore";
import { 
  Send, ChevronLeft, Mail, ShieldCheck, 
  CheckCircle2, AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminChatThread() {
  const { userId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userMeta, setUserMeta] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch messages and reset unread count
  useEffect(() => {
    if (!userId) return;

    // Reset unread count for this specific chat
    const resetCount = async () => {
      try {
        await updateDoc(doc(db, "adminInbox", userId as string), { unreadCount: 0 });
      } catch (e) {
        console.error("Inbox reset failed", e);
      }
    };
    resetCount();

    // Listen to messages
    const q = query(collection(db, "chats", userId as string, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    // Get user metadata
    const unsubMeta = onSnapshot(doc(db, "adminInbox", userId as string), (snap) => {
      if (snap.exists()) setUserMeta(snap.data());
    });

    return () => { unsub(); unsubMeta(); };
  }, [userId]);

  // 2. Handle Admin Reply
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const text = input;
    setInput("");

    try {
      const msgData = {
        text,
        sender: "admin",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "chats", userId as string, "messages"), msgData);

      const updateData = {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminTyping: false
      };

      await updateDoc(doc(db, "chats", userId as string), updateData);
      await updateDoc(doc(db, "adminInbox", userId as string), updateData);
      
    } catch (err) {
      toast.error("Message failed to send");
      setInput(text);
    }
  };

  // 3. Handle Ticket Resolution (Archive)
  const resolveTicket = async () => {
    if (!userId || !userMeta) return;

    const confirmResolve = window.confirm("Mark this conversation as resolved? It will be removed from your active inbox and moved to archives.");
    if (!confirmResolve) return;

    try {
      const archiveData = {
        ...userMeta,
        resolvedAt: serverTimestamp(),
        status: "resolved",
        // Logic: Keep message history in 'chats' but remove from 'adminInbox'
      };

      // 1. Move metadata to archives collection
      await setDoc(doc(db, "archivedChats", userId as string), archiveData);
      
      // 2. Remove from active operator inbox
      await deleteDoc(doc(db, "adminInbox", userId as string));

      toast.success("Ticket successfully resolved and archived");
      router.push("/support/admin");
    } catch (err) {
      toast.error("Failed to archive ticket");
    }
  };

  // 4. Handle Typing Indicator
  const toggleTyping = async (isTyping: boolean) => {
    if (!userId) return;
    await updateDoc(doc(db, "chats", userId as string), { adminTyping: isTyping });
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase text-slate-400 tracking-widest">Establishing Secure Connection...</div>;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 p-4">
      
      {/* --- LEFT: CHAT AREA --- */}
      <div className="flex-1 flex flex-col bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
              <ChevronLeft />
            </button>
            <div className="flex flex-col">
              <span className="font-black text-lg truncate max-w-[150px] sm:max-w-none">
                {userMeta?.userName || "Customer"}
              </span>
              <span className="text-[10px] uppercase font-bold flex items-center gap-1 text-primary">
                <ShieldCheck size={10} /> Support Operator Active
              </span>
            </div>
          </div>

          <button 
            onClick={resolveTicket}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Resolve
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 no-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
              <AlertCircle size={48} />
              <p className="font-black uppercase text-xs tracking-[0.2em]">No History Found</p>
            </div>
          ) : messages.map((msg) => (
            <div key={msg.id} className={cn("flex w-full", msg.sender === 'admin' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] sm:max-w-[70%] p-4 rounded-[24px] shadow-sm",
                msg.sender === 'admin' ? "bg-slate-900 text-white rounded-tr-none" : "bg-white text-slate-900 border border-slate-100 rounded-tl-none"
              )}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <p className={cn("text-[8px] mt-2 font-black uppercase opacity-40 text-right")}>
                  {msg.createdAt?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Reply Input */}
        <form onSubmit={handleReply} className="p-4 bg-white border-t flex gap-4 items-center">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => toggleTyping(true)}
            onBlur={() => toggleTyping(false)}
            placeholder="Type a response..."
            className="flex-1 bg-slate-100 p-4 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="bg-primary text-white p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* --- RIGHT: CUSTOMER PROFILE --- */}
      <aside className="hidden lg:flex w-80 flex-col space-y-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl text-center">
          <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-3xl font-black text-slate-300">
            {userMeta?.userName?.charAt(0) || "U"}
          </div>
          <h3 className="font-black text-xl text-slate-900 truncate">{userMeta?.userName}</h3>
          <p className="text-sm text-slate-400 font-medium mb-8 truncate">{userMeta?.userEmail}</p>
          
          <div className="space-y-3">
             <a href={`mailto:${userMeta?.userEmail}`} className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors">
               <Mail size={16} /> Contact Email
             </a>
             <div className="p-5 bg-primary/5 rounded-3xl text-left border border-primary/10">
               <p className="text-[10px] font-black uppercase text-primary mb-1 tracking-widest">Security Level</p>
               <p className="text-xs font-bold text-slate-700">KYC Verified Customer</p>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden">
          <h4 className="font-black text-xs uppercase tracking-widest mb-4 opacity-50 relative z-10">Standard Procedure</h4>
          <ul className="text-[11px] space-y-4 font-medium opacity-80 relative z-10">
            <li className="flex gap-2">• <span>Verify the transaction reference before issuing refunds.</span></li>
            <li className="flex gap-2">• <span>Never ask customers for their transaction PIN.</span></li>
            <li className="flex gap-2">• <span>Always click Resolve to clear finished tickets.</span></li>
          </ul>
          <ShieldCheck className="absolute -right-10 -bottom-10 text-white/5" size={150} />
        </div>
      </aside>
    </div>
  );
}