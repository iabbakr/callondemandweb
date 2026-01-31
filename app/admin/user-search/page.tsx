"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, query, where, getDocs, limit, 
  orderBy, doc, updateDoc, serverTimestamp, addDoc 
} from "firebase/firestore";
import { 
  Search, User, Mail, Smartphone, 
  Bell, Send, Loader2, ShieldCheck, X,
  History, ArrowUpRight, ArrowDownLeft, 
  ShieldAlert, ShieldCheck as ShieldOk
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

const BACKEND_URL = 'https://callondemand-backend.onrender.com';

export default function UserSearchManager() {
  const { userProfile } = useApp(); // Get admin details for logging
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Modals
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [noteData, setNoteData] = useState({ title: "", body: "" });
  const [isSending, setIsSending] = useState(false);

  /**
   * SECURITY LOGGING UTILITY
   */
  const logAdminAction = async (actionType: string, targetUser: any, description: string) => {
    try {
      await addDoc(collection(db, "audit_logs"), {
        adminId: userProfile?.uid,
        adminName: userProfile?.fullName,
        actionType,
        targetUserId: targetUser.id,
        targetUserName: targetUser.fullName,
        description,
        timestamp: serverTimestamp(),
        ipAddress: "System_Web",
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setResults([]);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", searchTerm.trim().toLowerCase()), limit(1));
      const snap = await getDocs(q);
      const found = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResults(found);
      if (found.length === 0) toast.error("No user found");
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSuspension = async (user: any) => {
    const isSuspending = user.status !== "suspended";
    const confirmAction = window.confirm(
      `Are you sure you want to ${isSuspending ? "SUSPEND" : "REACTIVATE"} ${user.fullName}?`
    );
    
    if (!confirmAction) return;

    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        status: isSuspending ? "suspended" : "active",
        updatedAt: serverTimestamp()
      });

      // LOG ACTION TO AUDIT
      await logAdminAction(
        "USER_BAN", 
        user, 
        `${isSuspending ? 'suspended' : 'reactivated'} the account of`
      );

      setResults(prev => prev.map(u => u.id === user.id ? { ...u, status: isSuspending ? "suspended" : "active" } : u));
      toast.success(`Account ${isSuspending ? "suspended" : "reactivated"}`);
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const fetchUserHistory = async (userId: string) => {
    setLoadingHistory(true);
    setShowHistoryModal(true);
    try {
      const txRef = collection(db, "users", userId, "transactions");
      const q = query(txRef, orderBy("date", "desc"), limit(10));
      const snap = await getDocs(q);
      setUserTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      toast.error("Could not load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendDirectNote = async () => {
    if (!noteData.title || !noteData.body) return toast.error("Fill all fields");
    setIsSending(true);
    try {
      await axios.post(`${BACKEND_URL}/api/notifications/send-to-user`, {
        userId: selectedUser.id,
        notification: { title: noteData.title, body: noteData.body, data: { type: "admin_direct" } }
      });

      // LOG ACTION TO AUDIT
      await logAdminAction(
        "DIRECT_NOTIFICATION", 
        selectedUser, 
        `sent a private alert [${noteData.title}] to`
      );

      toast.success("Notification sent!");
      setShowNoteModal(false);
      setNoteData({ title: "", body: "" });
    } catch (err) {
      toast.error("Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Account Intelligence</h1>
        <p className="text-slate-500 font-medium mt-2">Manage user status, history, and direct communication</p>
      </header>

      {/* --- SEARCH BAR --- */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="email"
            placeholder="Enter user email..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button disabled={isSearching} className="bg-primary text-white px-8 rounded-2xl font-black active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
          {isSearching ? <Loader2 className="animate-spin" /> : "Lookup"}
        </button>
      </form>

      {/* --- USER PROFILE RESULTS --- */}
      <div className="grid gap-6">
        {results.map((user) => (
          <div key={user.id} className={cn(
            "bg-white p-8 rounded-[40px] border shadow-xl flex flex-col xl:flex-row justify-between items-center gap-8 transition-all",
            user.status === 'suspended' ? "border-red-200 bg-red-50/30 grayscale-[0.5]" : "border-slate-100"
          )}>
            <div className="flex items-center gap-6 flex-1">
              <div className={cn(
                "w-20 h-20 rounded-[30px] flex items-center justify-center text-3xl font-black transition-colors",
                user.status === 'suspended' ? "bg-red-100 text-red-400" : "bg-slate-50 text-slate-300"
              )}>
                {user.fullName?.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-slate-900 leading-none">{user.fullName}</h3>
                  {user.status === 'suspended' ? (
                    <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded font-black uppercase">Suspended</span>
                  ) : (
                    <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded font-black uppercase">Active</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{user.email}</p>
                <div className="pt-2 flex gap-2">
                   <span className="px-3 py-1 bg-white border border-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm">
                      Wallet: ₦{user.balance?.toLocaleString()}
                   </span>
                </div>
              </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => fetchUserHistory(user.id)}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                <History size={18} /> History
              </button>
              
              <button 
                onClick={() => { setSelectedUser(user); setShowNoteModal(true); }}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all active:scale-95"
              >
                <Bell size={18} /> Alert
              </button>

              <button 
                onClick={() => toggleSuspension(user)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                  user.status === 'suspended' 
                    ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 shadow-emerald-100" 
                    : "bg-red-100 text-red-600 hover:bg-red-200 shadow-red-100"
                )}
              >
                {user.status === 'suspended' ? <><ShieldOk size={18} /> Reactivate</> : <><ShieldAlert size={18} /> Suspend</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- HISTORY MODAL --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-10 shadow-2xl relative max-h-[80vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setShowHistoryModal(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 font-bold">CLOSE</button>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Activity Audit</h2>
            {loadingHistory ? (
              <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : (
              <div className="space-y-4">
                {userTransactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')}>
                        {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{tx.description}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{tx.category} • {tx.date?.toDate?.().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={cn("font-black text-lg", tx.type === 'credit' ? 'text-green-600' : 'text-red-600')}>
                      {tx.type === 'credit' ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                    </p>
                  </div>
                ))}
                {userTransactions.length === 0 && <p className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs tracking-widest">No transaction history</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- NOTIFICATION MODAL --- */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative">
            <button onClick={() => setShowNoteModal(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 font-bold">CANCEL</button>
            <h2 className="text-2xl font-black text-slate-900 mb-8">Send Direct Alert</h2>
            <div className="space-y-6">
              <input className="w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none font-bold" placeholder="Subject" value={noteData.title} onChange={e => setNoteData({...noteData, title: e.target.value})} />
              <textarea rows={4} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none font-medium resize-none" placeholder="Message content..." value={noteData.body} onChange={e => setNoteData({...noteData, body: e.target.value})} />
              <button onClick={sendDirectNote} disabled={isSending} className="w-full bg-primary text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:shadow-lg">
                {isSending ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Alert</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}