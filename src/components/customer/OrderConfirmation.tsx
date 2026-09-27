import React, { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus } from '../../types';
import { CheckCircle2, Clock, ChefHat, Sparkles, ArrowLeft, Coffee, MapPin, Phone } from 'lucide-react';
import { triggerLocalPushNotification } from '../../utils/fcm';
import { NotificationPrompt } from '../common/NotificationPrompt';

interface OrderConfirmationProps {
  initialOrder: Order;
  onBackToMenu: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  initialOrder,
  onBackToMenu,
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const prevStatusRef = useRef<OrderStatus>(initialOrder.status);

  // Listen for live status changes on this specific order
  useEffect(() => {
    if (!initialOrder?.id) return;

    const unsubscribe = onSnapshot(doc(db, 'orders', initialOrder.id), (docSnap) => {
      if (docSnap.exists()) {
        const updated = {
          id: docSnap.id,
          ...(docSnap.data() as any),
        } as Order;

        // Check if status changed
        if (prevStatusRef.current !== updated.status) {
          if (updated.status === 'preparing') {
            triggerLocalPushNotification({
              title: `👨‍🍳 Order ${updated.orderNumber} is Preparing!`,
              body: `The chef is now cooking your fresh dishes for ${updated.tableName}.`,
              orderId: updated.id,
              type: 'status_change',
            });
          } else if (updated.status === 'ready') {
            triggerLocalPushNotification({
              title: `🎉 Order ${updated.orderNumber} is Ready to Serve!`,
              body: `Your delicious meal is ready and being served to ${updated.tableName}. Enjoy!`,
              orderId: updated.id,
              type: 'status_change',
            });
          } else if (updated.status === 'completed') {
            triggerLocalPushNotification({
              title: `✨ Order Completed!`,
              body: `Thank you for dining with us at Rich 'N' Royal Cafe (${updated.tableName}).`,
              orderId: updated.id,
              type: 'status_change',
            });
          }
          prevStatusRef.current = updated.status;
        }

        setOrder(updated);
      }
    });

    return () => unsubscribe();
  }, [initialOrder?.id]);

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'preparing':
        return 2;
      case 'ready':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const step = getStatusStep(order.status);

