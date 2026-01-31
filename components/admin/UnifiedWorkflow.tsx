"use client";

import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

// Import the types to resolve ts(2304)
import { UnifiedOrder, OrderStatus } from "@/types/order";

export default function UnifiedWorkflow({ order, role }: { order: UnifiedOrder, role: string }) {
  
  const handleStatusChange = async (nextStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      // Replaces underscores with spaces for the toast notification
      toast.success(`Order ${nextStatus.replace(/_/g, ' ')}`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
      <h4 className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-4">
        Management Actions
      </h4>
      
      <div className="flex flex-wrap gap-3">
        {/* AGENT ACTIONS */}
        {role === 'agent' && order.status === 'pending_approval' && (
          <>
            <button 
              onClick={() => handleStatusChange('approved')} 
              className="bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-sm"
            >
              Approve Order
            </button>
            <button 
              onClick={() => handleStatusChange('rejected')} 
              className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-sm"
            >
              Reject
            </button>
          </>
        )}

        {/* OPERATOR ACTIONS */}
        {role === 'operator' && order.status === 'paid' && (
          <button 
            onClick={() => handleStatusChange('processing')} 
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm"
          >
            Start Preparing
          </button>
        )}
        
        {role === 'operator' && order.status === 'processing' && (
          <button 
            onClick={() => handleStatusChange('out_for_delivery')} 
            className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-sm"
          >
            Send to Delivery
          </button>
        )}

        {role === 'operator' && order.status === 'out_for_delivery' && (
          <button 
            onClick={() => handleStatusChange('delivered')} 
            className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-sm"
          >
            Confirm Delivered
          </button>
        )}
      </div>
    </div>
  );
}