"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  doc, onSnapshot, collection, query, orderBy, where, 
  getDocs, updateDoc, increment, serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

// Reuse your exact types from the mobile app
export type UserProfile = any; // (Import your types here)
export type Transaction = any;

interface AppContextProps {
  userProfile: UserProfile | null;
  loading: boolean;
  balance: number;
  bonusBalance: number;
  transactions: Transaction[];
  referredUsers: any[];
  updateUserProfile: (data: any) => Promise<void>;
}

const AppContext = createContext<AppContextProps>({} as AppContextProps);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referredUsers, setReferredUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    // 1. Listen to Profile & Balance
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile(data);
        setBalance(data.balance ?? 0);
        setBonusBalance(data.bonusBalance ?? 0);
      }
      setLoading(false);
    });

    // 2. Combined Transaction Listener
    const txRef = collection(db, "users", user.uid, "transactions");
    const q = query(txRef, orderBy("date", "desc"));
    const unsubTx = onSnapshot(q, (snap) => {
      const txs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(txs);
    });

    return () => {
      unsubUser();
      unsubTx();
    };
  }, [user]);

  const updateUserProfile = async (data: any) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), data);
  };

  return (
    <AppContext.Provider value={{ 
      userProfile, loading, balance, bonusBalance, 
      transactions, referredUsers, updateUserProfile 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);