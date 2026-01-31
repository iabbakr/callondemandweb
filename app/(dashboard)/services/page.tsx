"use client";

import React from "react";
import Link from "next/link";
import { 
  Utensils, Shirt, Truck, ShoppingBag, 
  ChevronRight, Sparkles 
} from "lucide-react";

// You can also pull this list from config/services.ts if preferred
const SERVICES = [
  { id: 'food', name: 'Mobile Restaurant', desc: 'Order local & continental dishes', icon: Utensils, color: 'bg-orange-500', href: '/services/food' },
  { id: 'laundry', name: 'Laundry & Dry Cleaning', desc: 'Clean clothes, picked up & delivered', icon: Shirt, color: 'bg-blue-500', href: '/services/laundry' },
  { id: 'logistics', name: 'Instant Delivery', desc: 'Send packages across the city', icon: Truck, color: 'bg-purple-500', href: '/services/logistics' },
  { id: 'shop', name: 'Shop With Us', desc: 'Grocery and essentials', icon: ShoppingBag, color: 'bg-green-500', href: '/services/shop' },
];

export default function ServiceHub() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2 uppercase tracking-[0.2em]">
            <Sparkles size={16} /> Premium Services
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">What do you need?</h1>
          <p className="text-slate-500 mt-3 font-medium text-lg">Select a service to get started with CallOnDemand.</p>
        </div>
        <Link 
          href="/dashboard" 
          className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
        >
          Back to Dashboard <ChevronRight size={14} />
        </Link>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {SERVICES.map((svc) => (
          <Link key={svc.id} href={svc.href} className="group">
            <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 h-full flex flex-col relative overflow-hidden">
              <svc.icon className="absolute -right-4 -bottom-4 opacity-[0.03] text-slate-900 group-hover:scale-110 transition-transform duration-700" size={140} />
              
              <div className={`${svc.color} w-16 h-16 rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}>
                <svc.icon size={32} />
              </div>
              
              <h3 className="font-black text-2xl text-slate-900 mb-3">{svc.name}</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed flex-1">{svc.desc}</p>
              
              <div className="mt-10 flex items-center gap-2 text-primary font-bold text-sm">
                Explore Now <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}