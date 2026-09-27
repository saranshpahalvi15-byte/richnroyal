import React, { useState } from 'react';
import { useAuth, BOOTSTRAP_ADMIN_EMAILS } from '../context/AuthContext';
import { Sparkles, ShieldAlert, LogOut, ArrowRight, Lock, MapPin } from 'lucide-react';

interface AdminLoginViewProps {
  onLoginSuccess: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess }) => {
  const { user, isAdmin, loading, loginWithGoogle, logout, authError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    const success = await loginWithGoogle();
    setIsSigningIn(false);
    if (success) {
      onLoginSuccess();
    }
  };

  // Case 1: User is logged in but NOT authorized as admin
  if (user && !isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-[#FFF8ED] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FFFDF9] border-2 border-rose-300 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto shadow-2xs">
            <ShieldAlert size={32} />
          </div>

          <h2 className="text-2xl font-black text-rose-800 font-royal">
            Access Denied
          </h2>

          <p className="text-xs text-[#735A53] leading-relaxed">
            You are not authorized to access the cafe administration panel.
          </p>

          <div className="p-3 bg-[#FFF8ED] rounded-xl border border-[#EADBCA] text-xs text-[#735A53]">
            Signed in as: <strong className="text-[#241A18] block mt-0.5">{user.email}</strong>
          </div>

          <div className="pt-2">
            <button
              onClick={logout}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out & Try Another Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Standard Login Portal
  return (
    <div className="min-h-screen bg-[#FFF8ED] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
        {/* Royal Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#5A1724] via-[#C99A3D] to-[#5A1724]" />

        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5A1724] to-[#3B0E17] text-[#C99A3D] flex items-center justify-center mx-auto mb-4 shadow-md border border-[#C99A3D]/40">
          <Sparkles size={32} />
        </div>

        <span className="text-xs font-bold text-[#C99A3D] uppercase tracking-widest block font-royal">
          Administration Portal
        </span>
        <h1 className="text-2xl font-black text-[#5A1724] font-royal mt-1">
          RICH 'N' ROYAL CAFE
        </h1>
        <p className="text-xs text-[#735A53] mt-1.5 leading-relaxed">
          Kitchen live orders, dynamic menu items, table QR codes & revenue reports.
        </p>

        <div className="mt-8 space-y-4">
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 text-left">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn || loading}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-[#FDF9F3] text-[#241A18] border border-[#EADBCA] hover:border-[#C99A3D] text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-50"
          >
            {/* Google G Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="font-semibold text-sm">
              {isSigningIn ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>
        </div>

        {/* Location Footer Note */}
        <div className="mt-8 pt-5 border-t border-[#F0E4D3] text-[11px] text-[#93786F] flex items-center justify-center gap-1">
          <MapPin size={13} className="text-[#C99A3D]" />
          <span>Huda Ground, near HP Petrol Pump, Sector 8, Ambala</span>
        </div>
      </div>
    </div>
  );
};
