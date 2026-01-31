"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { 
  Utensils, 
  Shirt, 
  Truck, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Filter,
  Search
} from "lucide-react";
import Link from "next/link";

const SERVICE_ICONS: any = {
  food: { icon: Utensils, color: "text-orange-500", bg: "bg-orange-50" },
  laundry: { icon: Shirt, color: "text-blue-500", bg: "bg-blue-50" },
  logistics: { icon: Truck, color: "text-purple-500", bg: "bg-purple-50" },
};

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    if (!user) return;

    // In a centralized system, we listen to a single 'orders' collection
    // or aggregate multiple. For now, let's target the unified 'orders' logic.
    const q = query(
      collection(db, "orders"),
      where("buyerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(docs);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === "active") return !["delivered", "rejected", "cancelled"].includes(order.status);
    if (activeTab === "completed") return order.status === "delivered";
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order History</h1>
          <p className="text-slate-500 font-medium text-sm">Track and manage your requests</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {["all", "active", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center opacity-20 animate-pulse">
            <Clock size={48} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))
        ) : (
          <div className="bg-white rounded-[40px] p-20 border border-dashed border-slate-200 text-center">
            <p className="text-slate-400 font-bold">No orders found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: any }) {
  const config = SERVICE_ICONS[order.category] || SERVICE_ICONS.food;
  
  return (
    <Link href={`/orders/${order.id}`}>
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex items-center gap-6 group">
        <div className={`${config.bg} ${config.color} p-4 rounded-2xl`}>
          <config.icon size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {order.category}
            </span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-[10px] font-bold text-slate-400">
              #{order.id.slice(-6).toUpperCase()}
            </span>
          </div>
          <h3 className="font-black text-slate-900 truncate">
            {order.items[0]?.name} {order.items.length > 1 && `+ ${order.items.length - 1} more`}
          </h3>
          <p className="text-xs text-slate-500 font-medium">₦{order.totalPrice.toLocaleString()}</p>
        </div>

        <div className="text-right hidden md:block">
          <StatusBadge status={order.status} />
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">
            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
          </p>
        </div>

        <ChevronRight size={20} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending_approval: "bg-amber-50 text-amber-600 border-amber-100",
    approved: "bg-blue-50 text-blue-600 border-blue-100",
    paid: "bg-green-50 text-green-600 border-green-100",
    delivered: "bg-slate-100 text-slate-600 border-slate-200",
    rejected: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.pending_approval}`}>
      {status.replace('_', ' ')}
    </span>
  );
}