"use client";

import React, { useState } from 'react';
import { useApp } from "@/context/AppContext";
import { 
  Plus, ArrowUpRight, ArrowDownLeft, 
  Zap, Smartphone, Landmark, Tv, Droplets, 
  ChevronRight, History, Eye, EyeOff, ShoppingBag, Utensils, Truck, Shirt
} from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { userProfile, balance, transactions, isLoading } = useApp();
  const [showBalance, setShowBalance] = useState(true);
  
  const firstName = userProfile?.fullName?.split(' ')[0] || 'User';

  const services = [
    { name: "Food", image: "https://res.cloudinary.com/dswwtuano/image/upload/v1731212276/wewxrhop7oz1shofmz5f.jpg", icon: "🍲" },
    { name: "Logistics", image: "https://res.cloudinary.com/dswwtuano/image/upload/v1731212276/uyednw5ub2bshlqnchqa.jpg", icon: "📦" },
    { name: "Hotels", image: "https://res.cloudinary.com/dswwtuano/image/upload/v1731212667/hjlpy1k6mzyk7bokf8wq.jpg", icon: "🏨" },
    { name: "Transport", image: "https://res.cloudinary.com/dswwtuano/image/upload/v1731212274/x2p4l1xvbaock5hvrsby.jpg", icon: "🚗" },
    { name: "Laundry", image: "https://png.pngtree.com/png-vector/20240322/ourmid/pngtree-home-service-house-cleaning-and-laundry-wash-png-image_12190004.png", icon: "👕" },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 md:space-y-10 pb-32">
      
      {/* 1. Header Section */}
      <header className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-gray-900">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-xs md:text-sm text-gray-400 font-medium">Manage your funds and bills</p>
        </div>
        <Link href="/finance/history" className="p-2.5 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-primary shadow-sm active:scale-95 transition-all">
          <History size={18} />
        </Link>
      </header>

      {/* 2. Balance Card (Responsive Font Sizes) */}
      {isLoading ? (
        <div className="h-[180px] md:h-[220px] w-full bg-gray-200 animate-pulse rounded-[32px] md:rounded-[40px]" />
      ) : (
        <div className="bg-primary rounded-[32px] md:rounded-[40px] p-6 md:p-10 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 md:w-40 h-32 md:h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          
          <div className="flex items-center gap-2 mb-2 md:mb-4">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-70">Wallet Balance</p>
            <button onClick={() => setShowBalance(!showBalance)} className="opacity-70 hover:opacity-100">
              {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-5 md:gap-6">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
              {showBalance ? `₦${balance?.toLocaleString()}` : "₦ • • • •"}
            </h2>
            <Link href="/wallet/add-funds" className="bg-white text-primary px-6 py-4 rounded-2xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-lg w-full md:w-fit">
              <Plus size={18} /> Add Funds
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3. Quick Actions (3 columns mobile) */}
          <section>
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Cash Flow</h2>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <QuickActionItem icon={<ArrowUpRight size={18}/>} label="Send" bg="bg-indigo-50 text-indigo-600" href="/finance/send" />
              <QuickActionItem icon={<ArrowDownLeft size={18}/>} label="Receive" bg="bg-green-50 text-green-600" href="/finance/receive" />
              <QuickActionItem icon={<Landmark size={18}/>} label="Bank" bg="bg-orange-50 text-orange-600" href="/finance/withdraw" />
            </div>
          </section>

          {/* 4. Utilities Grid (4 columns responsive) */}
          <section>
            <h2 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">Utilities</h2>
            <div className="bg-white p-5 md:p-8 rounded-[28px] md:rounded-[32px] border border-gray-100 shadow-sm grid grid-cols-4 gap-y-8 gap-x-2 md:gap-8">
              <UtilityItem icon={<Smartphone size={20}/>} label="Airtime" color="text-blue-500" href="/utilities/airtime" />
              <UtilityItem icon={<Zap size={20}/>} label="Data" color="text-purple-500" href="/utilities/data" />
              <UtilityItem icon={<Tv size={20}/>} label="Cable" color="text-red-500" href="/utilities/cable" />
              <UtilityItem icon={<Droplets size={20}/>} label="Power" color="text-yellow-600" href="/utilities/electricity" />
              <UtilityItem icon={<Shirt size={20}/>} label="Laundry" color="text-indigo-600" href="/services/laundry" />
              <UtilityItem icon={<ShoppingBag size={20}/>} label="Shop" color="text-orange-500" href="/services/shop" />
              <UtilityItem icon={<Utensils size={20}/>} label="Food" color="text-red-400" href="/services/food" />
              <UtilityItem icon={<Truck size={20}/>} label="Logistics" color="text-emerald-600" href="/services/logistics" />
            </div>
          </section>
        </div>

        {/* 5. Recent Activity (Full width mobile) */}
        <div className="bg-white rounded-[28px] md:rounded-[32px] border border-gray-100 shadow-sm p-6 h-fit lg:sticky lg:top-24">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-sm md:text-base">Recent Activity</h3>
            <Link href="/finance/history" className="text-primary font-bold text-xs">View All</Link>
          </div>
          
          <div className="space-y-5">
            {transactions.slice(0, 5).map((tx: any) => (
              <Link 
                key={tx.id} 
                href={`/finance/receipt/${tx.id}`} 
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={cn(
                    "w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  )}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] md:text-xs font-bold text-gray-800 truncate">{tx.description}</p>
                    <p className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest">{tx.status}</p>
                  </div>
                </div>
                <p className={cn(
                  "text-[11px] md:text-xs font-black flex-shrink-0 ml-2",
                  tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                )}>
                  ₦{tx.amount.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Fixed Helper Components for small screens
function QuickActionItem({ icon, label, bg, href }: { icon: any, label: string, bg: string, href: string }) {
  return (
    <Link href={href} className={`${bg} flex flex-col items-center py-4 md:py-6 rounded-3xl transition-all hover:scale-[1.02] active:scale-95 shadow-sm`}>
      <div className="bg-white p-2.5 rounded-full mb-2 shadow-sm">{icon}</div>
      <span className="text-[10px] md:text-xs font-black uppercase tracking-tight">{label}</span>
    </Link>
  );
}

function UtilityItem({ icon, label, color, href }: { icon: any, label: string, color: string, href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 group">
      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gray-50 ${color} group-hover:bg-primary group-hover:text-white transition-all`}>
        {icon}
      </div>
      <span className="text-[9px] md:text-[11px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-tighter text-center">
        {label}
      </span>
    </Link>
  );
}