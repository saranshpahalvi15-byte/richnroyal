import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles, CheckCircle2, ChefHat, Coffee, ShoppingBag, ArrowRight } from 'lucide-react';
import { NotificationPayload } from '../../utils/fcm';

export const PushNotificationToast: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<NotificationPayload | null>(null);

  useEffect(() => {
    const handlePushEvent = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationPayload>;
      if (customEvent.detail) {
        setActiveNotification(customEvent.detail);
        // Auto-dismiss after 6 seconds
        const timer = setTimeout(() => {
          setActiveNotification(null);
        }, 6000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('rich_n_royal_push_event', handlePushEvent);
    return () => window.removeEventListener('rich_n_royal_push_event', handlePushEvent);
  }, []);

  if (!activeNotification) return null;

  const getIcon = () => {
    switch (activeNotification.type) {
      case 'new_order':
        return <ShoppingBag size={20} className="text-[#C99A3D]" />;
      case 'status_change':
        return <ChefHat size={20} className="text-[#C99A3D]" />;
      default:
        return <Bell size={20} className="text-[#C99A3D]" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-slideDown">
      <div className="bg-[#FFFDF9] border-2 border-[#C99A3D] rounded-2xl p-4 shadow-2xl flex items-start gap-3 relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5A1724] via-[#C99A3D] to-[#5A1724]" />

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#5A1724] text-[#C99A3D] flex items-center justify-center shrink-0 shadow-md">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C99A3D] bg-[#5A1724] px-2 py-0.2 rounded">
              Push Notification
            </span>
          </div>
          <h4 className="text-sm font-bold text-[#5A1724] font-royal leading-tight truncate">
            {activeNotification.title}
          </h4>
          <p className="text-xs text-[#241A18] mt-1 leading-snug">
            {activeNotification.body}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setActiveNotification(null)}
          className="text-[#93786F] hover:text-[#5A1724] p-1 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
