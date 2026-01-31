"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { APP_MENU } from "@/config/services";
import { 
  ShoppingCart, ArrowLeft, Plus, Minus, 
  CreditCard, Loader2, ShoppingBag, AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DynamicServicePage() {
  const { type } = useParams();
  const router = useRouter();
  
  // Hooking into your updated AppContext
  const { 
    balance, 
    deductBalance, 
    addTransaction, 
    cart, 
    updateCartQty, 
    addToCart, 
    clearCart 
  } = useApp();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Lookup the service configuration based on the URL
  const currentService = APP_MENU[type as keyof typeof APP_MENU];

  // Calculate totals
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const isLowBalance = total > balance;

  if (!currentService) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Service not found</h1>
        <Link href="/services" className="text-primary mt-4">Return to Hub</Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (isLowBalance) return toast.error("Insufficient Wallet Balance");
    if (total === 0) return toast.error("Your cart is empty");
    
    setIsProcessing(true);
    try {
      // 1. Deduct from balance
      await deductBalance(total, `${currentService.title} Payment`, String(type));
      
      // 2. Log the transaction
      await addTransaction({
        description: `${currentService.title} Order`,
        amount: total,
        type: "debit",
        category: String(type),
        status: "success",
      });

      // 3. Clear global cart
      clearCart();

      toast.success("Order Placed Successfully!");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 pb-40">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-slate-400 mb-8 hover:text-primary transition-colors font-bold group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h1 className="text-5xl font-black mb-2 capitalize">{currentService.title}</h1>
          <p className="text-slate-400 text-lg mb-12">{currentService.tagline}</p>

          <div className="grid sm:grid-cols-2 gap-6">
            {currentService.items.map((item) => {
              const cartItem = cart.find(i => i.id === item.id);
              return (
                <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all border-b-4 border-b-transparent hover:border-b-primary group">
                  <div className="mb-8">
                    <h3 className="font-black text-slate-800 text-xl">{item.name}</h3>
                    <p className="text-slate-400 text-xs mt-1 mb-2 leading-relaxed">{item.desc}</p>
                    <p className="text-primary font-black text-lg">₦{item.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2">
                     <button 
                        onClick={() => updateCartQty(item.id, -1)} 
                        className="p-3 hover:bg-white rounded-xl transition-colors shadow-sm active:scale-90"
                      >
                       <Minus size={18}/>
                     </button>
                     <span className="font-black text-lg">{cartItem?.qty || 0}</span>
                     <button 
                        onClick={() => cartItem ? updateCartQty(item.id, 1) : addToCart(item)} 
                        className="p-3 hover:bg-white rounded-xl transition-colors shadow-sm text-primary active:scale-90"
                      >
                       <Plus size={18}/>
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- CHECKOUT SIDEBAR --- */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-2xl h-fit sticky top-10">
          <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3 text-xl">
            <ShoppingCart size={24} className="text-primary" /> My Order
          </h3>
          
          <div className="space-y-5 mb-10 max-h-[40vh] overflow-y-auto no-scrollbar">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-start animate-in slide-in-from-right-4">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700 text-sm">{item.name}</span>
                  <span className="text-[11px] text-slate-400 font-black uppercase tracking-tighter">Qty: {item.qty}</span>
                </div>
                <span className="font-black text-slate-900">₦{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="py-12 text-center flex flex-col items-center opacity-20">
                <ShoppingBag size={48} className="mb-3" />
                <p className="text-sm font-black uppercase tracking-widest">Cart is Empty</p>
              </div>
            )}
          </div>

          {isLowBalance && (
            <div className="mb-8 p-5 rounded-3xl bg-red-50 border border-red-100 animate-pulse">
              <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase mb-1">
                <AlertTriangle size={16} /> Insufficient Balance
              </div>
              <p className="text-xs text-red-500 font-medium">Please refill your wallet to complete payment.</p>
              <Link href="/finance" className="block mt-4 py-3 bg-red-600 text-white text-center rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200">Fund Wallet</Link>
            </div>
          )}

          <div className="border-t-2 border-dashed border-slate-100 pt-8 flex justify-between items-center mb-10">
            <span className="font-bold text-slate-400 uppercase text-xs tracking-widest">Total Bill</span>
            <span className={cn("text-4xl font-black tracking-tighter transition-colors", isLowBalance ? "text-red-500" : "text-primary")}>
              ₦{total.toLocaleString()}
            </span>
          </div>

          <button 
            disabled={cart.length === 0 || isProcessing || isLowBalance}
            onClick={handleCheckout}
            className="w-full bg-primary text-white py-5 rounded-3xl font-black flex items-center justify-center gap-4 disabled:bg-slate-100 disabled:text-slate-300 shadow-2xl shadow-primary/30 transition-all active:scale-95"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <><CreditCard size={20}/> Complete Payment</>}
          </button>
        </div>
      </div>
    </div>
  );
}