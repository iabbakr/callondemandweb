"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  Image as ImageIcon,
  Search,
  LayoutGrid
} from "lucide-react";
import toast from "react-hot-toast";

export default function VendorProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "food", available: true });

  useEffect(() => {
    // In production, filter by where("vendorId", "==", user.uid)
    const q = query(collection(db, "products"));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "products", productId), { available: !currentStatus });
      toast.success("Availability updated");
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        price: parseFloat(newProduct.price),
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setNewProduct({ name: "", price: "", category: "food", available: true });
      toast.success("Product added to catalog");
    } catch (e) {
      toast.error("Error adding product");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 font-medium">Manage your menu and service inventory</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          <Plus size={18} /> Add New Item
        </button>
      </header>

      {/* --- INVENTORY GRID --- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center opacity-20 font-black">FETCHING CATALOG...</div>
        ) : products.map((product) => (
          <div key={product.id} className={`bg-white border rounded-[32px] p-6 transition-all group ${!product.available ? 'opacity-60 border-slate-100' : 'border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                <ImageIcon size={24} />
              </div>
              <button 
                onClick={() => toggleAvailability(product.id, product.available)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${product.available ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}
              >
                {product.available ? <><ToggleRight size={14} /> Active</> : <><ToggleLeft size={14} /> Hidden</>}
              </button>
            </div>

            <h3 className="text-lg font-black text-slate-900">{product.name}</h3>
            <p className="text-primary font-black text-xl mt-1">₦{product.price.toLocaleString()}</p>
            
            <div className="mt-8 pt-6 border-t border-slate-50 flex gap-2">
              <button className="flex-1 py-3 rounded-xl border border-slate-100 text-slate-400 font-bold text-xs hover:bg-slate-50 transition-colors">Edit</button>
              <button 
                onClick={async () => {
                   if(confirm("Delete this item?")) {
                     await deleteDoc(doc(db, "products", product.id));
                     toast.success("Removed from catalog");
                   }
                }}
                className="p-3 rounded-xl border border-red-50 text-red-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl relative animate-in zoom-in">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Add to Catalog</h2>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Product Name</label>
                <input 
                  required
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all"
                  placeholder="e.g. Special Jollof Rice"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Price (₦)</label>
                <input 
                  required
                  type="number"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 font-bold transition-all"
                  placeholder="2500"
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-slate-400 text-xs uppercase">Cancel</button>
                <button type="submit" className="flex-[2] bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}