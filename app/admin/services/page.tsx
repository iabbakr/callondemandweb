"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Plus, 
  Utensils, 
  Shirt, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  Loader2,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface Extra {
  name: string;
  price: number;
}

export default function ServiceManagement() {
  const [activeTab, setActiveTab] = useState<"food" | "laundry">("food");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ 
    id: "", 
    name: "", 
    price: "", 
    category: "food" 
  });
  const [extras, setExtras] = useState<Extra[]>([]);

  useEffect(() => {
    setLoading(true);
    // Standardize collection to 'meals' for food as per your new logic
    const collectionName = activeTab === "food" ? "meals" : "laundry_items";
    const q = query(collection(db, collectionName));

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, [activeTab]);

  // Handle Extras Logic
  const addExtraField = () => setExtras([...extras, { name: "", price: 0 }]);
  const removeExtraField = (index: number) => setExtras(extras.filter((_, i) => i !== index));
  const updateExtra = (index: number, field: keyof Extra, value: string | number) => {
    const newExtras = [...extras];
    newExtras[index] = { ...newExtras[index], [field]: field === 'price' ? Number(value) : value };
    setExtras(newExtras);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const collectionName = activeTab === "food" ? "meals" : "laundry_items";
    
    const payload = {
      name: formData.name,
      basePrice: Number(formData.price),
      category: activeTab,
      extras: activeTab === "food" ? extras : [],
      available: true,
      updatedAt: serverTimestamp()
    };

    try {
      if (formData.id) {
        await updateDoc(doc(db, collectionName, formData.id), payload);
        toast.success("Item updated!");
      } else {
        await addDoc(collection(db, collectionName), {
          ...payload,
          createdAt: serverTimestamp()
        });
        toast.success("Item added to menu!");
      }
      closeModal();
    } catch (err) {
      toast.error("Error saving item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item from the catalog?")) return;
    const collectionName = activeTab === "food" ? "meals" : "laundry_items";
    await deleteDoc(doc(db, collectionName, id));
    toast.success("Item removed");
  };

  const openModal = (item?: any) => {
    if (item) {
      setFormData({ id: item.id, name: item.name, price: (item.basePrice || item.price).toString(), category: activeTab });
      setExtras(item.extras || []);
    } else {
      setFormData({ id: "", name: "", price: "", category: activeTab });
      setExtras([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: "", name: "", price: "", category: "food" });
    setExtras([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Service Catalog</h1>
          <p className="text-slate-500 font-medium text-sm">Update prices and manage offerings across the app</p>
        </div>

        <button 
          onClick={() => openModal()}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={20} /> Add New {activeTab === "food" ? "Meal" : "Service"}
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mb-8">
        <TabButton active={activeTab === "food"} onClick={() => setActiveTab("food")} icon={<Utensils size={16} />} label="Food Menu" />
        <TabButton active={activeTab === "laundry"} onClick={() => setActiveTab("laundry")} icon={<Shirt size={16} />} label="Laundry Services" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 opacity-20">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-bold uppercase tracking-widest text-xs text-center">Syncing Catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors font-bold">
                  {activeTab === "food" ? <Utensils size={24} /> : <Shirt size={24} />}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
              <p className="text-primary font-black text-xl mt-1">₦{(item.basePrice || item.price).toLocaleString()}</p>
              
              {item.extras?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.extras.map((ex: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 text-[9px] font-bold text-slate-500 rounded-md uppercase">
                      + {ex.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={closeModal} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"><X /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-6">{formData.id ? 'Edit Item' : 'New Item'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Item Name</label>
                  <input required type="text" className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Base Price (₦)</label>
                  <input required type="number" className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>

              {/* Extras Manager Section */}
              {activeTab === "food" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optional Extras (Plantain, Water, etc.)</label>
                    <button type="button" onClick={addExtraField} className="text-primary flex items-center gap-1 text-[10px] font-black uppercase">
                      <PlusCircle size={14} /> Add Extra
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {extras.map((extra, index) => (
                      <div key={index} className="flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
                        <input placeholder="Extra Name" className="flex-1 px-3 py-2 bg-slate-50 border rounded-xl text-sm" value={extra.name} onChange={e => updateExtra(index, 'name', e.target.value)} />
                        <input placeholder="Price" type="number" className="w-24 px-3 py-2 bg-slate-50 border rounded-xl text-sm" value={extra.price} onChange={e => updateExtra(index, 'price', e.target.value)} />
                        <button type="button" onClick={() => removeExtraField(index)} className="text-red-400 hover:text-red-600"><MinusCircle size={20}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 hover:shadow-lg transition-all">
                <Save size={18} /> {formData.id ? 'Update Database' : 'Save to Menu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${active ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
      {icon} {label}
    </button>
  );
}