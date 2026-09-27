import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus } from '../types';
import { AdminOrderCard } from '../components/admin/AdminOrderCard';
import { 
  ShoppingBag, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  IndianRupee, 
  Sparkles, 
  Filter, 
  UtensilsCrossed 
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [allOrdersToday, setAllOrdersToday] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Real-time listener for active orders and today's statistics
  useEffect(() => {
    // 1. Active Orders Query (Pending, Preparing, Ready)
    const activeQuery = query(
      collection(db, 'orders'),
      where('status', 'in', ['pending', 'preparing', 'ready'])
    );

    const unsubActive = onSnapshot(
      activeQuery,
      (snapshot) => {
        const orders: Order[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as any),
        }));

        // Sort: Pending first, then preparing, then ready (newest first)
        orders.sort((a, b) => {
          const statusRank: Record<OrderStatus, number> = {
            pending: 1,
            preparing: 2,
            ready: 3,
            completed: 4,
            cancelled: 5,
          };
          if (statusRank[a.status] !== statusRank[b.status]) {
            return statusRank[a.status] - statusRank[b.status];
          }
          const timeA = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        setActiveOrders(orders);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching active orders:', error);
        setLoading(false);
      }
    );

    // 2. All Orders for Today (for Statistics calculation)
    const allQuery = query(collection(db, 'orders'));
    const unsubAll = onSnapshot(allQuery, (snapshot) => {
      const all: Order[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as any),
      }));
      setAllOrdersToday(all);
    });

    return () => {
      unsubActive();
      unsubAll();
    };
  }, []);

  // Filter Active Orders
  const filteredOrders = activeOrders.filter((order) => {
    const matchesStatus = selectedFilter === 'all' || order.status === selectedFilter;
    const matchesTable = tableFilter === 'all' || order.tableId === tableFilter || order.tableName === tableFilter;
    return matchesStatus && matchesTable;
  });

  // Calculate Today's Stats
  const todayCompleted = allOrdersToday.filter((o) => o.status === 'completed');
  const todayRevenue = todayCompleted.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingCount = activeOrders.filter((o) => o.status === 'pending').length;
  const preparingCount = activeOrders.filter((o) => o.status === 'preparing').length;
  const readyCount = activeOrders.filter((o) => o.status === 'ready').length;

  // Extract unique active table list for dropdown
  const activeTables = Array.from(new Set(activeOrders.map((o) => o.tableName)));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-[#C99A3D] uppercase tracking-widest block font-royal">
            Kitchen & Service Station
          </span>
          <h1 className="text-2xl font-black text-[#5A1724] font-royal">
            Live Active Orders
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADBCA] text-xs font-semibold text-[#735A53] shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Real-time Live Sync</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Orders */}
        <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#735A53]">
              Active Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#5A1724] font-royal">
              {activeOrders.length}
            </span>
            {pendingCount > 0 && (
              <span className="text-xs font-bold text-amber-700">
                ({pendingCount} pending)
              </span>
            )}
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#735A53]">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#5A1724] font-royal">
              {allOrdersToday.length}
            </span>
          </div>
        </div>

        {/* Today's Completed */}
        <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#735A53]">
              Served Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#5A1724] font-royal">
              {todayCompleted.length}
            </span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#735A53]">
              Sales Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#5A1724]/10 text-[#5A1724] flex items-center justify-center">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-[#5A1724] font-royal">
              ₹{todayRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Table Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] p-2.5 rounded-2xl border border-[#EADBCA]">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-[#5A1724] text-[#FFF8ED] shadow-2xs'
                : 'text-[#735A53] hover:bg-[#F3E7D5]'
            }`}
          >
            All Active ({activeOrders.length})
          </button>

          <button
            onClick={() => setSelectedFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Pending ({pendingCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('preparing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'preparing'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-blue-800 hover:bg-blue-50'
            }`}
          >
            <ChefHat size={14} />
            <span>Preparing ({preparingCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('ready')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'ready'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Ready ({readyCount})</span>
          </button>
        </div>

        {/* Table Filter Selector */}
        {activeTables.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#735A53] font-semibold whitespace-nowrap">
              Filter Table:
            </span>
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-[#FFF8ED] border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
            >
              <option value="all">All Tables</option>
              {activeTables.map((tName) => (
                <option key={tName} value={tName}>
                  {tName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-[#5A1724] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#735A53]">Loading active orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center bg-[#FFFDF9] rounded-3xl border border-[#EADBCA] p-8 shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-[#F3E7D5] text-[#93786F] flex items-center justify-center mx-auto mb-3">
            <UtensilsCrossed size={32} />
          </div>
          <h3 className="text-base font-black text-[#5A1724] font-royal">
            No Active Orders Right Now
          </h3>
          <p className="text-xs text-[#735A53] mt-1 max-w-sm mx-auto">
            New customer orders placed by scanning QR codes at dining tables will instantly appear here in real time.
          </p>
          <div className="mt-4">
            <a
              href="/menu?table=T01"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5A1724] text-[#FFF8ED] text-xs font-bold hover:bg-[#46111B] shadow-2xs"
            >
              <Sparkles size={14} className="text-[#C99A3D]" />
              <span>Simulate Customer Order on Table 01</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <AdminOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
