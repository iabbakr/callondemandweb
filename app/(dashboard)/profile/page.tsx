"use client";

import React, { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { 
  User, Mail, Phone, MapPin, Camera, 
  Loader2, LogOut, ShieldCheck, ChevronRight, 
  CreditCard, Smartphone
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { userProfile, updateUserProfile } = useApp();
  const { logOut } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic size validation (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image too large. Please select a file under 5MB.");
    }

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        
        // 🚀 This call goes to your Render backend to handle Cloudinary
        const res = await api.post("/api/upload/image", {
          fileUri: base64,
          oldImagePublicId: userProfile?.profilePicPublicId, // Pass old ID for cleanup
        });

        // ✅ Update Firestore with both the URL and the new PublicID
        await updateUserProfile({ 
          
          photoURL: res.data.url, 
          profilePicPublicId: res.data.publicId 
        });
        
        toast.success("Profile picture updated!");
      } catch (err) {
        console.error("Upload Error:", err);
        toast.error("Failed to upload image. Please check your connection.");
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <button 
          onClick={logOut}
          className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-all active:scale-95"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* --- AVATAR SECTION --- */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 ring-1 ring-slate-100">
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <img 
                src={userProfile?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                alt="Profile"
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
              />
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl border-4 border-white shadow-xl hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
          >
            <Camera size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
        <h2 className="mt-6 text-2xl font-black text-slate-900">{userProfile?.fullName || "Full Name"}</h2>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
          {userProfile?.username ? `@${userProfile.username}` : "No Username Set"}
        </p>
      </div>

      {/* --- DETAILS SECTION --- */}
      <div className="space-y-4">
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Contact Information</h3>
          <div className="space-y-6">
            <InfoTile icon={<Mail size={18}/>} label="Email Address" value={userProfile?.email || "---"} />
            <InfoTile icon={<Phone size={18}/>} label="Phone Number" value={userProfile?.phoneNumber || "Not provided"} />
          </div>
        </section>

        {/* --- WITHDRAWAL SETTINGS --- */}
        <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bank Details</h3>
            {userProfile?.paystackRecipientCode && (
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-black uppercase tracking-tight">Verified</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 group cursor-pointer hover:border-primary/20 transition-all">
            <div className="bg-white p-3 rounded-2xl text-primary shadow-sm group-hover:scale-110 transition-transform">
              <CreditCard size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-slate-900">{userProfile?.bankName || "Link Settlement Bank"}</p>
              <p className="text-xs text-slate-400 font-bold">
                {userProfile?.accountNumber ? `**** ${userProfile.accountNumber.slice(-4)}` : "For instant withdrawals"}
              </p>
            </div>
            <ChevronRight className="text-slate-300" size={20} />
          </div>
        </section>
      </div>

      <p className="text-center text-[10px] text-slate-300 mt-12 font-black uppercase tracking-[0.3em]">
        CallOnDemand Core v1.0.0
      </p>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function InfoTile({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}