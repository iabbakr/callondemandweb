"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  increment,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Banknote, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Search,
  ArrowUpRight
} from "lucide-react";
import toast from "react-hot-toast";

export default function WithdrawalManagement() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    const q = query(collection(db, "withdrawals"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (request: any, newStatus: "success" | "failed") => {
    try {
      const requestRef = doc(db, "withdrawals", request.id);
      const userRef = doc(db, "users", request.userId);

      if (newStatus === "failed") {
        // Refund the user's balance if the withdrawal fails
        await updateDoc(userRef, { balance: increment(request.amount) });
        toast.error("Withdrawal rejected and refunded.");
      } else {
        toast.success("Withdrawal marked as successful!");
      }

      await updateDoc(requestRef, { 
        status: newStatus,
        processedAt: serverTimestamp() 
      });
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filteredRequests = requests.filter(r => filter === "all" ? true : r.status === filter);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Withdrawal Requests</h1>
          <p className="text-slate-500 text-sm font-medium">Review and process user cash-out requests</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl">
          {["pending", "success", "failed", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                filter === f ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <th className="px-8 py-5">User & Bank Details</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Date Requested</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        {req.userFullName} <ArrowUpRight size={12} className="text-slate-300" />
                      </span>
                      <span className="text-[11px] font-black text-primary uppercase tracking-tighter mt-1">
                        {req.bankName} • {req.accountNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium italic">{req.accountName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-lg font-black text-slate-900">₦{req.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500">
                    {req.createdAt?.toDate().toLocaleString() || "N/A"}
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    {req.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => updateStatus(req, "failed")}
                          className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <XCircle size={18} />
                        </button>
                        <button 
                          onClick={() => updateStatus(req, "success")}
                          className="p-3 bg-green-50 text-green-500 rounded-xl hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRequests.length === 0 && !loading && (
            <div className="py-20 text-center flex flex-col items-center opacity-20">
              <Banknote size={48} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">No {filter} requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    success: "bg-green-50 text-green-600 border-green-100",
    failed: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
}