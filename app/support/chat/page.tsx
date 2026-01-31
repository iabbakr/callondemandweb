"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, doc, setDoc, increment 
} from "firebase/firestore";
import { Send, User, ChevronLeft, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function UserChat() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "chats", user.uid, "messages"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [user]);

  // Listen for admin typing status
  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "chats", user.uid), (snap) => {
      setIsAdminTyping(!!snap.data()?.adminTyping);
    });
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const text = input;
    setInput("");

    const msgData = {
      text,
      sender: "user",
      createdAt: serverTimestamp(),
      senderId: user.uid
    };

    await addDoc(collection(db, "chats", user.uid, "messages"), msgData);
    
    // Update Inbox/Metadata
    const meta = {
      userName: user.displayName || "User",
      userEmail: user.email,
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      unreadCount: increment(1),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, "chats", user.uid), meta, { merge: true });
    await setDoc(doc(db, "adminInbox", user.uid), meta, { merge: true });
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b flex items-center justify-between bg-primary text-white">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
            <ChevronLeft />
          </button>
          <div className="flex flex-col">
            <span className="font-black">Support Assistant</span>
            <span className="text-[10px] uppercase font-bold flex items-center gap-1 opacity-80">
              <ShieldCheck size={10} /> Live Support Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex w-full", msg.sender === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] p-4 rounded-[24px] shadow-sm",
              msg.sender === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-white text-slate-900 border border-slate-100 rounded-tl-none"
            )}>
              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
              <p className={cn("text-[9px] mt-2 font-bold uppercase opacity-50", msg.sender === 'user' ? "text-right" : "text-left")}>
                {msg.createdAt?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isAdminTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white p-3 rounded-2xl text-[10px] font-black text-slate-400 italic">Admin is typing...</div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-4 items-center">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm"
        />
        <button type="submit" className="bg-primary text-white p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}