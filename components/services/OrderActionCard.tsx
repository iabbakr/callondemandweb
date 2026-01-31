"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function OrderActionCard({ order, role }: { order: any, role: string }) {
  const { balance, deductBalance, addTransaction } = useApp();
  const [loading, setLoading] = useState(false);

  // 1. CUSTOMER: Process Direct Wallet Payment
  const handlePayNow = async () => {
    if (balance < order.totalPrice) {
      return toast.error("Insufficient wallet balance. Please top up.");
    }

    setLoading(true);
    try {
      // Deduct from wallet
      await deductBalance(order.totalPrice, `Payment for ${order.category} order`, order.category);
      
      // Update order status to PAID
      const orderRef = doc(db, `${order.category}_orders`, order.id);
      await updateDoc(orderRef, {
        status: 'paid',
        paidAt: serverTimestamp(),
      });

      toast.success("Payment successful! Operator notified.");
    } catch (e) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. AGENT: Approve Order
  const handleAgentApproval = async (status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      const orderRef = doc(db, `${order.category}_orders`, order.id);
      await updateDoc(orderRef, { status, updatedAt: serverTimestamp() });
      toast.success(`Order ${status}`);
    } catch (e) {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Order Status</span>
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">{order.status}</span>
      </div>

      {/* VIEW FOR CUSTOMER: WAITING TO PAY */}
      {role === 'user' && order.status === 'approved' && (
        <button 
          onClick={handlePayNow}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={18} /> Pay ₦{order.totalPrice.toLocaleString()}</>}
        </button>
      )}

      {/* VIEW FOR AGENT: WAITING TO APPROVE */}
      {role === 'agent' && order.status === 'pending_approval' && (
        <div className="flex gap-3">
          <button 
            onClick={() => handleAgentApproval('approved')}
            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} /> Approve
          </button>
          <button 
            onClick={() => handleAgentApproval('rejected')}
            className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <XCircle size={16} /> Reject
          </button>
        </div>
      )}
    </div>
  );
}