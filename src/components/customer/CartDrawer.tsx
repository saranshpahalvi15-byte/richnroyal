import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, MessageSquareText, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    tableId,
    tableName,
    customerNotes,
    itemCount,
    totalAmount,
    isPlacingOrder,
    orderError,
    updateQuantity,
    removeFromCart,
    setCustomerNotes,
    clearCart,
    placeOrder,
  } = useCart();

  const [showNotesInput, setShowNotesInput] = useState(false);

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    const order = await placeOrder();
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5A1724', '#C99A3D', '#F3E7D5'],
        });
      } catch (e) {}
      onOrderSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-lg bg-[#FFFDF9] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EADBCA] overflow-hidden flex flex-col max-h-[92vh] z-10 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E4D3] bg-[#FDF9F3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#5A1724] text-[#C99A3D] flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#5A1724] font-royal tracking-wide">
                Your Order
              </h2>
              <span className="text-xs text-[#735A53]">
                Ordering to <strong className="text-[#5A1724]">{tableName || 'Selected Table'}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#735A53] hover:text-[#5A1724] hover:bg-[#F3E7D5] rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F3E7D5] text-[#93786F] flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={28} />
              </div>
              <h3 className="text-base font-bold text-[#241A18] font-royal">Your cart is empty</h3>
              <p className="text-xs text-[#735A53] mt-1 max-w-xs mx-auto">
                Explore our royal menu and add your favorite dishes to place an order.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2 rounded-xl bg-[#5A1724] text-[#FFF8ED] text-xs font-bold hover:bg-[#46111B] transition-colors"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Item Rows */}
              <div className="divide-y divide-[#F0E4D3] border border-[#EADBCA] rounded-2xl bg-white p-3 shadow-2xs">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-3.5 h-3.5 border ${
                            item.product.isVeg !== false ? 'border-emerald-600' : 'border-rose-600'
                          } p-0.5 flex items-center justify-center rounded-xs shrink-0`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.product.isVeg !== false ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </div>
                        <h4 className="text-sm font-semibold text-[#241A18] line-clamp-1">
                          {item.product.name}
                        </h4>
                      </div>
                      <div className="text-xs text-[#735A53] mt-0.5 pl-5">
                        ₹{item.product.price} × {item.quantity} = <strong className="text-[#5A1724]">₹{item.product.price * item.quantity}</strong>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5 bg-[#FFF8ED] border border-[#EADBCA] rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#F3E7D5] text-[#5A1724] active:scale-90 transition-transform"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-xs font-bold text-[#5A1724] min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[#F3E7D5] text-[#5A1724] active:scale-90 transition-transform"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Instructions / Notes */}
              <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A1724]">
                    <MessageSquareText size={15} />
                    <span>Special Instructions for Kitchen</span>
                  </div>
                  {!showNotesInput && !customerNotes && (
                    <button
                      onClick={() => setShowNotesInput(true)}
                      className="text-xs font-semibold text-[#C99A3D] hover:underline"
                    >
                      + Add Note
                    </button>
                  )}
                </div>

                {(showNotesInput || customerNotes) && (
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g., Less spicy, extra cheese on pizza, make it crispy..."
                    className="w-full mt-1.5 p-2.5 text-xs bg-white border border-[#EADBCA] rounded-xl text-[#241A18] placeholder-[#93786F] focus:outline-none focus:border-[#C99A3D] focus:ring-1 focus:ring-[#C99A3D]"
                    rows={2}
                    maxLength={300}
                  />
                )}
              </div>

              {/* Bill Details */}
              <div className="bg-[#FDF9F3] border border-[#EADBCA] rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#735A53]">
                  Bill Breakdown
                </h4>
                <div className="flex justify-between text-xs text-[#735A53]">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-[#241A18]">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs text-[#735A53]">
                  <span>Taxes & Service</span>
                  <span className="font-medium text-emerald-700">Included</span>
                </div>
                <div className="pt-2 border-t border-[#EADBCA] flex justify-between items-baseline">
                  <span className="text-sm font-bold text-[#5A1724]">To Pay</span>
                  <span className="text-xl font-black text-[#5A1724] font-royal">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Cafe Payment Reminder Notice */}
              <div className="bg-[#FFF8ED] border border-[#C99A3D]/40 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles size={18} className="text-[#C99A3D] shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#735A53] leading-relaxed">
                  <strong className="text-[#5A1724] block">No Online Payment Needed</strong>
                  Your order will be sent straight to our kitchen. Payment will be handled directly at the cafe (Cash / UPI) when served or upon checkout.
                </div>
              </div>

              {orderError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Place Order Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-[#F0E4D3] bg-[#FFFDF9]">
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#5A1724] to-[#46111B] text-[#FFF8ED] font-bold text-sm tracking-wide shadow-lg hover:shadow-xl hover:from-[#46111B] hover:to-[#360D15] active:scale-[0.99] transition-all flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed border border-[#C99A3D]/30"
            >
              <div className="flex items-center gap-2">
                <span className="font-royal text-base text-[#C99A3D]">₹{totalAmount}</span>
                <span className="text-[11px] text-[#FFF8ED]/80">({itemCount} items)</span>
              </div>
              <div className="flex items-center gap-1.5 font-royal">
                {isPlacingOrder ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#C99A3D] border-t-transparent rounded-full animate-spin" />
                    <span>Sending to Kitchen...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRM & PLACE ORDER</span>
                    <ArrowRight size={16} className="text-[#C99A3D]" />
                  </>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
