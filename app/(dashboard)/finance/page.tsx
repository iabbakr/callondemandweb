"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { usePaystackPayment } from "react-paystack";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  History, 
  Loader2, 
  Landmark,
  AlertCircle,
  ChevronRight,
  X
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function FinancePage() {
  const { balance, transactions, userProfile } = useApp();
  const { user } = useAuth();
  const [withdrawing, setWithdrawing] = useState(false);
  
  // Custom Amount States
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");

  // Paystack Configuration
  const config = {
    reference: `FUND_${new Date().getTime()}`,
    email: user?.email || "",
    amount: parseFloat(topUpAmount) * 100, // Convert NGN to Kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
  };

  const initializePayment = usePaystackPayment(config);

  const handleTopUp = () => {
    const amt = parseFloat(topUpAmount);
    if (!amt || amt < 100) return toast.error("Minimum top-up is ₦100");
    
    initializePayment({
      onSuccess: (ref: any) => {
        setShowTopUpModal(false);
        setTopUpAmount("");
        toast.success(`₦${amt.toLocaleString()} added to wallet!`);
      },
      onClose: () => toast.error("Payment Cancelled")
    });
  };

  const handleWithdraw = async () => {
    if (!userProfile?.paystackRecipientCode) {
      return toast.error("Please verify bank details in Profile first.");
    }
    
    const amountStr = prompt("Enter amount to withdraw (₦):");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);

    if (amount > balance) return toast.error("Insufficient balance");
    if (amount < 100) return toast.error("Minimum withdrawal is ₦100");

    setWithdrawing(true);
    try {
      const res = await api.post("/api/paystack/transfer", {
        userId: user?.uid,
        amount: amount,
        recipientCode: userProfile.paystackRecipientCode,
      });

      if (res.data.status) {
        toast.success("Withdrawal initiated successfully!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Finance</h1>
          <p className="text-sm text-gray-400 font-medium">Manage your balance and transactions</p>
        </div>
        <div className="relative w-12 h-12">
          <Image src="/logo.jpg" alt="Logo" fill className="object-contain rounded-xl shadow-sm" />
        </div>
      </header>

      {/* --- BALANCE CARD --- */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-primary rounded-[40px] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Available Balance</p>
          <h2 className="text-5xl font-black mb-10 tracking-tighter">₦{balance.toLocaleString()}</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowTopUpModal(true)}
              className="flex-1 bg-white text-primary py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg"
            >
              <Plus size={18} /> Add Funds
            </button>
            <button 
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="flex-1 bg-white/10 backdrop-blur-md text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/20"
            >
              {withdrawing ? <Loader2 className="animate-spin" size={18} /> : <ArrowUpRight size={18} />}
              Withdraw
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Settlement Bank</span>
          <p className="text-xl font-black text-gray-800 line-clamp-1">{userProfile?.bankName || "No Bank Linked"}</p>
          <p className="text-gray-400 font-bold tracking-widest mt-1">
            {userProfile?.accountNumber ? `**** ${userProfile.accountNumber.slice(-4)}` : "**** **** ****"}
          </p>
        </div>
      </div>

      {/* --- TRANSACTION LIST --- */}
      <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Recent Activity</h3>
          <button className="text-xs font-black text-primary hover:underline">View All</button>
        </div>
        <div className="divide-y divide-gray-50">
          {transactions.map((tx: any) => (
            <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{tx.description}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{tx.category}</p>
                </div>
              </div>
              <p className={`text-lg font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- TOP-UP MODAL --- */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in">
            <button 
              onClick={() => setShowTopUpModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>

            <h3 className="text-2xl font-black text-slate-900 mb-2">Fund Wallet</h3>
            <p className="text-sm text-slate-400 font-medium mb-8">Enter the amount you wish to add.</p>

            <div className="space-y-6">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₦</span>
                <input 
                  type="number"
                  placeholder="0"
                  className="w-full pl-12 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 font-black text-3xl transition-all"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)} // Fixed the setAmount error here
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[1000, 2000, 5000].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => setTopUpAmount(amt.toString())}
                    className="py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all"
                  >
                    +₦{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleTopUp}
                disabled={!topUpAmount || parseFloat(topUpAmount) < 100}
                className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}