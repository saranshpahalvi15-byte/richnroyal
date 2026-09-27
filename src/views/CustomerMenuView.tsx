import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category, Table, CafeSettings } from '../types';
import { useCart } from '../context/CartContext';
import { MenuHeader } from '../components/customer/MenuHeader';
import { CategoryList } from '../components/customer/CategoryList';
import { ProductCard } from '../components/customer/ProductCard';
import { CartDrawer } from '../components/customer/CartDrawer';
import { OrderConfirmation } from '../components/customer/OrderConfirmation';
import { InvalidTable } from '../components/customer/InvalidTable';
import { NotificationPrompt } from '../components/common/NotificationPrompt';
import { subscribeToProducts, subscribeToCategories } from '../services/productService';
import { DEFAULT_CAFE_SETTINGS, DEFAULT_TABLES } from '../data/defaultData';
import { ShoppingBag, Sparkles, Filter, Leaf, Utensils, Clock, MapPin, Phone } from 'lucide-react';

export const CustomerMenuView: React.FC = () => {
  const { 
    setTable, 
    tableName: contextTableName, 
    lastPlacedOrder, 
    resetLastOrder,
    itemCount, 
    totalAmount 
  } = useCart();

  const [tableParam, setTableParam] = useState<string>('');
  const [table, setTableState] = useState<Table | null>(null);
  const [tableStatus, setTableStatus] = useState<'loading' | 'valid' | 'inactive' | 'not_found'>('loading');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cafeSettings, setCafeSettings] = useState<CafeSettings | null>(DEFAULT_CAFE_SETTINGS);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isOrderConfirmed, setIsOrderConfirmed] = useState<boolean>(false);

  // 1. Parse Table from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tableQuery = urlParams.get('table') || '';
    setTableParam(tableQuery);

    if (!tableQuery) {
      setTableStatus('not_found');
      return;
    }

    // Verify Table in Firestore
    const verifyTable = async () => {
      try {
        const cleanTableQuery = tableQuery.toUpperCase().replace(/^T/, '');
        const tablesSnap = await getDocs(collection(db, 'tables'));

        if (tablesSnap.empty) {
          // If Firestore is completely fresh, fallback to default seed table match for seamless experience
          const defaultMatch = DEFAULT_TABLES.find(
            (t) => t.tableNumber === cleanTableQuery || t.tableNumber === tableQuery
          );
          if (defaultMatch) {
            const fallbackTable: Table = {
              id: `T${defaultMatch.tableNumber}`,
              ...defaultMatch,
            };
            setTableState(fallbackTable);
            setTable(fallbackTable.id, fallbackTable.tableName);
            setTableStatus(fallbackTable.active ? 'valid' : 'inactive');
            return;
          }
        }

        let matchedTable: Table | null = null;
        tablesSnap.forEach((docSnap) => {
          const data = docSnap.data() as Omit<Table, 'id'>;
          const docId = docSnap.id.toUpperCase();
          const tNum = data.tableNumber?.toUpperCase() || '';
          
          if (
            docId === tableQuery.toUpperCase() ||
            docId === `T${cleanTableQuery}` ||
            tNum === cleanTableQuery ||
            tNum === tableQuery.toUpperCase()
          ) {
            matchedTable = { id: docSnap.id, ...data };
          }
        });

        if (matchedTable) {
          const t: Table = matchedTable;
          setTableState(t);
          setTable(t.id, t.tableName);
          setTableStatus(t.active ? 'valid' : 'inactive');
        } else {
          setTableStatus('not_found');
        }
      } catch (err) {
        console.warn('Table lookup error, checking fallback:', err);
        const defaultMatch = DEFAULT_TABLES.find(
          (t) => t.tableNumber === tableQuery.replace(/^T/, '')
        );
        if (defaultMatch) {
          const fallbackTable: Table = { id: `T${defaultMatch.tableNumber}`, ...defaultMatch };
          setTableState(fallbackTable);
          setTable(fallbackTable.id, fallbackTable.tableName);
          setTableStatus('valid');
        } else {
          setTableStatus('not_found');
        }
      }
    };

    verifyTable();
  }, [setTable]);

  // 2. Real-time Listeners for Categories, Products & Cafe Settings
  useEffect(() => {
    // Categories listener via Product Service
    const unsubCats = subscribeToCategories((cats) => {
      setCategories(cats);
    });

    // Products listener via Product Service
    const unsubProds = subscribeToProducts({}, (prods) => {
      setProducts(prods);
    });

    // Cafe Settings listener
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'cafe'),
      (snap) => {
        if (snap.exists()) {
          setCafeSettings(snap.data() as CafeSettings);
        }
      },
      () => {}
    );

    return () => {
      unsubCats();
      unsubProds();
      unsubSettings();
    };
  }, []);

  // Handle Demo Table selection from invalid screen
  const handleSelectDemoTable = (tId: string) => {
    window.location.search = `?table=${tId}`;
  };

  // If table invalid or inactive
  if (tableStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#FFF8ED] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#5A1724] text-[#C99A3D] flex items-center justify-center shadow-lg border border-[#C99A3D]/30 animate-spin">
          <Sparkles size={24} />
        </div>
        <p className="mt-4 text-xs font-bold text-[#5A1724] font-royal uppercase tracking-wider">
          Connecting to Table...
        </p>
      </div>
    );
  }

  if (tableStatus === 'not_found' || tableStatus === 'inactive') {
    return (
      <InvalidTable
        reason={tableStatus === 'inactive' ? 'inactive' : 'not_found'}
        tableParam={tableParam}
        onSelectDemoTable={handleSelectDemoTable}
      />
    );
  }

  // If customer placed an order, show full confirmation view
  if (lastPlacedOrder || isOrderConfirmed) {
    return (
      <OrderConfirmation
        initialOrder={lastPlacedOrder!}
        onBackToMenu={() => {
          resetLastOrder();
          setIsOrderConfirmed(false);
        }}
      />
    );
  }

  // Filter products by Category, Search, Veg filter
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !vegOnly || p.isVeg !== false;

    return matchesCategory && matchesSearch && matchesVeg;
  });

  // Calculate item counts per category
  const productCountMap: Record<string, number> = {};
  products.forEach((p) => {
    productCountMap[p.categoryId] = (productCountMap[p.categoryId] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-[#FFF8ED] pb-28 text-[#241A18]">
      {/* Sticky Mobile Header */}
      <MenuHeader
        cafeSettings={cafeSettings}
        tableNumber={table?.tableNumber || '01'}
        tableName={table?.tableName || 'Table 01'}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Royal Hero Welcome Banner */}
      <div className="max-w-2xl mx-auto px-4 pt-3 pb-1">
        <NotificationPrompt role="customer" meta={{ tableId: table?.id }} />

        <div className="bg-gradient-to-r from-[#5A1724] via-[#46111B] to-[#360D15] rounded-3xl p-4 text-[#FFF8ED] shadow-md border border-[#C99A3D]/30 relative overflow-hidden flex items-center justify-between">
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-[#C99A3D] uppercase tracking-widest block">
              Welcome to
            </span>
            <h2 className="text-xl font-black font-royal tracking-wider text-white">
              RICH 'N' ROYAL CAFE
            </h2>
            <p className="text-xs text-[#FFF8ED]/80 mt-0.5 max-w-xs">
              Freshly crafted delights • Delivered directly to {table?.tableName}
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-[#FFF8ED]/10 border border-[#C99A3D]/40 text-[#C99A3D] flex items-center justify-center shrink-0">
            <Utensils size={26} />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <CategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        productCountMap={productCountMap}
      />

      {/* Sub-Filters: Pure Veg Toggle & Active Selection Header */}
      <div className="max-w-2xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        <div className="text-xs font-bold text-[#735A53]">
          {selectedCategory === 'all'
            ? 'All Specialities'
            : categories.find((c) => c.id === selectedCategory)?.name || 'Menu Items'}
          <span className="text-[#93786F] font-normal ml-1">
            ({filteredProducts.length})
          </span>
        </div>

        {/* Pure Veg Quick Filter Toggle */}
        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
            vegOnly
              ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-xs'
              : 'bg-[#FFFDF9] text-[#735A53] border-[#EADBCA] hover:bg-[#F3E7D5]'
          }`}
        >
          <div className="w-3 h-3 border border-emerald-600 p-0.5 rounded-xs flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
          </div>
          <span>Pure Veg</span>
        </button>
      </div>

      {/* Product List */}
      <div className="max-w-2xl mx-auto px-4 space-y-3.5 mt-1">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-[#FFFDF9] rounded-3xl border border-[#EADBCA] p-6 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#F3E7D5] text-[#93786F] flex items-center justify-center mx-auto mb-2">
              <Utensils size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#241A18] font-royal">
              No matching delicacies found
            </h3>
            <p className="text-xs text-[#735A53] mt-1">
              Try searching for another dish or reset your active filters.
            </p>
            {(searchQuery || vegOnly || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setVegOnly(false);
                  setSelectedCategory('all');
                }}
                className="mt-3 px-4 py-1.5 rounded-xl bg-[#5A1724] text-[#FFF8ED] text-xs font-bold"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      {/* Sticky Bottom Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-gradient-to-t from-[#FFF8ED] via-[#FFF8ED]/95 to-transparent backdrop-blur-xs">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#5A1724] to-[#46111B] text-[#FFF8ED] shadow-xl hover:shadow-2xl active:scale-[0.99] transition-all flex items-center justify-between border border-[#C99A3D]/40"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#C99A3D] text-[#241A18] font-black text-xs flex items-center justify-center shadow-xs">
                  {itemCount}
                </div>
                <div className="text-left">
                  <span className="text-[11px] text-[#FFF8ED]/80 uppercase tracking-wider block leading-tight">
                    Subtotal
                  </span>
                  <span className="text-base font-black font-royal text-white leading-none">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider font-royal text-[#C99A3D]">
                <span>View Cart & Order</span>
                <ShoppingBag size={16} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={() => {
          setIsCartOpen(false);
          setIsOrderConfirmed(true);
        }}
      />
    </div>
  );
};
