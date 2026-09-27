import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Grid3X3, 
  QrCode, 
  Settings, 
  LogOut, 
  Sparkles, 
  Bell, 
  Menu as MenuIcon, 
  X, 
  Volume2, 
  VolumeX,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { playOrderNotificationSound } from '../../utils/sound';
import { requestFCMToken, triggerLocalPushNotification } from '../../utils/fcm';
import { NotificationPrompt } from '../common/NotificationPrompt';

interface AdminLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  setCurrentTab,
  children,
}) => {
  const { user, adminData, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto register admin device FCM token when admin is authenticated
  useEffect(() => {
    if (user?.uid) {
      requestFCMToken('admin', { userId: user.uid });
    }
  }, [user?.uid]);

  // Listen to live pending orders for global badge counter and real-time push notification
  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['pending', 'preparing', 'ready'])
    );

    let initialLoad = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeDocs = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      const pendingOrders = activeDocs.filter((o) => o.status === 'pending');
      
      if (!initialLoad && pendingOrders.length > pendingCount) {
        const latestOrder = pendingOrders[0];
        if (soundEnabled) {
          playOrderNotificationSound();
        }

        // Trigger system & in-app push notification for admin
        triggerLocalPushNotification({
          title: `🔔 New Order: ${latestOrder?.orderNumber || '#Order'}`,
          body: `${latestOrder?.tableName || 'Table'}: ${latestOrder?.items?.length || 1} items (₹${latestOrder?.totalAmount || 0})`,
          orderId: latestOrder?.id,
          type: 'new_order',
          url: '/admin',
        });
      }

      initialLoad = false;
      setPendingCount(pendingOrders.length);
    });

    return () => unsubscribe();
  }, [pendingCount, soundEnabled]);

  const navItems = [
    { id: 'dashboard', label: 'Active Orders', icon: LayoutDashboard, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'orders', label: 'Order History', icon: ShoppingBag },
    { id: 'products', label: 'Menu Products', icon: UtensilsCrossed },
    { id: 'categories', label: 'Categories', icon: Grid3X3 },
    { id: 'tables', label: 'Tables & QRs', icon: QrCode },
    { id: 'settings', label: 'Cafe Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex flex-col md:flex-row text-[#241A18]">
      {/* Mobile Top App Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-[#FFFDF9] border-b border-[#EADBCA] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5A1724] text-[#C99A3D] flex items-center justify-center font-royal font-bold shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <h1 className="text-sm font-black text-[#5A1724] font-royal tracking-wider">
              RICH 'N' ROYAL
            </h1>
            <span className="text-[10px] text-[#735A53] block">Admin Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border text-xs ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
            title={soundEnabled ? 'Order sound active' : 'Sound muted'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#5A1724] hover:bg-[#F3E7D5] rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar & Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#FFFDF9] border-r border-[#EADBCA] flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-5">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-[#F0E4D3]">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5A1724] to-[#3B0E17] text-[#C99A3D] flex items-center justify-center shadow-md border border-[#C99A3D]/40">
              <Sparkles size={22} className="text-[#C99A3D]" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#5A1724] font-royal tracking-wider leading-tight">
                RICH 'N' ROYAL
              </h2>
              <span className="text-[11px] font-bold text-[#C99A3D] uppercase tracking-widest">
                CAFE ADMIN
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="mt-5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#5A1724] text-[#FFF8ED] shadow-sm'
                      : 'text-[#735A53] hover:bg-[#F3E7D5] hover:text-[#5A1724]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-[#C99A3D]' : 'text-[#93786F]'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#C99A3D] text-[#241A18] animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Customer Menu Preview Link */}
          <div className="mt-6 pt-5 border-t border-[#F0E4D3]">
            <a
              href="/menu?table=T01"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FFF8ED] hover:bg-[#F3E7D5] text-[#5A1724] text-xs font-semibold border border-[#EADBCA] transition-colors"
            >
              <span className="flex items-center gap-2">
                <QrCode size={15} className="text-[#C99A3D]" />
                <span>Test QR Menu (T01)</span>
              </span>
              <ExternalLink size={13} className="text-[#93786F]" />
            </a>
          </div>
        </div>

        {/* User Info & Sign Out Footer */}
        <div className="p-4 border-t border-[#F0E4D3] bg-[#FDF9F3]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="truncate">
              <span className="text-[10px] text-[#93786F] uppercase tracking-wider block">Logged in as</span>
              <span className="text-xs font-bold text-[#241A18] truncate block" title={user?.email || ''}>
                {user?.email || 'Admin'}
              </span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
              {adminData?.role || 'Admin'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-[#EADBCA] text-xs text-[#735A53] hover:bg-[#FFF8ED] transition-colors"
              title="Order sound notification"
            >
              {soundEnabled ? <Volume2 size={15} className="text-emerald-600" /> : <VolumeX size={15} />}
              <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-[#FFFDF9] hover:bg-rose-50 text-rose-700 border border-[#EADBCA] hover:border-rose-200 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Real-time Notification Banner if not yet allowed */}
        <NotificationPrompt role="admin" meta={{ userId: user?.uid }} />
        {children}
      </main>
    </div>
  );
};
