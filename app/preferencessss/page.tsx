"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  Heart, 
  ShoppingBag, 
  Zap, 
  Truck, 
  Star
} from "lucide-react";
import toast from "react-hot-toast";

const PREFERENCE_OPTIONS = [
  { id: "food", label: "Food & Dining", icon: <ShoppingBag size={20} /> },
  { id: "laundry", label: "Laundry Services", icon: <Zap size={20} /> },
  { id: "logistics", label: "Logistics & Delivery", icon: <Truck size={20} /> },
  { id: "doctor", label: "Health & Doctors", icon: <Heart size={20} /> },
];

export default function PreferencesPage() {
  const router = useRouter();
  const { userProfile } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const togglePreference = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSavePreferences = async () => {
    if (selected.length === 0) return toast.error("Please select at least one interest");
    if (!userProfile?.uid) return toast.error("User session not found");

    setIsSaving(true);
    try {
      const userRef = doc(db, "users", userProfile.uid);
      await updateDoc(userRef, {
        preferences: selected,
        preferencesCompleted: true,
      });
      
      toast.success("Preferences saved!");
      router.replace("/dashboard");
    } catch (err) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="w-24 h-24 relative mb-4">
                <Image 
                  src="/logo.jpg" 
                  alt="CallOnDemand Logo" 
                  fill 
                  className="object-contain"
                  priority 
                />
            </div>
        </div>
        <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">
          Personalize Your Experience
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium px-4">
            Select the services you are most interested in to help us customize your dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl rounded-[2.5rem] sm:px-10 border border-gray-100">
          
          <div className="grid grid-cols-1 gap-4 mb-8">
            {PREFERENCE_OPTIONS.map((opt) => {
              const isActive = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => togglePreference(opt.id)}
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                    isActive 
                      ? "border-primary bg-primary/5 text-primary shadow-sm" 
                      : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isActive ? 'bg-primary text-white' : 'bg-white text-gray-400'}`}>
                      {opt.icon}
                    </div>
                    <span className="font-bold text-sm">{opt.label}</span>
                  </div>
                  {isActive && <CheckCircle2 size={20} className="text-primary" />}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSavePreferences}
              disabled={isSaving || selected.length === 0}
              className="w-full flex justify-center items-center py-5 px-4 rounded-2xl text-sm font-black text-white bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 disabled:bg-gray-200 transition-all active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : (
                <>Finish & Explore <ChevronRight className="ml-2" size={18} /></>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
              <Star size={12} /> Personalized for you
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}