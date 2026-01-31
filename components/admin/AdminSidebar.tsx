"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Banknote, 
  Megaphone,
  LogOut,
  ShieldCheck,
  Search,
  History,
  ClipboardList,
  MessageSquare,
  Archive
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ADMIN NAVIGATION CONFIGURATION
 */
const ADMIN_NAV = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, category: "Management" },
  { name: "Orders Feed", href: "/admin/orders", icon: ClipboardList, category: "Management" },
  { name: "User Directory", href: "/admin/users", icon: Users, category: "Management" },
  { name: "Global Search", href: "/admin/user-search", icon: Search, category: "Management" },
  
  { name: "Support Inbox", href: "/support/admin", icon: MessageSquare, category: "Support" },
  { name: "Resolved Tickets", href: "/support/admin/archives", icon: Archive, category: "Support" },

  { name: "Service Catalog", href: "/admin/services", icon: ShoppingBag, category: "Systems" },
  { name: "Withdrawals", href: "/admin/withdrawals", icon: Banknote, category: "Systems" },
  { name: "System Broadcast", href: "/admin/broadcast", icon: Megaphone, category: "Systems" },
  { name: "Security Audit", href: "/admin/audit", icon: History, category: "Systems" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logOut } = useAuth();

  // Grouping logic for clean UI
  const categories = ["Management", "Support", "Systems"];

  return (
    <aside className="w-64 h-screen bg-slate-900 flex flex-col sticky top-0 border-r border-slate-800 shadow-2xl">
      
      {/* BRANDING SECTION */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 ring-2 ring-slate-800 rounded-lg overflow-hidden p-1 bg-white">
            <Image 
              src="/logo.jpg" 
              alt="CallOnDemand Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-white text-sm tracking-tight">Admin Portal</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={10} className="animate-pulse" /> Authorized
            </span>
          </div>
        </div>
      </div>

      {/* ADMIN NAVIGATION SCROLL AREA */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto no-scrollbar">
        {categories.map((cat) => (
          <div key={cat} className="space-y-1">
            <div className="px-4 mb-2">
              <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em]">
                {cat}
              </p>
            </div>
            
            {ADMIN_NAV.filter(item => item.category === cat).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <item.icon 
                    size={18} 
                    className={cn(
                      "transition-colors",
                      isActive ? "text-white" : "text-slate-500 group-hover:text-primary"
                    )} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="p-6 border-t border-slate-800 bg-slate-900/50">
        <button 
          onClick={logOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all active:scale-95"
        >
          <LogOut size={18} />
          Exit Admin
        </button>
        
        <p className="mt-4 text-[9px] text-center text-slate-600 font-bold uppercase tracking-widest">
          COD Systems v2.0
        </p>
      </div>
    </aside>
  );
}