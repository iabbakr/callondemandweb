"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { 
  Home, 
  Diamond, 
  Wallet, 
  User, 
  Bell, 
  Headset,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ Navigation items matching your folder structure
const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Reward", href: "/reward", icon: Diamond },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Profile", href: "/profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logOut } = useAuth();
  const { userProfile } = useApp();
  
  const firstName = userProfile?.fullName?.split(' ')[0] || 'User';

  /**
   * ✅ Handle Logout and Redirect
   */
  const handleLogout = async () => {
    try {
      await logOut();
      // Using window.location.href for a clean state reset on logout
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /**
   * ✅ Logic to keep parent tabs active when on sub-pages
   */
  const checkActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200 fixed h-full shadow-sm">
        <div className="p-8">
          <h1 className="text-[#6200EE] font-black text-xl tracking-tighter">CallOnDemand</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = checkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all",
                  isActive 
                    ? "bg-[#6200EE] text-white shadow-lg shadow-primary/20" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                )}
              >
                <item.icon size={18} strokeWidth={isActive ? 3 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100">
           <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-gray-400 font-bold text-sm hover:text-red-500 transition-colors"
           >
              <LogOut size={18} /> Logout
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">CallonDemand</span>
            <span className="text-sm font-black text-gray-900">
              Hello, {firstName} 👋
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/support"
              className={cn(
                "p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-[#6200EE] transition-all relative",
                pathname === "/support" && "bg-primary/10 text-[#6200EE]"
              )}
            >
              <Headset size={20} />
            </Link>
            
            <button className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-[#6200EE] transition-all relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 pb-32 md:pb-8 overflow-x-hidden">
          {children}
        </div>

        {/* --- MOBILE BOTTOM NAV --- */}
        <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-lg border border-gray-100 h-20 px-8 flex items-center justify-between z-50 rounded-[2.5rem] shadow-2xl shadow-black/5">
          {NAV_ITEMS.map((item) => {
            const isActive = checkActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  isActive ? "text-[#6200EE] scale-110" : "text-gray-300"
                )}
              >
                <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
                {isActive && <div className="w-1.5 h-1.5 bg-[#6200EE] rounded-full animate-in zoom-in" />}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}