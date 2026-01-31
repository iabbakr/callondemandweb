"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { buyAirtime } from "@/lib/vtpass";
import { 
  ArrowLeft, 
  Loader2, 
  Phone, 
  Wallet,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";

const NETWORKS = [
  { id: "mtn", name: "MTN", logo: "/icons/mtn.png" },
  { id: "glo", name: "GLO", logo: "/icons/glo.png" },
  { id: "airtel", name: "Airtel", logo: "/icons/airtel.png" },
  { id: "9mobile", name: "9mobile", logo: "/icons/9mobile.png" },
];

export default function AirtimePage() {
  const router = useRouter();
  const { balance, deductBalance, addTransaction } = useApp();
  
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);

    // Validation
    if (!/^\d{11}$/.test(phone)) return toast.error("Invalid phone number");
    if (amt < 100) return toast.error("Minimum purchase is ₦100");
    if (amt > balance) return toast.error("Insufficient wallet balance");
    if (!network) return toast.error("Please select a network provider");

    setLoading(true);
    try {
      // Logic: 9mobile is 'etisalat' in VTpass serviceID
      const res = await buyAirtime({ 
        serviceID: network === "9mobile" ? "etisalat" : network, 
        amount: amt, 
        phone 
      });

      // Handle Success (000) or Pending (099)
      if (res?.code === "000" || res?.code === "099") {
        const isPending = res?.code === "099";

        // 1. Deduct balance from the local state/context immediately
        await deductBalance(amt, `${network.toUpperCase()} Airtime to ${phone}`, "Airtime");

        // 2. Add the record to Firestore via your addTransaction function
        await addTransaction({
          description: `${network.toUpperCase()} Airtime to ${phone}`,
          amount: amt,
          type: "debit",
          category: "Airtime",
          status: isPending ? "pending" : "success",
          requestId: res.requestId || res.content?.transactions?.requestId, // Used by webhook to find this txn
        });

        if (isPending) {
          toast.success("Transaction is processing. Airtime will arrive shortly.", {
            icon: <Clock className="text-amber-500" />,
            duration: 5000
          });
        } else {
          toast.success("Airtime purchased successfully!");
        }

        router.push("/dashboard");
      } else {
        // Handle specific VTpass error codes
        throw new Error(res?.response_description || "Service provider error. Please try again.");
      }
    } catch (err: any) {
      console.error("Purchase Error:", err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold text-sm"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* --- MAIN FORM --- */}
        <div className="lg:col-span-2">
          <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
            <h1 className="text-3xl font-black mb-10 tracking-tight text-slate-900">Buy Airtime</h1>
            
            <form onSubmit={handlePurchase} className="space-y-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3 ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="tel"
                      maxLength={11}
                      className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                      placeholder="08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3 ml-1">
                    Amount (₦)
                  </label>
                  <input 
                    type="number"
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-black text-2xl text-primary"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-5 ml-1">
                  Select Provider
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {NETWORKS.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setNetwork(n.id)}
                      className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${
                        network === n.id 
                          ? "border-primary bg-primary/5 shadow-lg scale-105" 
                          : "border-gray-50 bg-gray-50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                      }`}
                    >
                      <div className="w-14 h-14 relative rounded-2xl overflow-hidden shadow-sm">
                        <Image src={n.logo} alt={n.name} fill className="object-cover" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{n.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading || !network || !phone || !amount}
                className="w-full bg-primary text-white py-5 rounded-[2rem] font-black text-sm shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Confirm Purchase"}
              </button>
            </form>
          </section>
        </div>

        {/* --- SIDEBAR INFO --- */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl">
             <div className="flex items-center gap-3 opacity-60 mb-2">
               <Wallet size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">Available Balance</span>
             </div>
             <h2 className="text-4xl font-black tracking-tighter">₦{balance.toLocaleString()}</h2>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
            <h4 className="text-amber-800 font-bold text-sm flex items-center gap-2 mb-2 uppercase tracking-tighter">
              <Clock size={16} /> Quick Note
            </h4>
            <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
              If your transaction is delayed, our system will automatically verify it within 5-10 minutes. 
              Refunds for failed purchases are instant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}