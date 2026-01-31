"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { 
  Shirt, 
  Truck, 
  CheckCircle, 
  ChevronRight, 
  Loader2,
  Utensils
} from "lucide-react";
import toast from "react-hot-toast";

export default function PreferencesPage() {
  const router = useRouter();
  const { updateUserProfile } = useApp();
  const [loading, setLoading] = useState(false);

  const [prefs, setPrefs] = useState({
    laundry: "Standard",
    logistics: "Bike",
    food: {
      breakfast: ["Coffee", "Bread"],
      lunch: ["Rice", "Chicken"],
      dinner: ["Salad"],
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile({
        preferences: prefs,
        preferencesCompleted: true,
        preferencesCompletedAt: new Date(),
      });
      toast.success("Preferences updated!");
      router.push("/"); // Redirect to Home
    } catch (err) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Personalize COD</h1>
          <p className="text-sm text-gray-500 mt-2">Set your defaults for faster ordering</p>
        </div>

        <div className="space-y-8">
          <PreferenceSelector 
            icon={<Shirt size={18} />}
            label="Default Laundry"
            options={["Standard", "Express", "Dry Clean"]}
            current={prefs.laundry}
            onChange={(val: string) => setPrefs({...prefs, laundry: val})}
          />

          <PreferenceSelector 
            icon={<Truck size={18} />}
            label="Delivery Method"
            options={["Bike", "Car", "Van"]}
            current={prefs.logistics}
            onChange={(val: string) => setPrefs({...prefs, logistics: val})}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-10 bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#5200cc] transition-all disabled:bg-gray-300 shadow-lg shadow-primary/20 btn-active"
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Finish Setup <ChevronRight size={18} /></>}
        </button>
      </motion.div>
    </div>
  );
}

function PreferenceSelector({ icon, label, options, current, onChange }: any) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
        {icon} {label}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
              current === opt 
                ? "bg-primary border-primary text-white shadow-md scale-105" 
                : "bg-white border-gray-100 text-gray-500 hover:border-primary/30"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}