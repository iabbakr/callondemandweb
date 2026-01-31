"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { buyEducation } from "@/lib/vtpass";
import { 
  ArrowLeft, Loader2, GraduationCap, 
  Wallet, Clock, CheckCircle2, AlertCircle, 
  BookOpen, Hash
} from "lucide-react";
import toast from "react-hot-toast";

const EXAMS = [
  { id: "waec", name: "WAEC Result Checker", price: 3500 },
  { id: "waec-registration", name: "WAEC Registration", price: 18000 },
  { id: "jamb", name: "JAMB UTME PIN", price: 6200 },
  { id: "neco", name: "NECO Result Checker", price: 1200 },
  { id: "nabteb", name: "NABTEB Result Checker", price: 1000 },
];

export default function EducationPage() {
  const router = useRouter();
  const { balance, deductBalance, addTransaction } = useApp();

  const [formData, setFormData] = useState({
    serviceID: "",
    amount: 0,
    phone: "",
    quantity: 1
  });

  const [loading, setLoading] = useState(false);

  const handleExamChange = (id: string) => {
    const selected = EXAMS.find(e => e.id === id);
    if (selected) {
      setFormData({ 
        ...formData, 
        serviceID: selected.id, 
        amount: selected.price 
      });
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalCost = formData.amount * formData.quantity;

    if (!formData.serviceID) return toast.error("Select an exam type");
    if (!/^\d{11}$/.test(formData.phone)) return toast.error("Invalid phone number");
    if (totalCost > balance) return toast.error("Insufficient wallet balance");

    setLoading(true);
    try {
      const res = await buyEducation({
        serviceID: formData.serviceID,
        quantity: formData.quantity,
        amount: totalCost,
        phone: formData.phone
      });

      if (res?.code === "000" || res?.code === "099") {
        const isPending = res?.code === "099";
        // PINs are usually returned in the 'cards' or 'main_token' field
        const pinData = res.cards?.[0]?.pin || res.token || "Checking...";

        await deductBalance(totalCost, `Education: ${formData.serviceID.toUpperCase()}`, "Education");
        
        await addTransaction({
          description: `Exam PIN: ${formData.serviceID.toUpperCase()} (${formData.quantity} qty)`,
          amount: totalCost,
          type: "debit",
          category: "Education",
          status: isPending ? "pending" : "success",
          requestId: res.requestId,
          meta: { pin: pinData }
        });

        toast.success(isPending ? "Order Received" : "PIN Generated Successfully!");
        router.push("/dashboard");
      } else {
        throw new Error(res?.response_description || "Service Error");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all font-bold text-sm"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <header>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <GraduationCap className="text-primary" size={32} /> Education PINs
              </h1>
              <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Buy WAEC, JAMB & NECO Registration PINs</p>
            </header>

            <form onSubmit={handlePurchase} className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block ml-1">Select Examination</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EXAMS.map((exam) => (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => handleExamChange(exam.id)}
                      className={`p-5 rounded-3xl border-2 text-left transition-all flex justify-between items-center ${
                        formData.serviceID === exam.id 
                        ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                        : "border-gray-50 bg-gray-50 hover:border-gray-200"
                      }`}
                    >
                      <div>
                        <p className="font-black text-slate-800 text-sm">{exam.name}</p>
                        <p className="text-primary font-black text-xs">₦{exam.price.toLocaleString()}</p>
                      </div>
                      {formData.serviceID === exam.id && <CheckCircle2 className="text-primary" size={20} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3 ml-1">Receive PIN via Phone</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="tel"
                      maxLength={11}
                      placeholder="080..."
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-primary/5 font-bold transition-all"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, "")})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3 ml-1">Quantity</label>
                  <input 
                    type="number"
                    min={1}
                    max={5}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-slate-700"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
            </form>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
             <BookOpen className="absolute -right-10 -bottom-10 text-white/5" size={200} />
             <div className="relative z-10">
               <div className="flex items-center gap-3 opacity-40 mb-10 text-[10px] font-black uppercase tracking-widest">
                 <Wallet size={16} /> Wallet: ₦{balance.toLocaleString()}
               </div>

               <h3 className="text-xl font-black mb-8">Purchase Summary</h3>
               <div className="space-y-4 mb-10">
                 <div className="flex justify-between text-xs font-bold text-slate-400">
                   <span>Service</span>
                   <span className="text-white uppercase font-black">{formData.serviceID || "---"}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-slate-400">
                   <span>Quantity</span>
                   <span className="text-white font-black">{formData.quantity} PIN(s)</span>
                 </div>
                 <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                   <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Total Due</span>
                   <span className="text-4xl font-black text-white tracking-tighter">₦{(formData.amount * formData.quantity).toLocaleString()}</span>
                 </div>
               </div>

               <button 
                 onClick={handlePurchase}
                 disabled={loading || !formData.serviceID || !formData.phone}
                 className="w-full bg-primary text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
               >
                 {loading ? <Loader2 className="animate-spin mx-auto" /> : "Purchase PIN"}
               </button>
             </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-8 rounded-[40px] flex items-start gap-4">
             <AlertCircle className="text-blue-500 mt-1 shrink-0" size={20} />
             <div>
               <p className="text-xs font-black text-blue-900 uppercase mb-1">Instant Delivery</p>
               <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                 Your PIN will be displayed in your transaction history immediately. We also send a copy to the phone number provided.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}