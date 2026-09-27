import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  Eye, 
  FileText,
  Filter
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const AdminOrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('completed');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const all: Order[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as any),
      }));

      // Sort newest first
      all.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setOrders(all);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (ts: any) => {
    if (!ts) return '-';
    try {
      const date = ts?.toDate ? ts.toDate() : new Date(ts);
      return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  // Filter historical orders
  const historicalOrders = orders.filter((o) => {
    // Only show completed or cancelled in historical view unless specified
    const matchesStatus =
      statusFilter === 'all'
        ? o.status === 'completed' || o.status === 'cancelled'
        : o.status === statusFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.tableName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items?.some((item) => item.productName?.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-[#C99A3D] uppercase tracking-widest block font-royal">
            Billing & Records
          </span>
          <h1 className="text-2xl font-black text-[#5A1724] font-royal">
            Order History & Logs
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93786F]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, table, item..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FFFDF9] border border-[#EADBCA] rounded-xl text-[#241A18] placeholder-[#93786F] focus:outline-none focus:border-[#C99A3D]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter('completed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            statusFilter === 'completed'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-[#FFFDF9] text-[#735A53] border border-[#EADBCA] hover:bg-[#F3E7D5]'
          }`}
        >
          <CheckCircle2 size={14} />
          <span>Completed Orders</span>
        </button>

        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
            statusFilter === 'cancelled'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'bg-[#FFFDF9] text-[#735A53] border border-[#EADBCA] hover:bg-[#F3E7D5]'
          }`}
        >
          <XCircle size={14} />
          <span>Cancelled Orders</span>
        </button>

        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            statusFilter === 'all'
              ? 'bg-[#5A1724] text-[#FFF8ED] shadow-2xs'
              : 'bg-[#FFFDF9] text-[#735A53] border border-[#EADBCA] hover:bg-[#F3E7D5]'
          }`}
        >
          All Archive
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-[#5A1724] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#735A53]">Loading archives...</p>
          </div>
        ) : historicalOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag size={32} className="mx-auto text-[#93786F] mb-2" />
            <p className="text-sm font-bold text-[#5A1724] font-royal">No historical orders found</p>
            <p className="text-xs text-[#735A53] mt-1">Completed table orders will be archived here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#241A18]">
              <thead className="bg-[#FDF9F3] border-b border-[#F0E4D3] text-[11px] font-bold text-[#735A53] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Table</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Items Summary</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E4D3]">
                {historicalOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFF8ED]/50 transition-colors">
                    <td className="py-3.5 px-4 font-black font-royal text-[#5A1724]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#241A18]">
                      {order.tableName}
                    </td>
                    <td className="py-3.5 px-4 text-[#735A53]">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-[#735A53] max-w-xs truncate">
                      {order.items?.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-black font-royal text-[#5A1724]">
                      ₹{order.totalAmount}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 size={11} />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <XCircle size={11} />
                          Cancelled
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg bg-[#FFF8ED] hover:bg-[#5A1724] hover:text-[#FFF8ED] text-[#5A1724] border border-[#EADBCA] transition-colors"
                        title="View Full Bill Snapshot"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Order Snapshot Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order Snapshot: ${selectedOrder.orderNumber}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0E4D3]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#93786F] block">Dining Table</span>
                <span className="text-base font-bold text-[#5A1724] font-royal">{selectedOrder.tableName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#93786F] block">Placed At</span>
                <span className="text-xs text-[#735A53]">{formatDate(selectedOrder.createdAt)}</span>
              </div>
            </div>

            {/* Preserved snapshot items */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#735A53] block">
                Line Items (Historical Snapshot)
              </span>
              <div className="divide-y divide-[#F0E4D3] border border-[#EADBCA] rounded-xl p-3 bg-white">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-start text-xs">
                    <div>
                      <span className="font-semibold text-[#241A18]">
                        {item.quantity} × {item.productName}
                      </span>
                      <span className="block text-[11px] text-[#93786F]">
                        @ ₹{item.price} each
                      </span>
                      {item.notes && (
                        <span className="block text-[11px] text-[#735A53] italic">
                          "{item.notes}"
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-[#5A1724]">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.customerNotes && (
              <div className="p-3 rounded-xl bg-[#FFF8ED] border border-[#EADBCA] text-xs text-[#735A53]">
                <strong className="text-[#5A1724] block">Customer Special Instructions:</strong>
                {selectedOrder.customerNotes}
              </div>
            )}

            <div className="pt-3 border-t border-[#F0E4D3] flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#735A53]">Total Bill Amount</span>
              <span className="text-xl font-black text-[#5A1724] font-royal">
                ₹{selectedOrder.totalAmount}
              </span>
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-[#93786F]">
                Product prices and item details are permanently preserved from order time.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
