import React from 'react';
import { ShoppingBag, Search, MapPin, Sparkles, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CafeSettings } from '../../types';

interface MenuHeaderProps {
  cafeSettings: CafeSettings | null;
  tableNumber: string;
  tableName: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCart: () => void;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  cafeSettings,
  tableName,
  searchQuery,
  setSearchQuery,
  onOpenCart,
}) => {
  const { itemCount, totalAmount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EEDBCA] shadow-xs">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Cafe Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5A1724] to-[#3B0E17] text-[#C99A3D] flex items-center justify-center shadow-md border border-[#C99A3D]/40 shrink-0">
              <Sparkles size={20} className="text-[#C99A3D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-[#5A1724] font-royal tracking-wider leading-none">
                  RICH 'N' ROYAL
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C99A3D] border border-[#C99A3D]/30 px-1.5 py-0.5 rounded-sm bg-[#FFF8ED]">
                  CAFE
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#735A53] mt-0.5">
                <MapPin size={11} className="text-[#C99A3D]" />
                <span className="truncate max-w-[170px]">Sector 8, Ambala</span>
              </div>
            </div>
          </div>

          {/* Table Badge & Cart Action */}
          <div className="flex items-center gap-2">
            {/* Table Badge */}
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase tracking-wider text-[#93786F] font-medium">Ordering at</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#5A1724] text-[#FFF8ED] text-xs font-bold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C99A3D] animate-pulse" />
                {tableName}
              </span>
            </div>

            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-9 h-9 rounded-full bg-[#F3E7D5]/70 hover:bg-[#EADBCA] text-[#5A1724] flex items-center justify-center transition-colors"
              aria-label="Search menu"
            >
              {isSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative w-9 h-9 rounded-full bg-[#5A1724] text-[#FFF8ED] hover:bg-[#46111B] flex items-center justify-center transition-transform active:scale-95 shadow-sm"
              aria-label="Open Cart"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C99A3D] text-[#241A18] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-[#FFF8ED] animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <div className="mt-2.5 pt-2 border-t border-[#F0E4D3] animate-fadeIn">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93786F]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pizzas, pasta, shakes, maggi..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] placeholder-[#93786F] focus:outline-none focus:border-[#C99A3D] focus:ring-2 focus:ring-[#C99A3D]/20 shadow-inner"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93786F] hover:text-[#5A1724]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
