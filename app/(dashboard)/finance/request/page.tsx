"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { 
  ArrowLeft, 
  Copy, 
  QrCode, 
  Share2, 
  User, 
  CheckCircle2,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

export default function RequestMoneyPage() {
  const router = useRouter();
  const { userProfile } = useApp();
  const [copied, setCopied] = useState(false);

  // The request identifier is the user's unique username
  const username = userProfile?.username || "loading...";
  const requestLink = `https://callondemand.app/pay/${username}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-gray-400 mb-8 hover:text-primary transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Request Card */}
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 relative mb-6">
            <Image 
              src="/logo.jpg" 
              alt="CallOnDemand Logo" 
              fill 
              className="object-contain rounded-2xl shadow-lg"
            />
          </div>
          
          <h1 className="text-2xl font-black text-gray-900 mb-2">Receive Money</h1>
          <p className="text-sm text-gray-400 font-medium mb-8">
            Share your details to receive funds instantly from other users.
          </p>

          <div className="w-full space-y-4">
            {/* Username Display */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Your Receive ID</span>
              <p className="text-xl font-black text-primary">@{username}</p>
              <button 
                onClick={() => copyToClipboard(username)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-primary transition-all active:scale-90"
              >
                {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>

            {/* Payment Link */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Payment Link</span>
              <p className="text-xs font-bold text-slate-600 truncate pr-12">{requestLink}</p>
              <button 
                onClick={() => copyToClipboard(requestLink)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-xl shadow-sm text-slate-400 hover:text-primary transition-all active:scale-90"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Instructions & Security */}
        <div className="space-y-6">
          <div className="bg-primary p-8 rounded-[40px] text-white shadow-xl shadow-primary/20">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
              <QrCode size={24} />
            </div>
            <h2 className="text-xl font-black mb-4">How it works</h2>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm font-medium opacity-90">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">1</div>
                Copy your unique @username or payment link.
              </li>
              <li className="flex gap-3 text-sm font-medium opacity-90">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">2</div>
                Send it to the person you are requesting money from.
              </li>
              <li className="flex gap-3 text-sm font-medium opacity-90">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">3</div>
                Funds are credited to your wallet balance instantly once they pay.
              </li>
            </ul>
          </div>

          <div className="p-8 bg-blue-50 rounded-[40px] border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm">
                <Info size={20} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Safe & Secure</h4>
                <p className="text-[11px] text-blue-700 leading-relaxed font-medium mt-1">
                  Only share your username or official CallOnDemand links. We will never ask for your PIN or password via a request link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}