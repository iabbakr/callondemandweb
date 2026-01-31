"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { handleDailyCheckIn, redeemBonus } from "@/lib/rewards";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; 
import { 
  Coins, Flame, Users, CheckCircle2, 
  Gift, Trophy, Loader2, ChevronRight 
} from "lucide-react";
import toast from "react-hot-toast";

export default function RewardsPage() {
  const { userProfile, referredUsers } = useApp();
  const router = useRouter(); 
  
  const [bonusBalance, setBonusBalance] = useState(0);
  const [streak, setStreak] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Firestore Listener for Live Updates
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBonusBalance(data.bonusBalance || 0);
        setStreak(data.streakCount || 0);
        
        const lastCheckIn = data.lastCheckIn?.toDate();
        const today = new Date();
        const isToday = lastCheckIn && 
          lastCheckIn.toDateString() === today.toDateString();
        setCheckedInToday(!!isToday);
      }
    });
    return () => unsub();
  }, []);

  const onCheckIn = async () => {
    const user = auth.currentUser;
    if (checkedInToday || !user) return;
    
    try {
      const result = await handleDailyCheckIn(user.uid);
      if (result.rewarded) {
        toast.success("7-Day Streak! +10 Bonus Coins added!");
      } else {
        toast.success("Daily Check-In Successful!");
      }
    } catch (error) {
      toast.error("Check-in failed. Try again.");
    }
  };

  const handleRedeem = async () => {
    const user = auth.currentUser;
    if (!user || bonusBalance <= 0) {
      return toast.error("No coins available to redeem");
    }

    setIsRedeeming(true);
    try {
      // Pass both UID and the amount to the reward logic
      await redeemBonus(user.uid, bonusBalance);
      toast.success(`Successfully redeemed ${bonusBalance} coins!`);
    } catch (error) {
      toast.error("Redemption failed");
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-gray-900">Rewards</h1>
        <p className="text-sm text-gray-400 font-medium tracking-tight">Turn your activities into real balance</p>
      </header>

      {/* --- BALANCE CARD --- */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-400 rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-primary rounded-[40px] p-10 text-white flex flex-col items-center shadow-2xl">
          <div className="bg-white/10 p-5 rounded-3xl mb-4 backdrop-blur-md">
            <Coins className="text-yellow-400" size={48} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-2">Reward Balance</p>
          <h2 className="text-7xl font-black mb-8 tracking-tighter">{bonusBalance.toLocaleString()}</h2>
          
          <button 
            onClick={handleRedeem}
            disabled={isRedeeming || bonusBalance <= 0}
            className="w-full max-w-xs bg-white text-primary py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:scale-100"
          >
            {isRedeeming ? <Loader2 className="animate-spin mx-auto" /> : "Redeem to Main Wallet"}
          </button>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-3 gap-6">
        <StatItem icon={<Trophy className="text-primary" />} value={userProfile?.tasksCompleted || 0} label="Tasks" />
        <StatItem icon={<Flame className="text-orange-500" />} value={streak} label="Streak" highlight={streak > 0} />
        <StatItem icon={<Users className="text-primary" />} value={referredUsers?.length || 0} label="Referrals" />
      </div>

      {/* --- 7-DAY PROGRESS --- */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">7-Day Streak Progress</h3>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full italic">Earn 10 coins on Day 7</span>
        </div>
        
        <div className="flex justify-between items-center px-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div key={day} className="flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
                ${streak >= day 
                  ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-200" 
                  : "bg-gray-50 border-gray-100 text-gray-300"}`}>
                {streak >= day ? <CheckCircle2 size={18} /> : <span className="text-xs font-black">{day}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ACTIONS --- */}
      <div className="grid md:grid-cols-2 gap-6">
        <RewardAction 
          title="Daily Check-In" 
          desc="+1 Coin every 24 hours" 
          icon={<Gift />}
          onClick={onCheckIn}
          disabled={checkedInToday}
          activeText="Collected Today"
        />
        <RewardAction 
          title="Invite Friends" 
          desc="+100 Coins per referral" 
          icon={<Users />}
          onClick={() => router.push('/referrals')}
        />
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatItem({ icon, value, label, highlight }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex flex-col items-center shadow-sm">
      <div className="mb-3">{icon}</div>
      <span className={`text-2xl font-black tracking-tight ${highlight ? 'text-orange-500' : 'text-gray-900'}`}>{value}</span>
      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

function RewardAction({ title, desc, icon, onClick, disabled, activeText }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-5 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group disabled:opacity-50 disabled:bg-gray-50"
    >
      <div className={`p-4 rounded-2xl ${disabled ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors'}`}>
        {icon}
      </div>
      <div>
        <p className="font-black text-gray-900 text-sm">{disabled ? activeText : title}</p>
        <p className="text-[11px] text-gray-400 font-medium">{desc}</p>
      </div>
    </button>
  );
}