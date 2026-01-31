"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getDataPlans, buyData, DataPlan } from "@/lib/vtpass";
import { 
  Wifi, ArrowLeft, Loader2, 
  CheckCircle2, Info, ChevronRight, Database, Clock 
} from "lucide-react";
import toast from "react-hot-toast";

export default function DataPage() {
  const router = useRouter();
  const { balance, deductBalance, addTransaction } = useApp();
  
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("");
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(false);

  useEffect(() => {
    if (network) {
      setFetchingPlans(true);
      setSelectedPlan(null);
      // VTpass uses 'mtn-data', 'glo-data', etc.
      getDataPlans(`${network}-data`)
        .then(setPlans)
        .catch(() => toast.error("Error loading plans"))
        .finally(() => setFetchingPlans(false));
    }
  }, [network]);

  const handleBuy = async () => {
    if (!selectedPlan || !phone) return;
    const amt = parseFloat(selectedPlan.variation_amount);

    if (!/^\d{11}$/.test(phone)) return toast.error("Invalid phone number");
    if (amt > balance) return toast.error("Insufficient wallet balance");
    
    setLoading(true);
    try {
      const res = await buyData({
        serviceID: `${network}-data`,
        billersCode: phone,
        variation_code: selectedPlan.variation_code,
        amount: amt,
        phone,
      });

      if (res?.code === "000" || res?.code === "099") {
        const isPending = res?.code === "099";

        await deductBalance(amt, `${selectedPlan.name} to ${phone}`, "Data");
        await addTransaction({
          description: `Data: ${selectedPlan.name} (${phone})`,
          amount: amt,
          type: "debit",
          category: "Data",
          status: isPending ? "pending" : "success",
          requestId: res.requestId
        });

        if (isPending) {
          toast.success("Transaction processing. Data will be active shortly.", {
            icon: <Clock className="text-amber-500" />
          });
        } else {
          toast.success("Subscription Active!");
        }
        
        router.push("/dashboard");
      } else {
        throw new Error(res?.response_description || "Subscription failed");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold text-sm"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Data Bundles</h1>
        <p className="text-gray-500 font-medium mt-1">High-speed internet for any network.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2 ml-1">Network</label>
                <select 
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                >
                  <option value="">Select Network</option>
                  <option value="mtn">MTN</option>
                  <option value="airtel">Airtel</option>
                  <option value="glo">Glo</option>
                  <option value="etisalat">9mobile</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2 ml-1">Phone Number</label>
                <input 
                  type="tel"
                  maxLength={11}
                  placeholder="08012345678"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            {fetchingPlans ? (
              <div className="py-20 flex flex-col items-center gap-4 opacity-30 text-center">
                <Loader2 className="animate-spin text-primary" size={32} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retrieving Plans...</span>
              </div>
            ) : network ? (
              <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {plans.map((plan) => (
                  <button
                    key={plan.variation_code}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-5 rounded-3xl border-2 flex justify-between items-center transition-all ${
                      selectedPlan?.variation_code === plan.variation_code
                      ? "border-primary bg-primary/5 scale-[1.01] shadow-md"
                      : "border-gray-50 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-800 text-sm">{plan.name}</p>
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">
                        CODE: {plan.variation_code}
                      </p>
                    </div>
                    <span className="text-lg font-black text-primary">₦{parseFloat(plan.variation_amount).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[30px]">
                <Wifi className="mx-auto text-gray-200 mb-4" size={40} />
                <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Select a network to view plans</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
           <div className="bg-slate-900 p-10 rounded-[40px] border border-slate-800 shadow-2xl sticky top-6 text-white">
              <h3 className="font-black mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Database size={20} />
                </div> 
                Checkout
              </h3>
              
              <div className="space-y-6 mb-10">
                <SummaryRow label="Network" value={network || "None"} uppercase />
                <SummaryRow label="Recipient" value={phone || "---"} />
                <SummaryRow label="Plan" value={selectedPlan?.name || "None"} />
                <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                   <span className="text-xs font-black uppercase text-white/40 tracking-widest">Amount</span>
                   <span className="text-4xl font-black text-primary tracking-tighter">₦{selectedPlan ? parseFloat(selectedPlan.variation_amount).toLocaleString() : "0"}</span>
                </div>
              </div>

              <button 
                onClick={handleBuy}
                disabled={!selectedPlan || !phone || loading}
                className="w-full bg-primary text-white py-6 rounded-3xl font-black shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Purchase Data"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, uppercase = false }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">{label}</span>
      <span className={`text-sm font-bold text-white ${uppercase ? 'uppercase' : ''}`}>{value}</span>
    </div>
  );
}