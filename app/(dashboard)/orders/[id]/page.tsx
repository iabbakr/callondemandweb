"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone,
  MessageSquare
} from "lucide-react";
import Image from "next/image";

const STATUS_STEPS = [
  { label: "Ordered", desc: "We've received your request", icon: <Clock size={18} /> },
  { label: "Processing", desc: "The vendor is preparing your order", icon: <Package size={18} /> },
  { label: "In Transit", desc: "Your items are on the way", icon: <Truck size={18} /> },
  { label: "Delivered", desc: "Order completed successfully", icon: <CheckCircle2 size={18} /> },
];

export default function OrderStatus() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "orders", id as string), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase text-xs tracking-widest opacity-20">Syncing Status...</div>;
  if (!order) return <div className="p-20 text-center font-bold">Order not found.</div>;

  // Find the index of the current status to light up the progress bar
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.label.toLowerCase() === order.status.toLowerCase());

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 mb-8 hover:text-primary transition-colors">
        <ArrowLeft size={18} /> Back to History
      </button>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* --- LEFT: TRACKING STEPS --- */}
        <div className="lg:col-span-3 space-y-8">
          <header>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              Order #{order.id.slice(-6).toUpperCase()}
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-4 capitalize">
              {order.category} Status
            </h1>
          </header>

          <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.label} className="relative flex gap-6 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-4 border-white ${
                    isCompleted ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-gray-100 text-gray-400"
                  }`}>
                    {isCompleted ? <CheckCircle2 size={18} /> : step.icon}
                  </div>
                  <div>
                    <h3 className={`font-black text-sm uppercase tracking-tight ${isCompleted ? "text-gray-900" : "text-gray-300"}`}>
                      {step.label}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-1">{step.desc}</p>
                  </div>
                  {isCurrent && (
                    <div className="absolute -left-2 top-0 w-14 h-10 bg-primary/10 rounded-full blur-xl animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT: ORDER DETAILS --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.qty}x {item.name}</span>
                  <span className="font-bold text-gray-900">₦{item.price.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-gray-400">Total Paid</span>
                <span className="text-xl font-black text-primary">₦{order.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-[32px] text-white">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> Delivery Details
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              {order.deliveryAddress || "Standard Campus Pickup"}
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white/10 hover:bg-white/20 p-3 rounded-2xl flex items-center justify-center transition-colors">
                <Phone size={18} />
              </button>
              <button className="flex-1 bg-primary p-3 rounded-2xl flex items-center justify-center transition-colors shadow-lg shadow-primary/20">
                <MessageSquare size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}