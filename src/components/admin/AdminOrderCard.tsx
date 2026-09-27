import React, { useState } from 'react';
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  AlertTriangle,
  MessageSquareText,
  Sparkles,
  Coffee
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';

interface AdminOrderCardProps {
  order: Order;
}

export const AdminOrderCard: React.FC<AdminOrderCardProps> = ({ order }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Format order created time (e.g. 5m ago, or 12:30 PM)
  const formatTime = (ts: any) => {
    if (!ts) return 'Just now';
    try {
      const date = ts?.toDate ? ts.toDate() : new Date(ts);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      setShowCancelConfirm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${order.id}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Pending Order
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
            <ChefHat size={13} className="text-blue-700" />
            Preparing
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse">
            <Coffee size={13} className="text-emerald-700" />
            Ready to Serve
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            <XCircle size={12} />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-[#FFFDF9] border rounded-3xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
        order.status === 'pending'
          ? 'border-[#C99A3D] ring-2 ring-[#C99A3D]/20'
          : order.status === 'preparing'
          ? 'border-blue-300'
          : order.status === 'ready'
          ? 'border-emerald-400 bg-emerald-50/10'
          : 'border-[#EADBCA]'
      }`}
    >
      <div>
        {/* Top Card Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#F0E4D3]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-[#5A1724] font-royal tracking-wide">
                {order.orderNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#5A1724] text-[#FFF8ED] text-xs font-bold font-royal">
                {order.tableName}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#93786F] mt-1">
              <Clock size={12} />
              <span>{formatTime(order.createdAt)}</span>
            </div>
          </div>

          <div>{getStatusBadge(order.status)}</div>
        </div>

        {/* Ordered Items List */}
        <div className="py-3.5 space-y-2.5">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-[#FFF8ED] border border-[#EADBCA] font-bold text-[#5A1724] flex items-center justify-center shrink-0">
                  {item.quantity}
                </span>
                <div>
                  <span className="font-bold text-[#241A18] text-[13px]">{item.productName}</span>
                  {item.notes && (
                    <span className="block text-[11px] text-[#93786F] italic">
                      Note: {item.notes}
                    </span>
                  )}
                </div>
              </div>
              <span className="font-semibold text-[#5A1724]">₹{item.subtotal}</span>
            </div>
          ))}
        </div>

        {/* Customer Cooking Notes if any */}
        {order.customerNotes && (
          <div className="mt-1 mb-3 p-2.5 rounded-xl bg-[#FFF8ED] border border-[#C99A3D]/40 text-xs text-[#735A53] flex items-start gap-2">
            <MessageSquareText size={14} className="text-[#C99A3D] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#5A1724] block">Customer Special Instruction:</strong>
              {order.customerNotes}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Status Actions */}
      <div className="pt-3 border-t border-[#F0E4D3] mt-2">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-semibold text-[#735A53]">Total Bill</span>
          <span className="text-lg font-black text-[#5A1724] font-royal">
            ₹{order.totalAmount}
          </span>
        </div>

        {/* Action Button Workflow */}
        {order.status === 'pending' && (
          <div className="space-y-2">
            <button
              onClick={() => handleUpdateStatus('preparing')}
              disabled={isUpdating}
              className="w-full py-2.5 px-4 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <ChefHat size={16} className="text-[#C99A3D]" />
              <span>Start Preparing</span>
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-1 text-[11px] text-rose-700 hover:underline font-semibold"
            >
              Cancel Order
            </button>
          </div>
        )}

        {order.status === 'preparing' && (
          <div className="space-y-2">
            <button
              onClick={() => handleUpdateStatus('ready')}
              disabled={isUpdating}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Coffee size={16} />
              <span>Mark Ready to Serve</span>
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-1 text-[11px] text-rose-700 hover:underline font-semibold"
            >
              Cancel Order
            </button>
          </div>
        )}

        {order.status === 'ready' && (
          <button
            onClick={() => handleUpdateStatus('completed')}
            disabled={isUpdating}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <CheckCircle2 size={16} />
            <span>Complete Order (Served & Paid)</span>
          </button>
        )}

        {/* Cancellation Confirmation Box */}
        {showCancelConfirm && (
          <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-fadeIn">
            <p className="text-xs text-rose-800 font-semibold flex items-center gap-1.5">
              <AlertTriangle size={14} />
              <span>Are you sure you want to cancel {order.orderNumber}?</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateStatus('cancelled')}
                disabled={isUpdating}
                className="flex-1 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-semibold"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
