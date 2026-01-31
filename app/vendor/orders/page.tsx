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
  BarChart3,
  X,
  ShoppingBag,
  MapPin,
  ReceiptText
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
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

const FLOW = ["Ordered", "Processing", "In Transit", "Delivered"];

export default function VendorOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [revenueData, setRevenueData] = useState([
    { day: 'Mon', amount: 0 }, { day: 'Tue', amount: 0 }, { day: 'Wed', amount: 0 },
    { day: 'Thu', amount: 0 }, { day: 'Fri', amount: 0 }, { day: 'Sat', amount: 0 },
    { day: 'Sun', amount: 0 }
  ]);

  // 1. Real-time Order Listener
  useEffect(() => {
    // In production, add: where("vendorId", "==", user.uid)
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

  // 2. Real-time Revenue Aggregator
  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const q = query(
      collection(db, "orders"),
      where("status", "==", "Delivered"),
      where("updatedAt", ">=", sevenDaysAgo)
    );

    const unsub = onSnapshot(q, (snap) => {
      const dailyTotals: { [key: string]: number } = {
        'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0
      };

      snap.docs.forEach(doc => {
        const data = doc.data();
        const date = data.updatedAt?.toDate();
        if (date) {
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          dailyTotals[dayName] += (data.amount || 0);
        }
      });

      const updatedChart = [
        { day: 'Mon', amount: dailyTotals['Mon'] },
        { day: 'Tue', amount: dailyTotals['Tue'] },
        { day: 'Wed', amount: dailyTotals['Wed'] },
        { day: 'Thu', amount: dailyTotals['Thu'] },
        { day: 'Fri', amount: dailyTotals['Fri'] },
        { day: 'Sat', amount: dailyTotals['Sat'] },
        { day: 'Sun', amount: dailyTotals['Sun'] },
      ];
      setRevenueData(updatedChart);
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
      toast.success(`Moved to ${nextStatus}`);
    } catch (e) {
      toast.error("Status update failed");
    }
  };

  const totalWeeklyRevenue = revenueData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10 pb-20">
      {/* --- HEADER & ANALYTICS --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vendor Workspace</h1>
          <p className="text-slate-500 font-medium">Real-time order fulfillment & analytics</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <StatBox label="Active" value={orders.length} color="text-primary" icon={<Clock size={14} />} />
          <StatBox label="Weekly Rev" value={`₦${(totalWeeklyRevenue / 1000).toFixed(1)}k`} color="text-green-600" icon={<TrendingUp size={14} />} />
          <StatBox label="Rating" value="4.8" icon={<Star size={14} fill="currentColor" />} color="text-yellow-500" />
        </div>
      </header>

      {/* --- REVENUE CHART --- */}
      <section className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <BarChart3 size={20} />
          </div>
          <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs">Weekly Revenue Trend</h2>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
              <YAxis hide />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={32}>
                {revenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#6200EE' : '#E8DEF8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- ORDER QUEUE --- */}
      <section className="space-y-6">
        <h2 className="font-black text-slate-900 uppercase tracking-widest text-xs ml-2">Current Queue</h2>
        <div className="grid gap-4">
          {loading ? (
            <div className="p-20 text-center animate-pulse opacity-20 font-black">SYNCING...</div>
          ) : orders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md hover:border-primary/20 cursor-pointer transition-all flex flex-col md:flex-row md:items-center gap-8"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{order.id.slice(-6).toUpperCase()}</span>
                  <StatusBadge status={order.status} />
                </div>
                <h3 className="text-lg font-black text-slate-900">{order.items[0]?.name} {order.items.length > 1 && `+${order.items.length - 1} more`}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight italic line-clamp-1">{order.deliveryAddress}</p>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); updateStatus(order.id, order.status); }}
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                  <Package size={18} />
                  Move to {FLOW[FLOW.indexOf(order.status) + 1]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- ORDER DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative">
              <div className="bg-slate-50 p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary text-white rounded-2xl"><ReceiptText size={24} /></div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Order Details</h2>
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">ID: {selectedOrder.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Purchase Items</h4>
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-primary text-xs">{item.qty || 1}x</span>
                        <span className="font-bold text-slate-900">{item.name}</span>
                      </div>
                      <span className="font-black text-slate-900 text-sm">₦{(item.price * (item.qty || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer & Logistics</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-2xl">
                        <MapPin size={16} className="text-blue-500 mb-2" />
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Address</p>
                        <p className="text-xs font-bold text-blue-900 mt-1">{selectedOrder.deliveryAddress}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-2xl">
                        <ShoppingBag size={16} className="text-purple-500 mb-2" />
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Category</p>
                        <p className="text-xs font-bold text-purple-900 mt-1 capitalize">{selectedOrder.category}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">₦{selectedOrder.amount?.toLocaleString()}</p>
                </div>
                <button onClick={() => { updateStatus(selectedOrder.id, selectedOrder.status); setSelectedOrder(null); }} className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">Proceed</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[status] || "bg-slate-50 text-slate-600"}`}>
      {status}
    </span>
  );
}