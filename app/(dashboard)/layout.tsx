"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Diamond, 
  Wallet, 
  User, 
  Bell, 
  Headset 
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Rewards", href: "/reward", icon: Diamond },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Profile", href: "/profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <h1 className="text-[#6200EE] font-bold text-xl tracking-tight">CallOnDemand</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? "bg-[#E8DEF8] text-[#6200EE]" 
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <button className="flex w-full items-center gap-3 px-4 py-3 text-gray-500 hover:text-red-500 transition-colors">
              <User size={20} /> Logout
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 md:ml-64 flex flex-col">
        {/* Top Header (Greeting & Notification Icons) */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Welcome back</span>
            <span className="text-sm font-bold text-gray-800">User 👋</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-gray-50 text-[#6200EE] hover:bg-[#E8DEF8] transition-colors relative">
              <Headset size={20} />
            </button>
            <button className="p-2 rounded-full bg-gray-50 text-[#6200EE] hover:bg-[#E8DEF8] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* --- MOBILE BOTTOM NAV --- */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-20 px-6 flex items-center justify-between z-50">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? "text-[#6200EE]" : "text-gray-400"
                }`}
              >
                <div className={`p-1.5 rounded-full ${isActive ? 'bg-[#E8DEF8]' : ''}`}>
                   <item.icon size={22} />
                </div>
                <span className="text-[10px] font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}