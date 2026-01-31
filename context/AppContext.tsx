"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  doc, onSnapshot, collection, query, orderBy, where, 
  updateDoc, increment, serverTimestamp, addDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

export type Transaction = any;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category?: string;
  desc?: string;
}

export interface UserProfile {
  uid: string;
  role: "admin" | "user" | "agent" | "operator";
  balance: number;
  bonusBalance: number;
  fullName: string;
  referralCode?: string;
  // ... other fields
}

interface AppContextProps {
  userProfile: UserProfile | null;
  isLoading: boolean;
  balance: number;
  bonusBalance: number;
  transactions: Transaction[];
  referredUsers: any[];
  // --- Cart System ---
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, delta: number) => void;
  clearCart: () => void;
  // --- Finance & Ordering ---
  deductBalance: (amount: number, description: string, category: string) => Promise<void>;
  addTransaction: (data: any) => Promise<void>;
  createOrder: (orderData: any) => Promise<string>;
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
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Cart Persistence Logic
  useEffect(() => {
    const savedCart = localStorage.getItem("cod_cart");
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error("Cart Parse Error", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cod_cart", JSON.stringify(cart));
  }, [cart]);

  // 2. Main Data Listeners
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setTransactions([]);
      setReferredUsers([]);
      setLoading(false);
      return;
    }

    // Listen to Profile & Balance
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Omit<UserProfile, 'uid'>;
        setUserProfile({ uid: snap.id, ...data });
        setBalance(data.balance ?? 0);
        setBonusBalance(data.bonusBalance ?? 0);
      }
      setLoading(false);
    });

    // Transaction Listener
    const txRef = collection(db, "users", user.uid, "transactions");
    const qTx = query(txRef, orderBy("date", "desc"));
    const unsubTx = onSnapshot(qTx, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Referred Users Listener
    const usersRef = collection(db, "users");
    const qRef = query(usersRef, where("referredBy", "==", user.uid));
    const unsubRef = onSnapshot(qRef, (snap) => {
      setReferredUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubUser();
      unsubTx();
      unsubRef();
    };
  }, [user]);

  // --- CART SYSTEM METHODS ---
  const addToCart = (item: Omit<CartItem, 'qty'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return { ...item, qty: Math.max(0, newQty) };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const clearCart = () => setCart([]);

  // --- FINANCE & ORDERING METHODS ---
  const deductBalance = async (amount: number, description: string, category: string) => {
    if (!user) throw new Error("Unauthenticated");
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      balance: increment(-amount)
    });
  };

  const addTransaction = async (data: any) => {
    if (!user) return;
    const txRef = collection(db, "users", user.uid, "transactions");
    await addDoc(txRef, {
      ...data,
      date: serverTimestamp(),
    });
  };

  const createOrder = async (orderData: any) => {
    if (!user) throw new Error("User not authenticated");
    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      status: "pending", // Default status
      createdAt: serverTimestamp(),
      invoiceId: `COD-${Math.floor(100000 + Math.random() * 900000)}`,
      customerUid: user.uid
    });
    return docRef.id;
  };

  const updateUserProfile = async (data: any) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), data);
  };

  return (
    <AppContext.Provider value={{ 
      userProfile, 
      isLoading: loading, 
      balance, 
      bonusBalance, 
      transactions, 
      referredUsers,
      cart,
      addToCart,
      removeFromCart,
      updateCartQty,
      clearCart,
      deductBalance, 
      addTransaction, 
      createOrder,
      updateUserProfile 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);