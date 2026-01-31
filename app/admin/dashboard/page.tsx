"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";
import { 
  Users, 
  ShieldAlert, 
  Activity, 
  DollarSign, 
  Power, 
  Search,
  Database,
  ArrowUpRight
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, revenue: 0, activeOrders: 0 });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for System Settings (Maintenance Mode)
    const unsubSettings = onSnapshot(doc(db, "system", "settings"), (snap) => {
      if (snap.exists()) setMaintenanceMode(snap.data().maintenanceMode);
    });

    // Simple aggregation for high-level stats
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const docs = snap.docs.map(d => d.data());
      const totalRev = docs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      setStats({
        totalUsers: 0, // Would query 'users' collection
        revenue: totalRev,
        activeOrders: docs.filter(o => o.status !== 'Delivered').length
      });
      setLoading(false);
    });

    return () => { unsubSettings(); unsubOrders(); };
  }, []);

  const toggleMaintenance = async () => {
    const confirmMsg = maintenanceMode ? "Disable Maintenance Mode?" : "ACTIVATE MAINTENANCE MODE? This will restrict user access.";
    if (confirm(confirmMsg)) {
      await updateDoc(doc(db, "system", "settings"), { maintenanceMode: !maintenanceMode });
      toast.success("System Status Updated");
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-10 space-y-10 bg-[#FAFAFB] min-h-screen">
      {/* --- TOP ROW: GLOBAL CONTROLS --- */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 font-medium">Platform-wide oversight & financial integrity</p>
        </div>
        
        <button 
          onClick={toggleMaintenance}
          className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-sm transition-all shadow-2xl ${
            maintenanceMode 
            ? "bg-red-500 text-white shadow-red-200" 
            : "bg-white text-slate-900 border border-slate-100"
          }`}
        >
          <Power size={18} />
          {maintenanceMode ? "SYSTEM RESTRICTED" : "SYSTEM ONLINE"}
        </button>
      </header>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AdminStat icon={<DollarSign />} label="Gross Revenue" value={`₦${(stats.revenue / 1000).toFixed(1)}k`} color="text-primary" />
        <AdminStat icon={<Activity />} label="Active Orders" value={stats.activeOrders} color="text-blue-600" />
        <AdminStat icon={<Users />} label="Total Nodes" value="12" color="text-orange-500" />
        <AdminStat icon={<ShieldAlert />} label="System Health" value="99.9%" color="text-green-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* --- REVENUE TREND (Large) --- */}
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-slate-50 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black uppercase tracking-widest text-xs text-slate-400">Platform Earning Trend</h3>
            <span className="text-[10px] font-black bg-green-50 text-green-600 px-3 py-1 rounded-full">+14.2% Growth</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6200EE" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6200EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="rev" stroke="#6200EE" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- QUICK ACTIONS --- */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white">
            <h3 className="font-black text-lg mb-6">Database Tools</h3>
            <div className="space-y-3">
              <ToolButton icon={<Database size={16} />} label="Wallet Integrity Audit" />
              <ToolButton icon={<Users size={16} />} label="Migrate Node Data" />
              <ToolButton icon={<ArrowUpRight size={16} />} label="Export Financial Report" />
            </div>
          </div>

          <div className="bg-white rounded-[40px] p-8 border border-slate-50 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4">Seller Oversight</h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <span className="text-sm font-bold text-slate-600">Pending Approvals</span>
              <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPERS ---

function AdminStat({ icon, label, value, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-slate-50 ${color}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <h2 className="text-3xl font-black text-slate-900">{value}</h2>
    </div>
  );
}

function ToolButton({ icon, label }: any) {
  return (
    <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
      <div className="flex items-center gap-3">
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-bold">{label}</span>
      </div>
    </button>
  );
}

const MOCK_CHART_DATA = [
  { name: 'W1', rev: 4000 }, { name: 'W2', rev: 3000 }, { name: 'W3', rev: 5000 },
  { name: 'W4', rev: 4800 }, { name: 'W5', rev: 6000 }, { name: 'W6', rev: 7500 },
];