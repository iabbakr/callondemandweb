"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, query, where, getDocs, doc, updateDoc, 
  increment, addDoc, serverTimestamp 
} from "firebase/firestore";
import { 
  Search, Send, CheckCircle2, AlertCircle, 
  ArrowLeft, Loader2, Wallet 
} from "lucide-react";
import toast from "react-hot-toast";

export default function SendMoneyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { balance, deductBalance } = useApp();
  
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [foundRecipient, setFoundRecipient] = useState<any>(null);

  const findRecipient = async () => {
    if (!receiver.trim()) return;
    const cleaned = receiver.trim().replace(/^@/, "");
    const usersRef = collection(db, "users");
    
    const queries = [
      query(usersRef, where("username", "==", cleaned)),
      query(usersRef, where("email", "==", cleaned.toLowerCase())),
      query(usersRef, where("phoneNumber", "==", cleaned)),
    ];

    for (let q of queries) {
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setFoundRecipient({ uid: snapshot.docs[0].id, ...data });
        return;
      }
    }
    toast.error("Recipient not found");
    setFoundRecipient(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!foundRecipient || amt > balance) return;

    setLoading(true);
    try {
      // 1. Deduct from Sender
      await deductBalance(amt, `Sent to @${foundRecipient.username}`, "Transfer");

      // 2. Add to Receiver
      await updateDoc(doc(db, "users", foundRecipient.uid), {
        balance: increment(amt)
      });

      // 3. Log Receiver Transaction
      await addDoc(collection(db, "users", foundRecipient.uid, "transactions"), {
        description: `Received ₦${amt} from @${user?.displayName || 'User'}`,
        amount: amt,
        category: "Transfer",
        type: "credit",
        status: "success",
        date: serverTimestamp(),
      });

      toast.success("Transfer Successful!");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 mb-8 hover:text-primary transition-colors">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h1 className="text-2xl font-black mb-6">Send Money</h1>
          
          <form onSubmit={handleSend} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Recipient</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text"
                    placeholder="@username or email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    value={receiver}
                    onChange={(e) => { setReceiver(e.target.value); setFoundRecipient(null); }}
                  />
                </div>
                <button type="button" onClick={findRecipient} className="px-6 bg-slate-900 text-white rounded-2xl font-bold text-sm">Verify</button>
              </div>
            </div>

            {foundRecipient && (
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {foundRecipient.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{foundRecipient.fullName}</p>
                  <p className="text-xs text-primary font-bold">@{foundRecipient.username}</p>
                </div>
                <CheckCircle2 className="text-primary" size={20} />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (₦)</label>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-black text-2xl"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <button 
              disabled={!foundRecipient || !amount || loading || parseFloat(amount) > balance}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:bg-gray-100 disabled:text-gray-300 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Send Funds</>}
            </button>
          </form>
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white">
            <div className="flex items-center gap-3 mb-4 opacity-60">
              <Wallet size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Wallet Balance</span>
            </div>
            <h2 className="text-4xl font-black mb-2">₦{balance.toLocaleString()}</h2>
            <p className="text-xs text-gray-400 font-medium italic">Funds are sent instantly to other COD users.</p>
          </div>
          
          <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100">
             <h4 className="text-amber-800 font-bold text-sm flex items-center gap-2 mb-2">
               <AlertCircle size={16} /> Security Tip
             </h4>
             <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
               Always verify the recipient's username before sending funds. Transactions are irreversible once completed.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}