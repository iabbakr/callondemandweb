"use client";

import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userProfile } = useApp();
  const router = useRouter();

  useEffect(() => {
    // 🛡️ Security Guard: Boot non-admins back to the home page
    if (userProfile && userProfile.role !== "admin") {
      router.replace("/");
    }
  }, [userProfile, router]);

  if (!userProfile || userProfile.role !== "admin") return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}