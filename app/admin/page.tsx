"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { 
  Users, 
  CreditCard, 
  Activity, 
  ShoppingBag, 
  AlertCircle, 
  DollarSign, 
  Clock, 
  CheckCircle,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Live Listener for User Stats (Liquidity)
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      let balance = 0;
      snap.forEach(doc => balance += (doc.data().balance || 0));
      setStats(prev => ({ 
        ...prev, 
        totalUsers: snap.size, 
        totalBalance: balance 
      }));
    });

    // 2. Live Listener for Orders & Revenue Snapshot
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const today = new Date().toDateString();
      
      const orderMetrics = snap.docs.reduce((acc, docSnap) => {
        const data = docSnap.data();
        
        // Categorize Status
        if (data.status === 'pending') acc.pending++;
        if (data.status === 'processing' || data.status === 'out-for-delivery') acc.processing++;
        if (data.status === 'delivered') acc.completed++;

        // Calculate Revenue (Only for orders created today)
        const orderDate = data.createdAt?.toDate?.()?.toDateString();
        if (orderDate === today) {
          acc.revenue += (data.total || 0);
        }

        return acc;
      }, { pending: 0, processing: 0, completed: 0, revenue: 0 });

      setStats(prev => ({
        ...prev,
        pendingOrders: orderMetrics.pending,
        processingOrders: orderMetrics.processing,
        completedOrders: orderMetrics.completed,
        todayRevenue: orderMetrics.revenue
      }));
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubOrders();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 font-medium">Real-time oversight of the CallOnDemand ecosystem</p>
        </div>
        <div className="bg-green-50 text-green-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live System Status
        </div>
      </header>

      {/* --- SNAPSHOT METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard 
          label="Platform Liquidity" 
          value={`₦${stats.totalBalance.toLocaleString()}`} 
          icon={<CreditCard />} 
          color="text-blue-600" 
          subtext={`${stats.totalUsers} total users`}
        />
        <AdminStatCard 
          label="Today's Revenue" 
          value={`₦${stats.todayRevenue.toLocaleString()}`} 
          icon={<DollarSign />} 
          color="text-emerald-600" 
          subtext="Updated just now"
          isTrend={true}
        />
        <Link href="/admin/orders?filter=pending" className="block transition-transform hover:scale-[1.02]">
          <AdminStatCard 
            label="Pending Orders" 
            value={stats.pendingOrders} 
            icon={<Clock />} 
            color="text-orange-600" 
            subtext={`${stats.processingOrders} currently in fulfillment`}
            isUrgent={stats.pendingOrders > 0}
          />
        </Link>
        <AdminStatCard 
          label="Successful Today" 
          value={stats.completedOrders} 
          icon={<CheckCircle />} 
          color="text-purple-600" 
          subtext="Total delivered orders"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* --- RECENT ACTIVITY & ACTION ITEMS --- */}
        <section className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h2 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest">
              <AlertCircle size={18} className="text-red-500" /> Critical Action Required
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
             {/* Note: These could be mapped from a 'notifications' or 'requests' collection later */}
             <AdminActionItem title="Withdrawal Request" user="Abubakar I." amount="₦50,000" time="2 mins ago" type="finance" />
             <AdminActionItem title="New Vendor Application" user="Bubu Supermarket" amount="N/A" time="15 mins ago" type="onboarding" />
             <AdminActionItem title="Unresolved Dispute" user="John D. vs Rider" amount="Order #442" time="1 hour ago" type="dispute" />
          </div>
          <Link href="/admin/audit" className="block p-4 text-center text-xs font-bold text-slate-400 hover:text-primary transition-colors border-t border-slate-50">
            View All Audit Logs
          </Link>
        </section>

        {/* --- SYSTEM HEALTH SNAPSHOT --- */}
        <aside className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-black text-lg mb-6">System Health</h3>
            <div className="space-y-6">
              <HealthItem label="Firestore Latency" value="44ms" status="good" />
              <HealthItem label="Auth Node" value="Online" status="good" />
              <HealthItem label="Push Notifications" value="Active" status="good" />
              <HealthItem label="Payment Gateway" value="Stable" status="good" />
            </div>

            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Server Uptime</p>
              <div className="flex gap-1 h-8 items-end">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="flex-1 bg-primary/40 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }} />
                ))}
              </div>
            </div>
          </div>
          <Activity className="absolute -right-10 -bottom-10 text-white/5" size={200} />
        </aside>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function AdminStatCard({ label, value, icon, color, subtext, isUrgent, isTrend }: any) {
  return (
    <div className={cn(
      "bg-white p-8 rounded-[36px] border shadow-sm transition-all",
      isUrgent ? "border-orange-200 ring-4 ring-orange-50" : "border-slate-100"
    )}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-black text-slate-900 mt-1">{value}</h2>
        {isTrend && <ArrowUpRight size={16} className="text-emerald-500" />}
      </div>
      <p className="text-[10px] font-bold text-slate-400 mt-2">{subtext}</p>
    </div>
  );
}

function AdminActionItem({ title, user, amount, time, type }: any) {
  return (
    <div className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-2 h-2 rounded-full animate-pulse",
          type === 'finance' ? "bg-red-500" : "bg-blue-500"
        )} />
        <div>
          <h4 className="font-black text-slate-900 text-sm">{title}</h4>
          <p className="text-xs text-slate-500 font-medium">{user} • <span className="text-primary font-bold">{amount}</span></p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-[10px] font-black text-slate-300 uppercase">{time}</span>
        <button className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-primary transition-all active:scale-95 shadow-lg shadow-slate-200">
          Review
        </button>
      </div>
    </div>
  );
}

function HealthItem({ label, value, status }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-white">{value}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
      </div>
    </div>
  );
}

// Utility to handle conditional classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}