  return (
    <div className="min-h-screen bg-[#FFF8ED] py-8 px-4 flex flex-col justify-between max-w-xl mx-auto">
      <div className="space-y-6">
        {/* Real-time push permission prompt for customer */}
        <NotificationPrompt
          role="customer"
          meta={{ tableId: order.tableId, orderId: order.id }}
        />

        {/* Success Header Card */}
        <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-6 shadow-md text-center relative overflow-hidden">
          {/* Top Royal Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5A1724] via-[#C99A3D] to-[#5A1724]" />

          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-sm animate-bounce">
            <CheckCircle2 size={36} />
          </div>

          <span className="text-xs uppercase tracking-widest text-[#C99A3D] font-bold">
            Rich 'N' Royal Kitchen
          </span>
          <h1 className="text-2xl font-black text-[#5A1724] font-royal mt-1">
            Order Placed Successfully!
          </h1>
          <p className="text-xs text-[#735A53] mt-1.5 max-w-sm mx-auto">
            Your items have been received by the cafe staff and are being sent to the kitchen.
          </p>

          {/* Key Order Badges */}
          <div className="mt-5 grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="bg-[#FFF8ED] border border-[#EADBCA] p-2.5 rounded-2xl">
              <span className="text-[10px] text-[#93786F] uppercase tracking-wider block">Order ID</span>
              <span className="text-base font-black text-[#5A1724] font-royal">
                {order.orderNumber}
              </span>
            </div>
            <div className="bg-[#FFF8ED] border border-[#EADBCA] p-2.5 rounded-2xl">
              <span className="text-[10px] text-[#93786F] uppercase tracking-wider block">Table</span>
              <span className="text-base font-black text-[#5A1724] font-royal">
                {order.tableName}
              </span>
            </div>
          </div>
        </div>

        {/* Live Status Tracker Card */}
        <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-6 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#735A53] mb-4 flex items-center gap-1.5">
            <Clock size={14} className="text-[#C99A3D]" />
            <span>Live Order Status Tracker</span>
          </h3>

          {order.status === 'cancelled' ? (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-center text-rose-800 text-sm font-semibold">
              This order was cancelled. Please check with cafe staff.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between relative">
                {/* Connecting background bar */}
                <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-[#EADBCA] -z-0" />
                <div
                  className="absolute top-1/2 left-4 -translate-y-1/2 h-1 bg-[#5A1724] transition-all duration-500 -z-0"
                  style={{
                    width:
                      step === 1
                        ? '0%'
                        : step === 2
                        ? '50%'
                        : '100%',
                  }}
                />

                {/* Step 1: Received */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      step >= 1
                        ? 'bg-[#5A1724] text-[#C99A3D] shadow-md border-2 border-[#C99A3D]'
                        : 'bg-[#F3E7D5] text-[#93786F]'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-[#241A18] mt-1.5">Received</span>
                </div>

                {/* Step 2: Preparing */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      step >= 2
                        ? 'bg-[#5A1724] text-[#C99A3D] shadow-md border-2 border-[#C99A3D]'
                        : 'bg-[#F3E7D5] text-[#93786F]'
                    }`}
                  >
                    <ChefHat size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-[#241A18] mt-1.5">Preparing</span>
                </div>

                {/* Step 3: Ready to Serve */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                      step >= 3
                        ? 'bg-emerald-600 text-white shadow-md border-2 border-emerald-400 animate-pulse'
                        : 'bg-[#F3E7D5] text-[#93786F]'
                    }`}
                  >
                    <Coffee size={16} />
                  </div>
                  <span className="text-[10px] font-bold text-[#241A18] mt-1.5">Ready / Served</span>
                </div>
              </div>

              {/* Status text callout */}
              <div className="bg-[#FFF8ED] border border-[#EADBCA] p-3 rounded-2xl text-center">
                {step === 1 && (
                  <p className="text-xs text-[#735A53]">
                    <strong className="text-[#5A1724]">Kitchen Queue:</strong> Chef will begin preparing your fresh food shortly.
                  </p>
                )}
                {step === 2 && (
                  <p className="text-xs text-[#735A53]">
                    <strong className="text-[#5A1724]">Currently Sizzling:</strong> Your delicious meal is cooking right now!
                  </p>
                )}
                {step >= 3 && (
                  <p className="text-xs text-emerald-800 font-semibold">
                    🎉 Your order is ready! A server is bringing your dishes to {order.tableName}.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Items Breakdown Card */}
        <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-6 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#735A53] mb-3">
            Ordered Items
          </h3>
          <div className="divide-y divide-[#F0E4D3] space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="pt-2 first:pt-0 flex justify-between items-start text-xs">
                <div>
                  <span className="font-semibold text-[#241A18]">
                    {item.quantity} × {item.productName}
                  </span>
                  {item.notes && (
                    <span className="block text-[11px] text-[#93786F] italic">
                      Note: {item.notes}
                    </span>
                  )}
                </div>
                <span className="font-bold text-[#5A1724]">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#EADBCA] flex justify-between items-baseline">
            <span className="text-xs font-bold text-[#735A53]">Total Payable</span>
            <span className="text-lg font-black text-[#5A1724] font-royal">
              ₹{order.totalAmount}
            </span>
          </div>

          {order.customerNotes && (
            <div className="mt-3 p-2.5 rounded-xl bg-[#FFF8ED] border border-[#EADBCA] text-xs text-[#735A53]">
              <strong className="text-[#5A1724]">Special Note:</strong> {order.customerNotes}
            </div>
          )}
        </div>

        {/* Cafe Direct Payment Notice */}
        <div className="bg-[#5A1724] text-[#FFF8ED] rounded-2xl p-4 shadow-md flex items-center gap-3">
          <Sparkles size={24} className="text-[#C99A3D] shrink-0" />
          <div className="text-xs leading-relaxed">
            <strong className="text-[#C99A3D] block text-sm font-royal">
              Payment at Table / Counter
            </strong>
            No online payment needed on this device. Payment will be handled directly at the cafe through Cash or UPI scanner when bill is presented.
          </div>
        </div>
      </div>

      {/* Back to Menu Action */}
      <div className="mt-8 pt-4">
        <button
          onClick={onBackToMenu}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#FFFDF9] hover:bg-[#F3E7D5] text-[#5A1724] font-bold text-xs uppercase tracking-wider border-2 border-[#5A1724] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <ArrowLeft size={16} />
          <span>Back to Menu / Order More Items</span>
        </button>
      </div>
    </div>
  );
};
