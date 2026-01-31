"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ArrowLeft, ShoppingBag, Truck, UserCheck, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function FoodServicePage() {
  const router = useRouter();
  const { balance, deductBalance, createOrder, userProfile } = useApp();
  const [meals, setMeals] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // User Selection States
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
  const [method, setMethod] = useState<"delivery" | "pickup">("pickup");
  const [selectedArea, setSelectedArea] = useState<any>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      const mSnap = await getDocs(collection(db, "meals"));
      setMeals(mSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const aSnap = await getDocs(collection(db, "areas"));
      setAreas(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchMenu();
  }, []);

  const mealTotal = selectedMeal ? selectedMeal.basePrice : 0;
  const extrasTotal = selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
  const deliveryFee = method === "delivery" ? (selectedArea?.fee || 0) : 0;
  const grandTotal = mealTotal + extrasTotal + deliveryFee;

  const toggleExtra = (extra: any) => {
    setSelectedExtras(prev => 
      prev.find(e => e.name === extra.name) 
        ? prev.filter(e => e.name !== extra.name) 
        : [...prev, extra]
    );
  };

  const handleCheckout = async () => {
    if (!selectedMeal) return toast.error("Select a meal first");
    if (method === "delivery" && !selectedArea) return toast.error("Select delivery area");
    if (balance < grandTotal) return toast.error("Insufficient Balance");

    setIsProcessing(true);
    try {
      await deductBalance(grandTotal, `Food Order: ${selectedMeal.name}`, "food");
  
  const orderId = await createOrder({
    userId: userProfile?.uid,
    userName: userProfile?.fullName,
        meal: selectedMeal.name,
        extras: selectedExtras,
        total: grandTotal,
        method,
        deliveryFee,
        area: selectedArea?.name || "Pickup",
      });
      toast.success("Order Placed!");
      router.push(`/orders/receipt/${orderId}`);
    } catch (e) {
      toast.error("Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-bold">Loading Menu...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 pb-40 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        <h1 className="text-4xl font-black">Mobile Restaurant</h1>
        
        {/* Method Toggle */}
        <div className="flex bg-gray-100 p-2 rounded-2xl">
          <button onClick={() => setMethod("pickup")} className={`flex-1 py-3 rounded-xl font-bold transition-all ${method === "pickup" ? "bg-white shadow-md text-primary" : "text-gray-400"}`}>
            <UserCheck className="inline mr-2" size={18}/> Pickup
          </button>
          <button onClick={() => setMethod("delivery")} className={`flex-1 py-3 rounded-xl font-bold transition-all ${method === "delivery" ? "bg-white shadow-md text-primary" : "text-gray-400"}`}>
            <Truck className="inline mr-2" size={18}/> Delivery
          </button>
        </div>

        {/* Meal List */}
        <div className="grid md:grid-cols-2 gap-4">
          {meals.map(meal => (
            <div 
              key={meal.id} 
              onClick={() => { setSelectedMeal(meal); setSelectedExtras([]); }}
              className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all ${selectedMeal?.id === meal.id ? "border-primary bg-primary/5" : "border-gray-100"}`}
            >
              <h3 className="font-bold text-xl">{meal.name}</h3>
              <p className="text-primary font-black">₦{meal.basePrice.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Extras - Only shown if meal selected */}
        {selectedMeal && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-bold text-gray-500 mb-4 uppercase text-xs tracking-widest">Add Extras</h3>
            <div className="flex flex-wrap gap-3">
              {selectedMeal.extras?.map((extra: any) => (
                <button 
                  key={extra.name}
                  onClick={() => toggleExtra(extra)}
                  className={`px-6 py-3 rounded-2xl border-2 font-bold transition-all ${selectedExtras.find(e => e.name === extra.name) ? "bg-primary border-primary text-white" : "bg-white border-gray-100 text-gray-600"}`}
                >
                  {extra.name} (+₦{extra.price})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Checkout Sidebar */}
      <div className="bg-white p-8 rounded-[40px] border shadow-2xl h-fit sticky top-10">
        <h2 className="font-black text-2xl mb-6">Summary</h2>
        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-400">Meal</span>
            <span>{selectedMeal?.name || "None"}</span>
          </div>
          {selectedExtras.map(e => (
            <div key={e.name} className="flex justify-between text-xs text-gray-500 italic">
              <span>+ {e.name}</span>
              <span>₦{e.price}</span>
            </div>
          ))}
          {method === "delivery" && (
            <div className="pt-4 border-t border-dashed">
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Destination</p>
              <select onChange={(e) => setSelectedArea(areas.find(a => a.id === e.target.value))} className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none font-bold text-sm">
                <option value="">Choose Area</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.name} (₦{a.fee})</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="pt-6 border-t flex justify-between items-center mb-8">
          <span className="font-bold text-gray-400">Total Bill</span>
          <span className="text-3xl font-black text-primary">₦{grandTotal.toLocaleString()}</span>
        </div>

        <button 
          disabled={!selectedMeal || isProcessing || (method === 'delivery' && !selectedArea)}
          onClick={handleCheckout}
          className="w-full bg-primary text-white py-5 rounded-3xl font-black shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:bg-gray-100"
        >
          {isProcessing ? <Loader2 className="animate-spin mx-auto"/> : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
}