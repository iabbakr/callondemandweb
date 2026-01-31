"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { X, BellRing } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Define a type for your broadcast to keep things clean
interface Broadcast {
  id: string;
  title: string;
  message: string;
  timestamp: any;
}

export default function BroadcastListener() {
  const [activeBroadcast, setActiveBroadcast] = useState<Broadcast | null>(null);

  useEffect(() => {
    const q = query(collection(db, "broadcasts"), orderBy("timestamp", "desc"), limit(1));
    
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const docSnap = snap.docs[0]; // Get the first document from the array
        const data = docSnap.data() as Omit<Broadcast, 'id'>;
        
        // Use docSnap.id instead of snap.id
        const hasSeen = localStorage.getItem(`bc_${docSnap.id}`);
        
        if (!hasSeen) {
          setActiveBroadcast({ id: docSnap.id, ...data });
        }
      }
    });

    return () => unsub();
  }, []);

  if (!activeBroadcast) return null;

  const dismissBroadcast = () => {
    localStorage.setItem(`bc_${activeBroadcast.id}`, "true");
    setActiveBroadcast(null);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-24 right-6 md:right-10 z-[9999] w-[350px]"
      >
        <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary rounded-xl">
              <BellRing size={16} className="animate-bounce" />
            </div>
            <button 
              onClick={dismissBroadcast} 
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <h3 className="font-black text-sm uppercase tracking-tight">
            {activeBroadcast.title}
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {activeBroadcast.message}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}