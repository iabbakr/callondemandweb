"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, Landmark, CreditCard, 
  Loader2, AlertTriangle, CheckCircle 
} from "lucide-react";
import toast from "react-hot-toast";

// 🚀 Ensure this line says "export default"
export default function WithdrawPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { userProfile, balance, addTransaction, deductBalance } = useApp();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const QUICK_AMOUNTS = [5000, 10000, 20000, 50000];

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    
    if (amt > balance) return toast.error("Insufficient Balance");
    if (!userProfile?.paystackRecipientCode) return toast.error("Please add bank details first");

    setLoading(true);
    try {
      const res = await axios.post("https://callondemand-backend.onrender.com/api/paystack/transfer", {
        userId: user?.uid,
        amount: amt,
        recipientCode: userProfile.paystackRecipientCode,
      });

      if (res.data.status) {
        await deductBalance(amt, `Withdrawal to ${userProfile.bankName}`, "Withdrawal");
        await addTransaction({
          description: `Withdrawal to ${userProfile.bankName}`,
          amount: amt,
          category: "Withdrawal",
          type: "debit",
          status: "success",
        });
        toast.success("Withdrawal initiated!");
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Withdrawal failed");
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
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h1 className="text-2xl font-black mb-6">Withdraw Funds</h1>
          
          {userProfile?.bankName ? (
            <div className="mb-8 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Destination Account</span>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary border border-slate-100">
                    <Landmark size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{userProfile.bankName}</p>
                    <p className="text-xs text-slate-500 font-medium">{userProfile.accountNumber}</p>
                  </div>
               </div>
            </div>
          ) : (
            <button onClick={() => router.push("/profile/bank-details")} className="w-full mb-8 p-8 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-bold hover:border-primary hover:text-primary transition-all">
              + Add Bank Details
            </button>
          )}

          <form onSubmit={handleWithdraw} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Amount to Withdraw</label>
              <input 
                type="number"
                placeholder="0.00"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-black text-2xl"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map(amt => (
                <button key={amt} type="button" onClick={() => setAmount(amt.toString())} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <button 
              disabled={!amount || loading || parseFloat(amount) > balance || !userProfile?.bankName}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 disabled:bg-gray-100 disabled:text-gray-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> Withdraw Now</>}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-primary p-8 rounded-[40px] text-white shadow-xl shadow-primary/20">
            <h2 className="text-4xl font-black mb-2">₦{balance.toLocaleString()}</h2>
            <p className="text-xs opacity-70 font-medium">Available for Withdrawal</p>
          </div>
          
          <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100">
             <h4 className="text-blue-800 font-bold text-sm flex items-center gap-2 mb-2">
               <CheckCircle size={16} /> Instant Processing
             </h4>
             <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
               Withdrawals are typically processed instantly. In some cases, it may take up to 30 minutes for your bank to reflect the credit.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}