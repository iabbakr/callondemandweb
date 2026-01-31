"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { 
  MessageSquare, Phone, Mail, MessageCircle, 
  ChevronRight, Clock, CheckCircle2, AlertTriangle, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const { userProfile } = useApp();
  const isAdmin = userProfile?.role === "admin" || userProfile?.role === "operator";

  const supportOptions = [
    {
      id: "chat",
      icon: MessageSquare,
      title: isAdmin ? "Support Inbox" : "In-App Chat",
      subtitle: isAdmin ? "Manage active customer tickets" : "Chat with our support experts",
      href: isAdmin ? "/support/admin" : "/support/chat",
      color: "text-primary bg-primary/10",
    },
    {
      id: "call",
      icon: Phone,
      title: "Call Us",
      subtitle: "+234 806 972 8683",
      href: "tel:+2348069728683",
      color: "text-green-600 bg-green-50",
    },
    {
      id: "whatsapp",
      icon: MessageCircle,
      title: "WhatsApp",
      subtitle: "Get instant responses",
      href: "https://wa.me/2348069728683",
      color: "text-emerald-500 bg-emerald-50",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-10">
      {/* Header */}
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <HelpCircle size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">How can we help?</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Our support team is available 24/7 to ensure your experience is seamless.
        </p>
      </header>

      {/* Contact Grid */}
      <div className="grid gap-4">
        {supportOptions.map((opt) => (
          <Link 
            key={opt.id} 
            href={opt.href}
            className="flex items-center justify-between p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group"
          >
            <div className="flex items-center gap-6">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6", opt.color)}>
                <opt.icon size={28} />
              </div>
              <div>
                <h3 className="font-black text-slate-900">{opt.title}</h3>
                <p className="text-sm text-slate-500 font-medium">{opt.subtitle}</p>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      {/* Quick Stats/Trust Badges */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-[24px] border-l-4 border-primary flex items-center gap-4">
          <Clock className="text-primary" />
          <div>
            <p className="font-black text-sm text-slate-900">5-Min Response</p>
            <p className="text-xs text-slate-500">Average wait time</p>
          </div>
        </div>
        <div className="p-6 bg-white rounded-[24px] border-l-4 border-green-500 flex items-center gap-4">
          <CheckCircle2 className="text-green-500" />
          <div>
            <p className="font-black text-sm text-slate-900">98% Resolution</p>
            <p className="text-xs text-slate-500">Solved on first contact</p>
          </div>
        </div>
      </div>

      {/* Emergency Section */}
      <div className="p-6 bg-orange-50 rounded-[32px] border border-orange-100 flex items-start gap-4">
        <AlertTriangle className="text-orange-600 mt-1" />
        <div>
          <h4 className="font-black text-orange-900">Emergency Support</h4>
          <p className="text-sm text-orange-700/80 leading-relaxed mt-1">
            For urgent issues regarding ongoing deliveries or payment failures, please call us directly for immediate intervention.
          </p>
        </div>
      </div>
    </div>
  );
}