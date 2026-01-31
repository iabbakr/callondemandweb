"use client";

import React from 'react';
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { 
  Wallet, Plus, ArrowUpRight, ArrowDownLeft, 
  Zap, Smartphone, Landmark, Tv, Droplets, 
  ChevronRight, History 
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const { balance, transactions } = useApp(); // Live data from AppContext

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      
      {/* 1. Header Section */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 font-medium">Welcome back, {user?.displayName || 'Chief'}</p>
        </div>
        <Link href="/finance/history" className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-primary transition-colors">
          <History size={20} />
        </Link>
      </header>

      {/* 2. Balance Card (MacBook Style) */}
      <div className="bg-primary rounded-[40px] p-10 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
        {/* Decorative Glow */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
        
        <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Wallet Balance</p>
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mt-4 gap-6">
          <h2 className="text-5xl font-black tracking-tighter">₦{balance.toLocaleString()}</h2>
          
          <div className="flex gap-3">
            <Link href="/finance" className="bg-white text-primary px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-lg">
              <Plus size={18} /> Add Funds
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* 3. Quick Actions & Utilities (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Cash Flow</h2>
            <div className="grid grid-cols-3 gap-4">
              <QuickActionItem icon={<ArrowUpRight />} label="Send" bg="bg-accent/50 text-primary" href="/finance/send" />
              <QuickActionItem icon={<ArrowDownLeft />} label="Request" bg="bg-green-50 text-green-600" href="/finance/request" />
              <QuickActionItem icon={<Landmark />} label="Withdraw" bg="bg-orange-50 text-orange-600" href="/finance/withdraw" />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Utilities</h2>
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-8">
              <UtilityItem icon={<Smartphone />} label="Airtime" color="text-blue-500" href="/utilities/airtime" />
              <UtilityItem icon={<Zap />} label="Data" color="text-purple-500" href="/utilities/data" />
              <UtilityItem icon={<Tv />} label="Cable TV" color="text-red-500" href="/utilities/cable" />
              <UtilityItem icon={<Droplets />} label="Electricity" color="text-yellow-600" href="/utilities/electricity" />
            </div>
          </section>
        </div>

        {/* 4. Recent Transactions (Sidebar style) */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
            <Link href="/finance/history" className="text-primary hover:underline text-xs font-bold flex items-center">
              All <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-6">
            {transactions.slice(0, 5).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 line-clamp-1">{tx.description}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{tx.category}</p>
                  </div>
                </div>
                <p className={`text-xs font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xs text-gray-300 font-black uppercase tracking-widest">No History</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components with Logic
function QuickActionItem({ icon, label, bg, href }: { icon: any, label: string, bg: string, href: string }) {
  return (
    <Link href={href} className={`${bg} flex flex-col items-center p-6 rounded-[2rem] transition-all hover:scale-[1.02] active:scale-95 border border-transparent hover:border-current/10`}>
      <div className="bg-white p-3 rounded-full mb-3 shadow-sm">{icon}</div>
      <span className="text-xs font-black uppercase tracking-tight">{label}</span>
    </Link>
  );
}

function UtilityItem({ icon, label, color, href }: { icon: any, label: string, color: string, href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-3 group">
      <div className={`p-4 rounded-2xl bg-gray-50 ${color} group-hover:bg-primary group-hover:text-white transition-all group-hover:scale-110 shadow-sm group-hover:shadow-primary/20`}>
        {icon}
      </div>
      <span className="text-[11px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-tighter transition-colors">{label}</span>
    </Link>
  );
}