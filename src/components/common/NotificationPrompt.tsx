import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Sparkles, Check, X } from 'lucide-react';
import { requestFCMToken } from '../../utils/fcm';

interface NotificationPromptProps {
  role: 'admin' | 'customer';
  meta?: { userId?: string; tableId?: string; orderId?: string };
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ role, meta }) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  if (permissionState === 'granted' || dismissed || typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    const token = await requestFCMToken(role, meta);
    setIsRequesting(false);
    if (token) {
      setPermissionState('granted');
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#5A1724] to-[#46111B] border border-[#C99A3D]/40 text-[#FFF8ED] rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-3 animate-fadeIn my-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#C99A3D] text-[#241A18] flex items-center justify-center shrink-0">
          <BellRing size={16} />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white leading-tight">
            {role === 'admin'
              ? 'Enable Live Kitchen Push Notifications'
              : 'Enable Instant Order Status Alerts'}
          </h4>
          <p className="text-[11px] text-[#FFF8ED]/80 mt-0.5">
            {role === 'admin'
              ? 'Receive immediate alerts whenever a customer places an order.'
              : 'Get notified immediately when your table order is cooking & ready to serve.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleEnableNotifications}
          disabled={isRequesting}
          className="px-3 py-1.5 rounded-xl bg-[#C99A3D] hover:bg-[#d6a94e] text-[#241A18] text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          {isRequesting ? 'Enabling...' : 'Allow'}
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-[#FFF8ED]/60 hover:text-white"
          title="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
