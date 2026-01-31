"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Users, Copy, Share2, CheckCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ReferralTracking() {
  const { userProfile, referredUsers } = useApp();
  
  // Dynamic link generation using the user's unique referral code
  const referralLink = `https://callondemand.app/signup?ref=${userProfile?.referralCode || "COD-USER"}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <Link href="/rewards" className="flex items-center gap-2 text-gray-400 mb-4 hover:text-primary transition-colors group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        <span className="font-bold text-sm">Back to Rewards</span>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Link Sharing Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
              <Share2 size={32} />
            </div>
            <h2 className="text-2xl font-black mb-2">Invite Friends</h2>
            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-8">
              Earn <span className="text-primary font-bold">100 coins</span> for every friend who joins and verifies their account.
            </p>
            
            <div className="w-full space-y-3">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between overflow-hidden">
                <span className="text-[10px] font-mono text-gray-400 truncate mr-2">{referralLink}</span>
                <button onClick={copyToClipboard} className="text-primary hover:scale-110 transition-transform flex-shrink-0">
                  <Copy size={18} />
                </button>
              </div>
              <button 
                onClick={copyToClipboard}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
              >
                Copy My Link
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tracking Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                <Users size={20} className="text-primary" /> My Network
              </h3>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full">
                {referredUsers.length} JOINED
              </span>
            </div>

            <div className="overflow-x-auto">
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
                    <th className="px-8 py-4">User</th>
                    <th className="px-8 py-4">Date Joined</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {referredUsers.map((ref: any) => (
                    <tr key={ref.uid} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xs font-black text-primary">
                            {ref.fullName?.charAt(0) || "U"}
                          </div>
                          <span className="text-sm font-bold text-gray-900">{ref.fullName || "User"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-gray-400">
                        {ref.joinedAt?.toDate ? ref.joinedAt.toDate().toLocaleDateString() : "Pending"}
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-[10px] font-black text-green-600 uppercase rounded-full">
                          <CheckCircle size={12} /> Verified
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-sm text-primary">
                        +100 Coins
                      </td>
                    </tr>
                  ))}
                  
                  {referredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-24 text-center">
                        <div className="flex flex-col items-center justify-center opacity-20">
                          <Users size={64} className="mb-4" />
                          <p className="text-xs font-black uppercase tracking-[0.3em]">No referrals found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}