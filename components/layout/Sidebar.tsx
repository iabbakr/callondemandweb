"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, 
  Wallet, 
  History, 
  User, 
  Settings, 
  LogOut,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils"; // Utility for tailwind classes

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Finance", href: "/finance", icon: Wallet },
  { name: "Transactions", href: "/transactions", icon: History },
  { name: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logOut } = useAuth();
  const { balance } = useApp();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0">
      {/* BRAND LOGO */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/30">
            C
          </div>
          <span className="font-black text-xl tracking-tighter">CallOnDemand</span>
        </div>
      </div>

      {/* BALANCE PREVIEW */}
      <div className="mx-6 p-4 bg-accent/30 rounded-2xl border border-accent/50 mb-8">
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Your Balance</p>
        <p className="text-xl font-black text-gray-900">₦{balance.toLocaleString()}</p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group",
                isActive 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              )}
            >
              <item.icon size={18} className={cn(isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM ACTIONS */}
      <div className="p-6 border-t border-gray-50 space-y-2">
        <button 
          onClick={logOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}