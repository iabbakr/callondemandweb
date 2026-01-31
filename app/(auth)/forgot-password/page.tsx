"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Loader2, 
  AlertTriangle, 
  Mail, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!email) throw new Error("Please enter your email address");
      
      // Firebase standard reset flow
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Check your connection.");
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
        <h2 className="text-center text-3xl font-black text-gray-900 tracking-tight">
          {isSent ? "Check Your Mail" : "Reset Security PIN"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium px-4">
          {isSent 
            ? `We've sent a recovery link to ${email}` 
            : "Enter your email address and we'll send you a link to reset your password."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-xl rounded-[2.5rem] border border-gray-100 sm:px-12">
          
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700 text-sm font-bold">
              <AlertTriangle size={20} /> {error}
            </div>
          )}

          {!isSent ? (
            <form className="space-y-6" onSubmit={handleResetRequest}>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="block w-full pl-12 px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-5 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-black text-white bg-primary hover:bg-primary/90 shadow-purple-200 transition-all active:scale-95 disabled:bg-gray-300"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Send Recovery Link"
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="text-sm font-black text-primary hover:underline uppercase tracking-widest"
              >
                Try Another Email
              </button>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm font-black text-gray-400 hover:text-primary transition-colors group"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}