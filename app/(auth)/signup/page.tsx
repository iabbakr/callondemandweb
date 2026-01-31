"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { 
  Eye, EyeOff, CheckCircle2, XCircle, AlertTriangle, 
  ChevronRight, ArrowLeft, Loader2, Landmark
} from "lucide-react";
import { auth, db } from "@/lib/firebase"; 
import { useAuth } from "@/context/AuthContext";
import { collection, getDocs, query, where } from "firebase/firestore";

const BACKEND_URL = 'https://callondemand-backend.onrender.com';
const GENDER_OPTIONS = ["Male", "Female", "Other"];

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  
  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phoneNumber: "",
    gender: "",
    state: "",
    email: "",
    password: "",
    confirmPassword: "",
    pin: "",
    referral: "",
    accountNumber: "",
  });

  // Bank States
  const [bankList, setBankList] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountName, setAccountName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [nameVerified, setNameVerified] = useState(false);

  // Load Banks on Mount
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get("https://api.paystack.co/bank", {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}` }
        });
        setBankList(res.data.data);
      } catch (e) {
        console.error("Failed to load banks", e);
      }
    };
    fetchBanks();
  }, []);

  // Logical Helpers
  const verifyNameMatch = (userFullName: string, paystackName: string) => {
    const normalize = (name: string) => name.toLowerCase().trim().replace(/\s+/g, " ").split(" ").filter(w => w.length > 1);
    const uNames = normalize(userFullName);
    const pNames = normalize(paystackName);
    let matchCount = 0;
    uNames.forEach(n => { if (pNames.includes(n)) matchCount++; });
    return matchCount >= 2;
  };

  const handleVerifyBank = async () => {
    if (!selectedBank || formData.accountNumber.length !== 10) return;
    setVerifying(true);
    setError(null);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/paystack/resolve`, {
        params: { account_number: formData.accountNumber, bank_code: selectedBank.code }
      });
      const resName = res.data.data.account_name;
      setAccountName(resName);
      const isMatched = verifyNameMatch(formData.fullName, resName);
      setNameVerified(isMatched);
      if(!isMatched) setError("Name match failed. Please check your bank details.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleNextStep = () => {
    if (!formData.fullName || !formData.username || !formData.phoneNumber || !formData.gender || !formData.state) {
      return setError("Please fill all fields");
    }
    if (formData.fullName.trim().split(/\s+/).length < 2) {
      return setError("Full name must contain at least 2 names.");
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) throw new Error("Passwords mismatch");
      if (!nameVerified) throw new Error("Bank account must be verified.");
      
      const usersRef = collection(db, "users");
      const qEmail = query(usersRef, where("email", "==", formData.email));
      const snap = await getDocs(qEmail);
      if (!snap.empty) throw new Error("Email already exists");

      await signUp(formData.email, formData.password, {
        ...formData,
        location: formData.state, 
        bankName: selectedBank?.name,
        accountName,
        nameVerified: true
      });
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            {/* BRAND LOGO INTEGRATION */}
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
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {currentStep === 1 ? "Create Account" : "Security & Verification"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
            Step {currentStep} of 2
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-xl rounded-[2.5rem] sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700 text-sm font-bold">
              <AlertTriangle size={20} /> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleFinalSubmit}>
            {currentStep === 1 ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#6200EE]/20 focus:bg-white outline-none transition-all font-medium"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Username</label>
                        <input
                            type="text"
                            required
                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#6200EE]/20 focus:bg-white outline-none transition-all font-medium"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                        <input
                            type="tel"
                            required
                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#6200EE]/20 focus:bg-white outline-none transition-all font-medium"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gender</label>
                        <select 
                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#6200EE]/20 outline-none transition-all font-medium"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        >
                            <option value="">Select</option>
                            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">State</label>
                        <input
                            type="text"
                            placeholder="e.g. Lagos"
                            className="block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#6200EE]/20 outline-none transition-all font-medium"
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                        />
                    </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-2xl text-sm font-black text-white bg-[#6200EE] hover:bg-[#5200cc] shadow-lg shadow-purple-200 transition-all active:scale-95"
                >
                  Continue <ChevronRight className="ml-2" size={18} />
                </button>
              </>
            ) : (
              <>
                <button 
                    type="button" 
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center text-xs text-[#6200EE] font-black uppercase tracking-widest mb-6"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back to details
                </button>

                <div className="space-y-5">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#6200EE]/20 outline-none font-medium"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#6200EE]/20 outline-none font-medium"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400">
                            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                    </div>

                    <div className="bg-[#6200EE]/5 p-6 rounded-[2rem] border border-dashed border-[#6200EE]/20">
                        <h3 className="text-[10px] font-black text-[#6200EE] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Landmark size={14}/> Bank Verification
                        </h3>
                        
                        <select 
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm mb-4 outline-none font-medium"
                            onChange={(e) => setSelectedBank(bankList.find(b => b.code === e.target.value))}
                        >
                            <option value="">Select Bank</option>
                            {bankList.map((b, index) => (
                                <option key={`${b.code}-${index}`} value={b.code}>
                                    {b.name}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={10}
                                placeholder="Account Number"
                                className="flex-1 px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm outline-none font-medium"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                            />
                            <button 
                                type="button"
                                onClick={handleVerifyBank}
                                disabled={verifying || formData.accountNumber.length !== 10}
                                className="px-5 py-3 bg-[#6200EE] text-white rounded-xl text-xs font-black uppercase disabled:bg-gray-300 transition-all"
                            >
                                {verifying ? <Loader2 className="animate-spin" size={16}/> : "Verify"}
                            </button>
                        </div>

                        {accountName && (
                            <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase ${nameVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {nameVerified ? <CheckCircle2 size={14}/> : <XCircle size={14}/>}
                                {accountName}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            type={showPin ? "text" : "password"}
                            maxLength={4}
                            placeholder="4-Digit Security PIN"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#6200EE]/20 outline-none font-medium"
                            value={formData.pin}
                            onChange={(e) => setFormData({...formData, pin: e.target.value})}
                        />
                         <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-4 top-3.5 text-gray-400">
                            {showPin ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                    </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !nameVerified}
                  className="w-full flex justify-center items-center py-5 px-4 rounded-2xl text-sm font-black text-white bg-gray-900 hover:bg-black shadow-xl disabled:bg-gray-300 transition-all active:scale-95"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}