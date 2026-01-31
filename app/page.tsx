"use client";

import Image from "next/image";
import { redirect } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { user, loading } = useAuth();

  // ⏳ Show splash screen while Firebase checks auth state
  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
        <div className="relative">
          {/* Logo */}
          <div className="w-32 h-32 relative animate-pulse">
            <Image
              src="/logo.jpg"
              alt="CallOnDemand Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Loading Indicator */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-primary" size={24} />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Initializing
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🔐 Auth resolved → redirect deterministically
  if (user) {
    redirect("/dashboard");
  }

  // 🔓 No user → login
  redirect("/login");
}
