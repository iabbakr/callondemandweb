"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Search, 
  Package, 
  User, 
  MapPin, 
  Smartphone 
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function OperatorDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // 1. Real-time Listener for all orders
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  // 2. Update Order Status Logic
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        // You can add 'operatorName: user.fullName' here if needed
      });
      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-20 text-center animate-pulse font-bold">Loading Orders...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Order Management</h1>
          <p className="text-slate-500 font-medium">Manage and fulfill customer requests</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Invoice or Name..." 
              className="pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-primary/20 w-64 shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border border-slate-100 p-3 rounded-2xl font-bold text-sm outline-none shadow-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="out-for-delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </header>

      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className={cn(
            "bg-white rounded-[32px] border p-8 shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8",
            order.status === "delivered" ? "opacity-60 border-slate-100" : "border-slate-200"
          )}>
            
            {/* Customer Info */}
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-500">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">{order.userName}</h3>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">{order.invoiceId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <MapPin size={16} />
                  <span className="font-medium">{order.method === 'pickup' ? 'Store Pickup' : order.area}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Package size={16} />
                  <span className="font-medium">{order.meal}</span>
                </div>
              </div>
            </div>

            {/* Extras Section */}
            <div className="flex-1 bg-slate-50 p-4 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Order Extras</p>
              <div className="flex flex-wrap gap-2">
                {order.extras?.length > 0 ? order.extras.map((ex: any, i: number) => (
                  <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                    + {ex.name}
                  </span>
                )) : <span className="text-xs text-slate-400 italic">No extras</span>}
              </div>
            </div>

            {/* Total & Action */}
            <div className="flex flex-col items-end gap-4">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Paid</p>
                <p className="text-2xl font-black text-slate-900">₦{order.total?.toLocaleString()}</p>
              </div>

              <div className="flex gap-2">
                {order.status !== "delivered" ? (
                  <>
                    <StatusButton 
                      icon={<Clock size={16} />} 
                      label="Process" 
                      color="bg-blue-50 text-blue-600" 
                      onClick={() => updateStatus(order.id, "processing")} 
                    />
                    <StatusButton 
                      icon={<Truck size={16} />} 
                      label={order.method === 'pickup' ? "Ready" : "Dispatch"} 
                      color="bg-orange-50 text-orange-600" 
                      onClick={() => updateStatus(order.id, order.method === 'pickup' ? "ready-for-pickup" : "out-for-delivery")} 
                    />
                    <StatusButton 
                      icon={<CheckCircle size={16} />} 
                      label="Deliver" 
                      color="bg-green-600 text-white" 
                      onClick={() => updateStatus(order.id, "delivered")} 
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 font-black uppercase text-xs">
                    <CheckCircle size={18} /> Order Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
             <Package className="mx-auto text-slate-300 mb-4" size={48} />
             <p className="font-black text-slate-400 uppercase tracking-widest">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Button Component
function StatusButton({ icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`${color} px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-transform active:scale-90 hover:opacity-80`}
    >
      {icon} {label}
    </button>
  );
}