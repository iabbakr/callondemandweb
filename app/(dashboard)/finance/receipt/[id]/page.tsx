"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Printer, Download, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { cn } from "@/lib/utils";

export default function WebReceipt() {
  const { id } = useParams();
  const router = useRouter();
  const { transactions } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const tx = transactions.find(t => t.id === id);

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    
    setIsDownloading(true);
    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Receipt-${tx?.id || "COD"}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!tx) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center animate-pulse">
        <Loader2 className="mx-auto mb-4 animate-spin text-primary" size={32} />
        <p className="font-black text-slate-900">Loading Receipt...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-slate-400 mb-6 sm:mb-8 font-bold hover:text-primary transition-colors group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-sm sm:text-base">Close</span>
      </button>

      {/* The Actual Receipt Content */}
      <div 
        ref={receiptRef} 
        className="bg-white rounded-[32px] sm:rounded-[48px] border border-slate-100 shadow-2xl p-6 sm:p-12 relative overflow-hidden"
      >
        {/* Decorative corner accent - Hidden on very small screens to save space */}
        <div className="hidden sm:block absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10" />

        {/* Success Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8 sm:mb-10 relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 size={32} className="sm:size-10" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Transaction Successful
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              Verified by CallOnDemand Systems
            </p>
          </div>
        </div>

        {/* Amount Section */}
        <div className="bg-slate-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center mb-8 sm:mb-10 border border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
            Amount Paid
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-primary tracking-tighter">
            ₦{tx.amount.toLocaleString()}
          </h1>
        </div>

        {/* Details List */}
        <div className="space-y-4 sm:space-y-6">
          <DetailRow label="Service" value={tx.category || tx.type} />
          <DetailRow label="Description" value={tx.description} />
          <DetailRow label="Reference ID" value={tx.id} isMono />
          <DetailRow label="Date & Time" value={tx.date?.toDate ? tx.date.toDate().toLocaleString() : 'Just now'} />
          <DetailRow label="Status" value={tx.status} isStatus />
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-dashed border-slate-200 text-center">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Thank you for choosing CallOnDemand
            </p>
        </div>
      </div>

      {/* Action Buttons - Stacked on Mobile, Grid on Desktop */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mt-8 sm:mt-10">
        <button 
          onClick={() => window.print()} 
          className="order-2 sm:order-1 flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
        >
          <Printer size={18} /> Print
        </button>
        <button 
          disabled={isDownloading}
          onClick={downloadPDF} 
          className="order-1 sm:order-2 flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:bg-slate-300"
        >
          {isDownloading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Download size={18} /> 
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isMono, isStatus }: any) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-slate-50 sm:border-none">
      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 sm:mb-0">
        {label}
      </span>
      <span className={cn(
        "text-sm font-bold text-slate-900 text-left sm:text-right max-w-full sm:max-w-[60%]",
        isMono && "font-mono text-[10px] sm:text-[11px] opacity-60 break-all",
        isStatus && "text-green-500 uppercase tracking-widest text-[10px] bg-green-50 px-2 py-1 rounded-md"
      )}>
        {value}
      </span>
    </div>
  );
}