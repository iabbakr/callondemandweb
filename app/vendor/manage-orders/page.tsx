"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck, 
  ExternalLink,
  Star,
  TrendingUp,
  DollarSign,
  BarChart3
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import toast from "react-hot-toast";

const FLOW = ["Ordered", "Processing", "In Transit", "Delivered"];

// Mock data for the Revenue Chart - In a real app, you'd calculate this from 'order.amount'
const REVENUE_DATA = [
  { day: 'Mon', amount: 12500 },
  { day: 'Tue', amount: 18000 },
  { day: 'Wed', amount: 15000 },
  { day: 'Thu', amount: 22000 },
  { day: 'Fri', amount: 31000 },
  { day: 'Sat', amount: 28000 },
  { day: 'Sun', amount: 14000 },
];

export default function VendorOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "orders"), 
      where("status", "!=", "Delivered")
    );

    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (orderId: string, currentStatus: string) => {
    const currentIndex = FLOW.indexOf(currentStatus);
    if (currentIndex === FLOW.length - 1) return;

    const nextStatus = FLOW[currentIndex + 1];
    
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`Order moved to ${nextStatus}`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10 pb-20">
      {/* --- HEADER & ANALYTICS CARDS --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendor Workspace</h1>
          <p className="text-slate-500 font-medium">Real-time order fulfillment & analytics</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <StatBox label="Active" value={orders.length} color="text-primary" icon={<Clock size={14} />} />
          <StatBox label="Today's Rev" value="₦42.5k" color="text-green-600" icon={<TrendingUp size={14} />} />
          <StatBox label="Rating" value="4.8" icon={<Star size={14} fill="currentColor" />} color="text-yellow-500" />
        </div>
      </header>

      {/* --- REVENUE CHART SECTION --- */}
      <section className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <BarChart3 size={20} />
          </div>
          <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs">Weekly Revenue Trend</h2>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={32}>
                {REVENUE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 4 ? '#6200EE' : '#E8DEF8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- ORDER LIST --- */}
      <section className="space-y-6">
        <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs ml-2">Current Queue</h2>
        <div className="grid gap-4">
          {loading ? (
            <div className="p-20 text-center animate-pulse opacity-20 font-black">SYNCING...</div>
          ) : orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{order.id.slice(-6).toUpperCase()}</span>
                  <StatusBadge status={order.status} />
                </div>
                <h3 className="text-lg font-black text-slate-900">{order.items[0]?.name} {order.items.length > 1 && `+${order.items.length - 1} more`}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight italic">{order.deliveryAddress}</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateStatus(order.id, order.status)}
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                  <Package size={18} />
                  Move to {FLOW[FLOW.indexOf(order.status) + 1]}
                </button>
                <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-primary transition-colors">
                  <ExternalLink size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// --- HELPERS ---

function StatBox({ label, value, icon, color }: any) {
  return (
    <div className="bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm flex-1 md:flex-none">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
      <div className={`text-xl font-black flex items-center gap-2 ${color}`}>
        {value} <span className="opacity-50">{icon}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    "Ordered": "bg-blue-50 text-blue-600",
    "Processing": "bg-amber-50 text-amber-600",
    "In Transit": "bg-purple-50 text-purple-600",
    "Delivered": "bg-green-50 text-green-600",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[status]}`}>
      {status}
    </span>
  );
}