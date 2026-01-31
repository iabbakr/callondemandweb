"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { verifyMeterNumber, buyElectricity } from "@/lib/vtpass";
import { 
  ArrowLeft, Loader2, Zap, 
  User, CheckCircle2, Wallet, Clock, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const DISCOS = [
  { id: "ikeja-electric", name: "Ikeja Electric" },
  { id: "eko-electric", name: "Eko Electric" },
  { id: "kano-electric", name: "Kano Electric" },
  { id: "portharcourt-electric", name: "PHED" },
  { id: "jos-electric", name: "Jos Electric" },
  { id: "ibadan-electric", name: "Ibadan Electric" },
  { id: "kaduna-electric", name: "Kaduna Electric" },
  { id: "abuja-electric", name: "AEDC" },
];

export default function ElectricityPage() {
  const router = useRouter();
  const { balance, deductBalance, addTransaction } = useApp();

  const [formData, setFormData] = useState({
    serviceID: "",
    billersCode: "",
    type: "prepaid" as "prepaid" | "postpaid",
    amount: "",
    phone: ""
  });

  const [verifiedName, setVerifiedName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!formData.serviceID || !formData.billersCode) return toast.error("Select Disco and enter Meter No.");
    
    setVerifying(true);
    setVerifiedName("");
    try {
      const data = await verifyMeterNumber({
        serviceID: formData.serviceID,
        billersCode: formData.billersCode,
        type: formData.type
      });
      setVerifiedName(data.Customer_Name);
      toast.success("Meter Verified");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(formData.amount);

    if (amt > balance) return toast.error("Insufficient balance");
    if (!verifiedName) return toast.error("Please verify meter first");

    setLoading(true);
    try {
      const res = await buyElectricity({
        ...formData,
        amount: amt,
        variation_code: formData.type
      });

      if (res?.code === "000" || res?.code === "099") {
        const isPending = res?.code === "099";
        const token = res.token || res.main_token || "Token pending...";

        await deductBalance(amt, `Power: ${formData.billersCode}`, "Electricity");
        await addTransaction({
          description: `Electricity: ${formData.billersCode} (${formData.serviceID.toUpperCase()})`,
          amount: amt,
          type: "debit",
          category: "Electricity",
          status: isPending ? "pending" : "success",
          requestId: res.requestId,
          meta: { token }
        });

        toast.success(isPending ? "Payment Pending..." : "Token Generated Successfully!");
        router.push("/dashboard");
      } else {
        throw new Error(res?.response_description || "Payment failed");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all font-bold text-sm">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Zap className="text-primary fill-primary/20" /> Electricity
            </h1>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Select Disco</label>
                <select 
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-slate-700 focus:ring-4 focus:ring-primary/5 transition-all"
                  value={formData.serviceID}
                  onChange={e => setFormData({...formData, serviceID: e.target.value})}
                >
                  <option value="">Select Provider</option>
                  {DISCOS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Meter Number</label>
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-slate-700"
                    placeholder="Enter Meter ID"
                    value={formData.billersCode}
                    onChange={e => setFormData({...formData, billersCode: e.target.value})}
                  />
                  <button 
                    onClick={handleVerify}
                    disabled={verifying}
                    className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-4 rounded-xl text-[10px] font-black uppercase hover:bg-primary transition-all disabled:opacity-30"
                  >
                    {verifying ? <Loader2 size={14} className="animate-spin" /> : "Verify"}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Meter Type</label>
                <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                  <button 
                    onClick={() => setFormData({...formData, type: 'prepaid'})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.type === 'prepaid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                  >Prepaid</button>
                  <button 
                    onClick={() => setFormData({...formData, type: 'postpaid'})}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${formData.type === 'postpaid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}
                  >Postpaid</button>
                </div>
              </div>
            </div>

            {verifiedName && (
              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4 animate-in zoom-in-95 duration-300">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Customer Confirmed</p>
                  <p className="font-black text-emerald-900 uppercase">{verifiedName}</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Amount (₦)</label>
                <input 
                  type="number"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-black text-2xl text-primary"
                  placeholder="0"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Confirm Phone</label>
                <input 
                  type="tel"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-slate-700"
                  placeholder="080..."
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
            <Zap className="absolute -right-10 -bottom-10 text-white/5" size={200} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 opacity-60 mb-8 uppercase tracking-widest text-[10px] font-black">
                <Wallet size={16} /> Balance: ₦{balance.toLocaleString()}
              </div>

              <h3 className="text-xl font-black mb-6">Payment Summary</h3>
              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Provider</span>
                  <span className="text-white uppercase">{formData.serviceID || "---"}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Meter No</span>
                  <span className="text-white">{formData.billersCode || "---"}</span>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-primary">Total Payable</span>
                  <span className="text-4xl font-black text-white tracking-tighter">₦{parseFloat(formData.amount || "0").toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading || !verifiedName || !formData.amount}
                className="w-full bg-primary text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Pay Now"}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-[32px] flex items-start gap-4">
             <AlertCircle className="text-blue-500 mt-1" size={20} />
             <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
               Always verify the meter number before payment. For prepaid meters, your token will be visible in your transaction history immediately after confirmation.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}