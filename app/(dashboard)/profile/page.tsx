"use client";

import React, { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { 
  User, Mail, Phone, MapPin, Camera, 
  Loader2, LogOut, ShieldCheck, ChevronRight, 
  CreditCard, CheckCircle, Smartphone
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

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await api.post("/api/upload/image", {
          fileUri: base64,
          oldImagePublicId: userProfile?.profilePicPublicId,
        });

        await updateUserProfile({ 
          profilePic: res.data.url, 
          profilePicPublicId: res.data.publicId 
        });
        toast.success("Profile picture updated!");
      } catch (err) {
        toast.error("Failed to upload image.");
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <div className="max-w-2xl mx-auto p-6 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <button 
          onClick={logOut}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
        >
          <LogOut size={22} />
        </button>
      </div>

      {/* --- AVATAR SECTION --- */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100">
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : (
              <img 
                src={userProfile?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full border-2 border-white shadow-lg btn-active"
          >
            <Camera size={16} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">{userProfile?.fullName}</h2>
        <p className="text-sm text-gray-500">@{userProfile?.username}</p>
      </div>

      {/* --- ACCOUNT DETAILS --- */}
      <div className="space-y-4">
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Information</h3>
          <div className="space-y-4">
            <InfoTile icon={<Mail size={18}/>} label="Email" value={userProfile?.email} />
            <InfoTile icon={<Phone size={18}/>} label="Phone" value={userProfile?.phoneNumber} />
            <InfoTile icon={<MapPin size={18}/>} label="Location" value={userProfile?.location} />
          </div>
        </section>

        {/* --- BANK & WALLET SETTINGS --- */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Withdrawal Settings</h3>
            {userProfile?.nameVerified && (
              <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-bold">
                <ShieldCheck size={12} /> VERIFIED
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
            <div className="bg-accent p-3 rounded-full text-primary">
              <CreditCard size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{userProfile?.bankName || "No Bank Linked"}</p>
              <p className="text-xs text-gray-500">{userProfile?.accountNumber || "Click to add bank details"}</p>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
          </div>

          <button className="w-full mt-4 text-primary text-sm font-bold py-2 hover:bg-accent/30 rounded-xl transition-colors">
            Update Bank Details
          </button>
        </section>

        {/* --- APP SETTINGS --- */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Security</h3>
          <div className="space-y-2">
            <SettingsButton icon={<ShieldCheck size={18}/>} label="Change Security PIN" />
            <SettingsButton icon={<Smartphone size={18}/>} label="Notification Preferences" />
          </div>
        </section>
      </div>

      <p className="text-center text-[10px] text-gray-400 mt-8 uppercase tracking-widest">
        CallOnDemand Web v1.0.0
      </p>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function InfoTile({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-700">{value || "Not set"}</p>
      </div>
    </div>
  );
}

function SettingsButton({ icon, label }: { icon: any, label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group text-left">
      <div className="flex items-center gap-3">
        <div className="text-gray-400 group-hover:text-primary transition-colors">{icon}</div>
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <ChevronRight className="text-gray-300" size={18} />
    </button>
  );
}