"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { 
  Search, 
  User as UserIcon, 
  Shield, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  Mail,
  Filter
} from "lucide-react";
import toast from "react-hot-toast";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Live listener for all users
  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("fullName", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const userList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Filter logic
  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  // 3. Admin Action: Toggle User Role
  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      toast.success(`User updated to ${newRole}`);
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500">Monitor and manage all registered accounts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search name, email, or username..."
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full md:w-80 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* --- USERS TABLE --- */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.fullName}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail size={10} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Shield size={10} /> {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-black text-sm text-slate-700">
                    ₦{(user.balance || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    {user.nameVerified ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase">
                        <XCircle size={12} /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => toggleRole(user.id, user.role)}
                      className="p-2 text-slate-400 hover:text-primary transition-colors"
                    >
                      <Shield size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase animate-pulse">
              Loading Users...
            </div>
          )}
          
          {!loading && filteredUsers.length === 0 && (
            <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase">
              No users found matching "{search}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}