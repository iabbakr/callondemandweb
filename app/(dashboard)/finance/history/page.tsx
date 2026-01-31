"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from "@/context/AppContext";
import { 
  ArrowLeft, Search, Filter, Download, 
  ArrowUpRight, ArrowDownLeft, FileText, X,
  Utensils, Smartphone, Zap, Tv, Landmark, 
  User, ShoppingBag, Truck, CreditCard, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { cn } from "@/lib/utils";

/**
 * Helper to map categories to specific icons
 */
const getCategoryIcon = (category: string, type: 'credit' | 'debit') => {
  const cat = category?.toLowerCase();
  if (cat?.includes('food')) return <Utensils size={22} />;
  if (cat?.includes('airtime')) return <Smartphone size={22} />;
  if (cat?.includes('data')) return <Zap size={22} />;
  if (cat?.includes('cable') || cat?.includes('tv')) return <Tv size={22} />;
  if (cat?.includes('withdraw')) return <Landmark size={22} />;
  if (cat?.includes('p2p') || cat?.includes('transfer')) return <User size={22} />;
  if (cat?.includes('shop')) return <ShoppingBag size={22} />;
  if (cat?.includes('logistics') || cat?.includes('delivery')) return <Truck size={22} />;
  if (cat?.includes('wallet') || cat?.includes('topup')) return <CreditCard size={22} />;
  
  // Default arrows if no category match
  return type === 'credit' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />;
};

export default function TransactionHistory() {
  const { transactions, isLoading } = useApp();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || tx.category === activeCategory;
      const matchesType = activeType === 'all' || tx.type === activeType;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, searchTerm, activeCategory, activeType]);

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, [transactions]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-primary mb-2 transition-colors group font-bold">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
          </Link>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Records & History</h1>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:shadow-xl transition-all active:scale-95">
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* 2. Filters Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search description or reference..."
            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-700 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none appearance-none font-black text-[10px] uppercase tracking-widest text-slate-500 cursor-pointer shadow-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'All Services' : cat}</option>
            ))}
          </select>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 shadow-inner font-black uppercase text-[10px] tracking-tighter">
          {['all', 'credit', 'debit'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                "flex-1 px-4 py-2 rounded-xl transition-all",
                activeType === t ? "bg-white text-primary shadow-sm" : "text-slate-400"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Data Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
              <th className="px-8 py-6">Transaction Detail</th>
              <th className="px-8 py-6 hidden md:table-cell">Status</th>
              <th className="px-8 py-6">Amount</th>
              <th className="px-8 py-6 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-bold">
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                      tx.type === 'credit' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      {getCategoryIcon(tx.category, tx.type)}
                    </div>
                    <div>
                      <p className="text-slate-900 leading-tight group-hover:text-primary transition-colors">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{tx.category}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-[10px] text-slate-400 font-medium">
                          {tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 hidden md:table-cell">
                   <div className={cn(
                     "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                     tx.status === 'success' ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"
                   )}>
                     <div className={cn("w-1.5 h-1.5 rounded-full", tx.status === 'success' ? "bg-green-500 animate-pulse" : "bg-orange-500")} />
                     {tx.status}
                   </div>
                </td>
                <td className="px-8 py-6 text-lg">
                  <span className={tx.type === 'credit' ? "text-green-600" : "text-slate-900 font-black"}>
                    {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <Link href={`/finance/receipt/${tx.id}`} className="inline-flex p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-90">
                    <FileText size={20} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && !isLoading && (
          <div className="py-32 text-center flex flex-col items-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <Search size={32} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No results found</h3>
            <p className="text-slate-400 font-medium mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}