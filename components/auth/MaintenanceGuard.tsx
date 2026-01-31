"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext"; // Import useApp to access profile data
import { ShieldCheck, Lock, Construction } from "lucide-react";

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { userProfile } = useApp(); // userProfile comes from AppContext
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for the global maintenance flag in Firestore
    const unsub = onSnapshot(doc(db, "system", "settings"), (snap) => {
      if (snap.exists()) {
        setIsMaintenance(snap.data().maintenanceMode);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Allow Admins to bypass maintenance mode
  const isAdmin = user && userProfile?.role === "admin";

  if (loading) return null;

  // If maintenance is ON and the user is NOT an admin, show the lock screen
  if (isMaintenance && !isAdmin) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Visual Indicator */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-primary/10 rounded-[32px] animate-pulse" />
            <div className="relative flex items-center justify-center h-full text-primary">
              <Construction size={48} />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
              Upgrading BUBU...
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              We're currently performing scheduled maintenance to improve your experience. We'll be back online shortly!
            </p>
          </div>

          {/* Verification Badge */}
          <div className="pt-8 border-t border-slate-50 flex items-center justify-center gap-3 text-slate-300">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure System Lockdown</span>
          </div>
        </div>
      </div>
    );
  }

  // If maintenance is OFF, or user IS an admin, show the app content
  return (
    <>
      {isMaintenance && isAdmin && (
        <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.3em] py-2 text-center sticky top-0 z-[100] flex items-center justify-center gap-2">
          <Lock size={12} /> Maintenance Mode Active — Admin Bypass Enabled
        </div>
      )}
      {children}
    </>
  );
}