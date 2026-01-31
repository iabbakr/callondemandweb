"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, addDoc, query, where, getDocs, runTransaction } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface ExtraUserData {
  [key: string]: any;
  fullName: string;
  username: string;
  phoneNumber: string;
  location: string;
  gender: string;
  pin: string;
  referral?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  nameVerified?: boolean;
  paystackRecipientCode?: string | null;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signIn: (e: string, p: string) => Promise<void>;
  signUp: (e: string, p: string, d: ExtraUserData) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setLoading(false);
    });
    return unsub;
  }, []);

 const signIn = async (e: string, p: string) => {
  await signInWithEmailAndPassword(auth, e, p);
};

  const signUp = async (email: string, password: string, extraData: ExtraUserData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    const referralCode = `${extraData.fullName.split(" ")[0].toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // In web, we store the PIN and let Firebase Security Rules handle protection, 
    // or you can use a library like 'crypto-js' via npm if you prefer hashing client-side.
    const userRef = doc(db, "users", uid);

    await setDoc(userRef, {
      uid,
      email,
      ...extraData,
      balance: 0,
      bonusBalance: 100,
      referralCode,
      referralCount: 0,
      role: "user",
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, "users", uid, "transactions"), {
      description: "Sign-up Bonus",
      amount: 100,
      type: "credit",
      category: "Bonus",
      status: "success",
      date: serverTimestamp(),
    });
  };

  const logOut = async () => {
  await signOut(auth);
};
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);