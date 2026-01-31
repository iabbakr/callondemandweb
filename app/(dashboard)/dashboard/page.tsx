"use client";

import React, { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
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
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      
      {/* 1. Header Section */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-400 font-medium">Manage your funds and bills</p>
        </div>
        <Link href="/finance/history" className="p-3 bg-white rounded-2xl border border-gray-100 text-gray-400 hover:text-primary transition-all shadow-sm active:scale-95">
          <History size={20} />
        </Link>
      </header>

      {/* 2. Balance Card */}
      {isLoading ? (
        <div className="h-[220px] w-full bg-gray-200 animate-pulse rounded-[40px]" />
      ) : (
        <div className="bg-primary rounded-[40px] p-10 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          
          <div className="flex items-center gap-2 mb-4">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Wallet Balance</p>
            <button onClick={() => setShowBalance(!showBalance)} className="opacity-70 hover:opacity-100">
              {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <h2 className="text-5xl font-black tracking-tighter">
              {showBalance ? `₦${balance?.toLocaleString()}` : "₦ • • • •"}
            </h2>
            <Link href="/wallet/add-funds" className="bg-white text-primary px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-lg w-fit">
              <Plus size={18} /> Add Funds
            </Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3. Quick Actions */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Transfer & Cash</h2>
            <div className="grid grid-cols-3 gap-4">
              <QuickActionItem icon={<ArrowUpRight />} label="Send" bg="bg-indigo-50 text-indigo-600" href="/finance/send" />
              <QuickActionItem icon={<ArrowDownLeft />} label="Receive" bg="bg-green-50 text-green-600" href="/finance/receive" />
              <QuickActionItem icon={<Landmark />} label="Withdraw" bg="bg-orange-50 text-orange-600" href="/finance/withdraw" />
            </div>
          </section>

          {/* 4. Utilities Grid */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Utilities & Payments</h2>
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-8">
              <UtilityItem icon={<Smartphone />} label="Airtime" color="text-blue-500" href="/utilities/airtime" />
              <UtilityItem icon={<Zap />} label="Data" color="text-purple-500" href="/utilities/data" />
              <UtilityItem icon={<Tv />} label="Cable" color="text-red-500" href="/utilities/cable" />
              <UtilityItem icon={<Droplets />} label="Power" color="text-yellow-600" href="/utilities/electricity" />
              <UtilityItem icon={<Shirt />} label="Laundry" color="text-indigo-600" href="/services/laundry" />
              <UtilityItem icon={<ShoppingBag />} label="Shop" color="text-orange-500" href="/services/shop" />
              <UtilityItem icon={<Utensils />} label="Food" color="text-red-400" href="/services/food" />
              <UtilityItem icon={<Truck />} label="Logistics" color="text-emerald-600" href="/services/logistics" />
            </div>
          </section>

          {/* 5. Services Carousel */}
          <section>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Explore Services</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {services.map((service, i) => (
                <div key={i} className="min-w-[280px] h-[180px] relative rounded-[24px] overflow-hidden group flex-shrink-0 cursor-pointer">
                  <img src={service.image} alt={service.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
                    <span className="text-2xl mb-1">{service.icon}</span>
                    <h4 className="text-white font-bold text-lg">{service.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 6. Recent Transactions */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
            <Link href="/finance/history"><ChevronRight size={16} className="text-gray-300 hover:text-primary transition-colors" /></Link>
          </div>
          
          <div className="space-y-6">
            {isLoading ? (
              [...Array(3)].map((_, i) => <TransactionSkeleton key={i} />)
            ) : transactions?.length > 0 ? (
              transactions.slice(0, 5).map((tx: any) => (
                <Link 
                  key={tx.id} 
                  href={`/finance/receipt/${tx.id}`} 
                  className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-3 -m-3 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    )}>
                      {tx.type === 'credit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div className="max-w-[120px]">
                      <p className="text-xs font-bold text-gray-800 truncate group-hover:text-primary transition-colors">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[9px] text-gray-400 font-medium uppercase">{tx.category}</p>
                        <span className={cn(
                          "w-1 h-1 rounded-full",
                          tx.status === 'success' ? 'bg-green-400' : 'bg-orange-400'
                        )} />
                        <p className={cn(
                          "text-[9px] font-bold uppercase tracking-tighter",
                          tx.status === 'success' ? 'text-green-500' : 'text-orange-500'
                        )}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-black",
                      tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[8px] text-gray-300 font-bold uppercase tracking-tighter group-hover:text-primary transition-colors">
                      View Receipt
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center py-10 text-xs text-gray-300 font-bold uppercase tracking-widest">No activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function QuickActionItem({ icon, label, bg, href }: { icon: any, label: string, bg: string, href: string }) {
  return (
    <Link href={href} className={`${bg} flex flex-col items-center p-6 rounded-3xl transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md`}>
      <div className="bg-white p-3 rounded-full mb-3 shadow-sm">{icon}</div>
      <span className="text-xs font-black uppercase tracking-tight">{label}</span>
    </Link>
  );
}

function UtilityItem({ icon, label, color, href }: { icon: any, label: string, color: string, href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-3 group">
      <div className={`p-4 rounded-2xl bg-gray-50 ${color} group-hover:bg-primary group-hover:text-white transition-all hover:scale-110 active:scale-95 duration-200 shadow-sm`}>
        {icon}
      </div>
      <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </Link>
  );
}

function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-2 w-16 bg-gray-50 rounded" />
        </div>
      </div>
      <div className="h-3 w-12 bg-gray-100 rounded" />
    </div>
  );
}