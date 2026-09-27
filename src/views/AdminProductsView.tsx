import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon, 
  UtensilsCrossed, 
  Check, 
  X,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ProductModal } from '../components/admin/ProductModal';
import { Modal } from '../components/common/Modal';
import { ensureDefaultDataSeeded } from '../utils/seedHelper';
import { 
  subscribeToProducts, 
  subscribeToCategories, 
  saveProduct, 
  updateProductAvailability, 
  deleteProduct 
} from '../services/productService';

export const AdminProductsView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    // Listen to categories via Product Service
    const unsubCats = subscribeToCategories((cats) => {
      setCategories(cats);
    });

    // Listen to all products via Product Service
    const unsubProds = subscribeToProducts({}, (prods) => {
      setProducts(prods);
      setLoading(false);
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  const handleSaveProduct = async (productData: Partial<Product>) => {
    await saveProduct(productData, editingProduct?.id);
  };

  const handleToggleAvailability = async (product: Product) => {
    await updateProductAvailability(product.id, !product.available);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    await deleteProduct(productToDelete.id);
    setProductToDelete(null);
  };

  const handleRestoreAllItems = async () => {
    setIsSeeding(true);
    await ensureDefaultDataSeeded();
    setIsSeeding(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C99A3D] uppercase tracking-widest block font-royal">
            Menu Catalog
          </span>
          <h1 className="text-2xl font-black text-[#5A1724] font-royal">
            Food & Beverage Items ({products.length})
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {products.length === 0 && (
            <button
              onClick={handleRestoreAllItems}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-xl bg-[#FFF8ED] hover:bg-[#F3E7D5] text-[#5A1724] border border-[#EADBCA] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <RotateCcw size={14} className={isSeeding ? 'animate-spin' : ''} />
              <span>{isSeeding ? 'Populating...' : 'Load Full Cafe Menu'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Plus size={16} className="text-[#C99A3D]" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF9] p-3 rounded-2xl border border-[#EADBCA]">
        {/* Category Pill filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#5A1724] text-[#FFF8ED]'
                : 'text-[#735A53] hover:bg-[#F3E7D5]'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((c) => {
            const count = products.filter((p) => p.categoryId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === c.id
                    ? 'bg-[#5A1724] text-[#FFF8ED]'
                    : 'text-[#735A53] hover:bg-[#F3E7D5]'
                }`}
              >
                {c.icon && <span>{c.icon}</span>}
                <span>{c.name}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === c.id ? 'bg-[#C99A3D] text-[#241A18]' : 'bg-[#F3E7D5]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#93786F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish name..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-[#5A1724] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#735A53]">Loading menu catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-[#FFFDF9] rounded-3xl border border-[#EADBCA] p-8 shadow-2xs">
          <UtensilsCrossed size={32} className="mx-auto text-[#93786F] mb-2" />
          <h3 className="text-sm font-bold text-[#5A1724] font-royal">No products found</h3>
          <p className="text-xs text-[#735A53] mt-1">
            {products.length === 0
              ? 'Get started by creating your first cafe dish or beverage.'
              : 'Try matching another category or search keyword.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {products.length === 0 && (
              <button
                onClick={handleRestoreAllItems}
                className="px-4 py-2 rounded-xl bg-[#FFF8ED] text-[#5A1724] border border-[#EADBCA] text-xs font-bold"
              >
                Restore 18 Menu Items
              </button>
            )}
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#5A1724] text-[#FFF8ED] text-xs font-bold"
            >
              Add New Product
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const imageSrc = product.imageBase64 || product.imageUrl;
            const categoryName = product.categoryName || categories.find((c) => c.id === product.categoryId)?.name || 'Menu Item';

            return (
              <div
                key={product.id}
                className="bg-[#FFFDF9] border border-[#EADBCA] rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-3">
                    {/* Image Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F3E7D5] border border-[#EADBCA] shrink-0 relative">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#93786F]">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      {!product.available && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] font-bold text-white uppercase text-center p-0.5">
                          Unavailable
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <div
                          className={`w-3.5 h-3.5 border ${
                            product.isVeg !== false ? 'border-emerald-600' : 'border-rose-600'
                          } p-0.5 rounded-xs flex items-center justify-center shrink-0`}
                          title={product.isVeg !== false ? 'Vegetarian' : 'Non-Vegetarian'}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.isVeg !== false ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </div>

                        <span className="text-[10px] text-[#735A53] font-semibold bg-[#F3E7D5] px-1.5 py-0.2 rounded">
                          {categoryName}
                        </span>

                        {product.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C99A3D]/20 text-[#8C6517] font-bold">
                            {product.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-[#241A18] truncate">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-[#735A53] line-clamp-2 mt-0.5">
                        {product.description || 'No description provided'}
                      </p>
                      <div className="mt-1 font-black font-royal text-[#5A1724] text-sm">
                        ₹{product.price}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Quick Controls */}
                <div className="mt-3 pt-3 border-t border-[#F0E4D3] flex items-center justify-between gap-2">
                  {/* Stock Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      product.available
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        product.available ? 'bg-emerald-500' : 'bg-stone-400'
                      }`}
                    />
                    <span>{product.available ? 'Available' : 'Unavailable'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-[#5A1724] hover:bg-[#F3E7D5] border border-[#EADBCA] transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Add/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <Modal
          isOpen={Boolean(productToDelete)}
          onClose={() => setProductToDelete(null)}
          title="Delete Menu Product"
          maxWidth="max-w-sm"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <p className="text-xs text-[#735A53]">
              Are you sure you want to delete <strong className="text-[#241A18]">{productToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteProduct}
                className="flex-1 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
