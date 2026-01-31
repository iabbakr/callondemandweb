"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Wallet, 
  Diamond, 
  User, 
  HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Rewards", href: "/rewards", icon: Diamond },
  { label: "Support", href: "/support", icon: HelpCircle },
  { label: "Profile", href: "/profile", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 pb-6 pt-3 flex justify-between items-center z-50">
      {NAV_ITEMS.map((item) => {
        // Handle active state for sub-routes
        const isActive = item.href === "/dashboard" 
          ? pathname === "/dashboard" 
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-primary" : "text-gray-300"
            )}
          >
            <div className={cn(
              "p-2 rounded-2xl transition-all",
              isActive ? "bg-primary/10" : ""
            )}>
              <item.icon 
                size={22} 
                strokeWidth={isActive ? 3 : 2} 
                className={cn(isActive && "animate-in zoom-in duration-300")}
              />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-tighter",
              isActive ? "opacity-100" : "opacity-0"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}