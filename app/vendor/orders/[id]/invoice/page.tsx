"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";
import Image from "next/image";

export default function OrderInvoice() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "orders", id as string), (snap) => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [id]);

  const handlePrint = () => {
    window.print(); // Triggers the browser's native print-to-pdf dialog
  };

  if (!order) return <div className="p-20 text-center animate-pulse">Generating Invoice...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 pb-32">
      {/* --- ACTION BAR (Hidden during print) --- */}
      <div className="flex justify-between items-center mb-10 print:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm">
          <ArrowLeft size={18} /> Back to Orders
        </button>
        <button 
          onClick={handlePrint}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          <Printer size={18} /> Print Invoice
        </button>
      </div>

      {/* --- INVOICE SHEET --- */}
      <div className="bg-white border border-slate-100 rounded-[40px] shadow-sm overflow-hidden p-8 md:p-16 print:border-none print:shadow-none">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="w-16 h-16 relative">
              <Image src="/logo.jpg" alt="BUBU" fill className="rounded-2xl object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">BUBU S&P</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Order Official Receipt</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Invoice Number</p>
            <h2 className="text-xl font-black text-primary">#{order.id.slice(-8).toUpperCase()}</h2>
            <p className="text-xs font-bold text-slate-500 mt-2">{new Date().toLocaleDateString()}</p>
          </div>
        </header>

        {/* Bill To Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 pb-12 border-b border-slate-50">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Customer Details</p>
            <h3 className="font-black text-slate-900">{order.customerName || "Guest User"}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{order.deliveryAddress || "Campus Pickup"}</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Info</p>
            <div className="flex items-center gap-2 text-green-600">
              <ShieldCheck size={16} />
              <span className="text-sm font-black uppercase tracking-tight">Verified Wallet Payment</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-bold uppercase">Tx Ref: {order.id.slice(0, 10)}</p>
          </div>
        </div>

        {/* Table Head */}
        <div className="grid grid-cols-12 gap-4 border-b border-slate-900 pb-4 mb-6">
          <div className="col-span-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</div>
          <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</div>
          <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Price</div>
        </div>

        {/* Items */}
        <div className="space-y-6 mb-16">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-8">
                <p className="font-bold text-slate-900">{item.name}</p>
                <p className="text-[10px] text-slate-400 font-medium capitalize">{order.category} item</p>
              </div>
              <div className="col-span-1 text-center font-black text-slate-900 text-sm">
                {item.qty || 1}
              </div>
              <div className="col-span-3 text-right font-black text-slate-900">
                ₦{item.price.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-slate-50 rounded-[32px] p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center">
               <CheckCircle2 size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Status</p>
               <p className="text-sm font-black text-slate-900 uppercase">Paid in Full</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
             <h2 className="text-4xl font-black text-primary tracking-tighter">₦{order.amount.toLocaleString()}</h2>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">Thank you for using CallOnDemand</p>
        </footer>
      </div>
    </div>
  );
}