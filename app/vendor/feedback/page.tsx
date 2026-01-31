"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  updateDoc
} from "firebase/firestore";
import { 
  Star, 
  MessageCircle, 
  Calendar, 
  User, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Reply
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function FeedbackHub() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    // Listen for orders that have been rated
    const q = query(
      collection(db, "orders"),
      where("rating", ">", 0),
      orderBy("rating", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredReviews = filterRating 
    ? reviews.filter(r => r.rating === filterRating) 
    : reviews;

  // Calculate Average Rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Feedback Hub</h1>
          <p className="text-slate-500 font-medium">Monitor your reputation and improve service quality</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-[24px] border border-slate-100 shadow-sm">
           <div className="px-6 py-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg Rating</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900">{avgRating}</span>
                <Star size={18} className="text-yellow-400 fill-current" />
              </div>
           </div>
           <div className="h-10 w-[1px] bg-slate-100" />
           <div className="px-6 py-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Reviews</p>
              <p className="text-2xl font-black text-primary">{reviews.length}</p>
           </div>
        </div>
      </header>

      {/* --- RATING FILTERS --- */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setFilterRating(null)}
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${!filterRating ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border border-slate-100'}`}
        >All</button>
        {[5, 4, 3, 2, 1].map(num => (
          <button 
            key={num}
            onClick={() => setFilterRating(num)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${filterRating === num ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border border-slate-100'}`}
          >
            {num} <Star size={12} fill={filterRating === num ? "currentColor" : "none"} />
          </button>
        ))}
      </div>

      {/* --- FEEDBACK LIST --- */}
      <div className="grid gap-6">
        {loading ? (
          <div className="py-20 text-center animate-pulse opacity-20 font-black uppercase tracking-[0.2em]">Aggregating Reviews...</div>
        ) : filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-[40px] border border-slate-50 p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                  <User size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-900">{review.customerName || "Verified User"}</h3>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">{review.category} Order</span>
                  </div>
                  <div className="flex gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-yellow-400" : "text-slate-100"} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right">
                 <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest flex items-center md:justify-end gap-2">
                   <Calendar size={12} /> {review.ratedAt?.toDate ? format(review.ratedAt.toDate(), "MMM dd, yyyy") : "Recent"}
                 </p>
                 <p className="text-xs font-bold text-slate-400 mt-1 uppercase">ID: #{review.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            <div className="mt-8 bg-slate-50/50 p-6 rounded-[32px] border border-slate-50">
               <p className="text-slate-600 font-medium leading-relaxed italic">
                 "{review.reviewComment || "No written comment provided."}"
               </p>
            </div>

            {/* Quick Response Action */}
            <div className="mt-8 flex justify-between items-center">
               <div className="flex items-center gap-2 text-green-600">
                 <CheckCircle2 size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Order Fulfilled</span>
               </div>
               <button className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform">
                 Reply to User <Reply size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}