import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Table, CafeSettings } from '../types';
import { DEFAULT_CAFE_SETTINGS, DEFAULT_TABLES } from '../data/defaultData';
import { 
  Sparkles, 
  QrCode, 
  MapPin, 
  Phone, 
  Clock, 
  Utensils, 
  Shield, 
  ArrowRight,
  Coffee,
  Pizza,
  ShoppingBag
} from 'lucide-react';

interface LandingViewProps {
  onNavigateAdmin: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigateAdmin }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_CAFE_SETTINGS);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tables'), (snapshot) => {
      if (!snapshot.empty) {
        const list: Table[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        list.sort((a, b) => (a.tableNumber || '').localeCompare(b.tableNumber || '', undefined, { numeric: true }));
        setTables(list);
      } else {
        setTables(DEFAULT_TABLES.map((t) => ({ id: `T${t.tableNumber}`, ...t })));
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8ED] text-[#241A18] flex flex-col justify-between">
      {/* Top Royal Navbar */}
      <nav className="bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#EADBCA] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5A1724] to-[#3B0E17] text-[#C99A3D] flex items-center justify-center shadow-md border border-[#C99A3D]/40">
              <Sparkles size={20} className="text-[#C99A3D]" />
            </div>
            <div>
              <h1 className="text-base font-black text-[#5A1724] font-royal tracking-wider leading-none">
                RICH 'N' ROYAL
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C99A3D]">
                CAFE & RESTRO
              </span>
            </div>
          </div>

          <button
            onClick={onNavigateAdmin}
            className="px-3.5 py-1.5 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Shield size={14} className="text-[#C99A3D]" />
            <span>Admin Portal</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 flex-1">
        {/* Royal Hero */}
        <div className="bg-gradient-to-br from-[#5A1724] via-[#46111B] to-[#2E0911] rounded-3xl p-6 sm:p-10 text-[#FFF8ED] shadow-xl border border-[#C99A3D]/40 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF8ED]/10 border border-[#C99A3D]/40 text-[#C99A3D] text-xs font-bold font-royal">
              <Sparkles size={14} />
              <span>Royal Taste • Premium Ambience</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-royal tracking-wide text-white leading-tight">
              RICH 'N' ROYAL CAFE
            </h2>

            <p className="text-xs sm:text-sm text-[#FFF8ED]/85 leading-relaxed">
              Experience contactless table-side dining. Scan the QR code placed on your dining table to explore our mouthwatering pizzas, gourmet pastas, thick shakes, and quick bites.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#C99A3D]">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                <span>Sector 8, Ambala</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>Open for Dining</span>
              </span>
            </div>
          </div>

          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-[#FFF8ED]/10 border-2 border-[#C99A3D]/50 text-[#C99A3D] flex items-center justify-center shrink-0 shadow-2xl">
            <Utensils size={48} />
          </div>
        </div>

        {/* QR Table Simulation Selector */}
        <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="text-center max-w-md mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8ED] text-[#5A1724] border border-[#C99A3D]/30 text-xs font-bold font-royal mb-2">
              <QrCode size={14} className="text-[#C99A3D]" />
              <span>Customer QR Experience</span>
            </div>
            <h3 className="text-xl font-black text-[#5A1724] font-royal">
              Select Dining Table
            </h3>
            <p className="text-xs text-[#735A53] mt-1">
              In the cafe, customers scan the physical QR sticker at their table. Select a table below to test the ordering experience:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {tables.map((table) => {
              const tableCode = table.tableNumber ? `T${table.tableNumber.padStart(2, '0')}` : table.id;
              return (
                <a
                  key={table.id}
                  href={`/menu?table=${tableCode}`}
                  className="group p-4 bg-[#FFF8ED] hover:bg-[#5A1724] hover:text-[#FFF8ED] border border-[#EADBCA] hover:border-[#5A1724] rounded-2xl transition-all shadow-2xs hover:shadow-md flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-xl bg-[#5A1724] text-[#C99A3D] group-hover:bg-[#C99A3D] group-hover:text-[#241A18] font-royal font-bold text-xs flex items-center justify-center transition-colors">
                        {table.tableNumber || '#'}
                      </span>
                      <span className="text-[10px] font-bold text-[#93786F] group-hover:text-[#FFF8ED]/80">
                        {tableCode}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-[#241A18] group-hover:text-white font-royal">
                      {table.tableName}
                    </h4>
                    <span className="text-[11px] text-[#735A53] group-hover:text-[#FFF8ED]/80 block mt-0.5">
                      {table.section || 'Main Hall'}
                    </span>
                  </div>

                  <div className="mt-4 pt-2 border-t border-[#EADBCA] group-hover:border-[#FFF8ED]/20 flex items-center justify-between text-[11px] font-bold text-[#5A1724] group-hover:text-[#C99A3D]">
                    <span>Open Menu</span>
                    <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Location & Contact Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-2xl p-5 shadow-2xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8ED] border border-[#EADBCA] text-[#5A1724] flex items-center justify-center shrink-0">
              <MapPin size={20} className="text-[#C99A3D]" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#735A53]">
                Cafe Location
              </h4>
              <p className="text-xs font-semibold text-[#241A18] mt-1 leading-relaxed">
                Huda Ground, near HP Petrol Pump, Sector 8, Ambala, Haryana 134003
              </p>
            </div>
          </div>

          <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-2xl p-5 shadow-2xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8ED] border border-[#EADBCA] text-[#5A1724] flex items-center justify-center shrink-0">
              <Phone size={20} className="text-[#C99A3D]" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#735A53]">
                Direct Contact
              </h4>
              <p className="text-xs font-semibold text-[#241A18] mt-1">
                +91 98765 43210
              </p>
              <span className="text-[11px] text-[#93786F]">Assistance & Table Reservations</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EADBCA] bg-[#FFFDF9] py-4 text-center text-xs text-[#735A53]">
        <p className="font-royal font-bold text-[#5A1724]">
          RICH 'N' ROYAL CAFE • AMBALA
        </p>
        <p className="text-[10px] text-[#93786F] mt-0.5">
          Mobile QR Ordering & Kitchen Management System
        </p>
      </footer>
    </div>
  );
};
