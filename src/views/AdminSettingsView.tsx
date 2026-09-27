import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CafeSettings, AdminUser } from '../types';
import { useAuth, BOOTSTRAP_ADMIN_EMAILS } from '../context/AuthContext';
import { 
  DEFAULT_CAFE_SETTINGS, 
  DEFAULT_CATEGORIES, 
  DEFAULT_PRODUCTS, 
  DEFAULT_TABLES 
} from '../data/defaultData';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  Save, 
  Check, 
  UserPlus, 
  LogOut,
  AlertCircle
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const { user, adminData, logout } = useAuth();
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_CAFE_SETTINGS);
  const [adminList, setAdminList] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'cafe'));
        if (docSnap.exists()) {
          setSettings(docSnap.data() as CafeSettings);
        }
      } catch (err) {
        console.warn('Using default cafe settings');
      }
    };

    const fetchAdmins = async () => {
      try {
        const snap = await getDocs(collection(db, 'admins'));
        const list: AdminUser[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setAdminList(list);
      } catch (err) {
        console.warn('Could not fetch admins collection');
      }
    };

    fetchSettings();
    fetchAdmins();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await setDoc(doc(db, 'settings', 'cafe'), {
        ...settings,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setSuccessMsg('Cafe settings updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save settings');
      handleFirestoreError(err, OperationType.WRITE, 'settings/cafe');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    try {
      const emailClean = newAdminEmail.trim().toLowerCase();
      const adminRef = doc(db, 'admins', emailClean.replace(/[^a-zA-Z0-9]/g, '_'));
      
      const newAdmin: AdminUser = {
        id: emailClean,
        email: emailClean,
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
      };

      await setDoc(adminRef, {
        email: emailClean,
        role: 'admin',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setAdminList((prev) => [...prev.filter((a) => a.email !== emailClean), newAdmin]);
      setNewAdminEmail('');
      setSuccessMsg(`Admin access granted to ${emailClean}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to authorize admin email');
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('Initialize database with Rich \'N\' Royal Cafe menu, categories, and tables?')) {
      return;
    }

    setIsSeeding(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Settings
      await setDoc(doc(db, 'settings', 'cafe'), {
        ...DEFAULT_CAFE_SETTINGS,
        updatedAt: serverTimestamp(),
      });

      // 2. Categories
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), {
          ...cat,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // 3. Tables
      for (const tbl of DEFAULT_TABLES) {
        await setDoc(doc(db, 'tables', `T${tbl.tableNumber}`), {
          ...tbl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // 4. Products
      for (const prod of DEFAULT_PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          ...prod,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setSuccessMsg('✨ Successfully seeded Rich \'N\' Royal Cafe menu and tables into Firestore!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg('Failed to seed menu data: ' + (err?.message || 'Permission denied'));
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold text-[#C99A3D] uppercase tracking-widest block font-royal">
          Configuration & Access
        </span>
        <h1 className="text-2xl font-black text-[#5A1724] font-royal">
          Cafe & Admin Settings
        </h1>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Cafe Information Form */}
      <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-6 shadow-2xs">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#F0E4D3]">
          <Building2 size={18} className="text-[#5A1724]" />
          <h2 className="text-base font-bold text-[#5A1724] font-royal">
            Cafe Profile & Operating Status
          </h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
                Cafe Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
              Physical Location & Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="e.g. Huda Ground, near HP Petrol Pump, Sector 8, Ambala, Haryana 134003"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
                Currency
              </label>
              <input
                type="text"
                value={settings.currencySymbol || '₹'}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
              />
            </div>
          </div>

          {/* Kitchen Open / Closed Switch */}
          <div className="flex items-center justify-between p-3.5 bg-[#FFF8ED] border border-[#EADBCA] rounded-2xl">
            <div>
              <span className="text-xs font-bold text-[#241A18] block">Kitchen Accepting Orders</span>
              <span className="text-[11px] text-[#735A53]">Toggle off to temporarily pause new customer QR orders</span>
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, isOpen: !settings.isOpen })}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                settings.isOpen ? 'bg-emerald-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.isOpen ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Save size={15} className="text-[#C99A3D]" />
              <span>{isSaving ? 'Saving...' : 'Save Cafe Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Admin Authorization & Whitelist */}
      <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-6 shadow-2xs">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#F0E4D3]">
          <ShieldCheck size={18} className="text-[#5A1724]" />
          <h2 className="text-base font-bold text-[#5A1724] font-royal">
            Authorized Administrators
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-[#735A53] leading-relaxed">
            Only verified Google accounts listed below are granted access to manage orders, products, tables, and cafe settings.
          </p>

          {/* Current Logged In Admin Profile */}
          <div className="p-3.5 bg-[#FDF9F3] border border-[#EADBCA] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#93786F]">Current Session</span>
              <p className="text-xs font-bold text-[#241A18]">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Whitelist Add Form */}
          <form onSubmit={handleAddAdminEmail} className="flex gap-2">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="Enter team member Google email..."
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#5A1724] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#46111B] shadow-2xs shrink-0"
            >
              <UserPlus size={14} className="text-[#C99A3D]" />
              <span>Grant Access</span>
            </button>
          </form>

          {/* Known Authorized List */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#735A53] block">
              Active Authorized Admin Accounts:
            </span>
            <div className="divide-y divide-[#F0E4D3] border border-[#EADBCA] rounded-2xl p-2 bg-white">
              {/* Bootstrap Emails */}
              {BOOTSTRAP_ADMIN_EMAILS.map((email) => (
                <div key={email} className="py-2 px-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-[#241A18]">{email}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    Super Admin
                  </span>
                </div>
              ))}
              {adminList.map((adm) => (
                <div key={adm.id} className="py-2 px-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-[#241A18]">{adm.email}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                    {adm.role || 'Admin'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Database Seeder Tool */}
      <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-6 shadow-2xs">
        <div className="flex items-center gap-2 pb-4 mb-3 border-b border-[#F0E4D3]">
          <Database size={18} className="text-[#5A1724]" />
          <h2 className="text-base font-bold text-[#5A1724] font-royal">
            Initialize / Seed Rich 'N' Royal Menu
          </h2>
        </div>

        <p className="text-xs text-[#735A53] leading-relaxed mb-4">
          Quickly populate standard categories (Pizza, Pasta, Burgers, Shakes, Maggi, Snacks), tables T01–T06, and sample menu items with pricing in ₹.
        </p>

        <button
          onClick={handleSeedDatabase}
          disabled={isSeeding}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5A1724] to-[#C99A3D] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          <Sparkles size={16} />
          <span>{isSeeding ? 'Seeding Database...' : 'Seed Royal Menu & Tables into Firestore'}</span>
        </button>
      </div>
    </div>
  );
};
