import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Category, Product } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Grid3X3, 
  AlertTriangle 
} from 'lucide-react';
import { CategoryModal } from '../components/admin/CategoryModal';
import { Modal } from '../components/common/Modal';

export const AdminCategoriesView: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Categories listener
    const unsubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = snapshot.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setCategories(cats);
      setLoading(false);
    });

    // Products listener to calculate item count per category and warn on delete
    const unsubProds = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setProducts(prods);
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      if (editingCategory) {
        const catRef = doc(db, 'categories', editingCategory.id);
        await updateDoc(catRef, {
          ...categoryData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'categories'), {
          ...categoryData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(
        error,
        editingCategory ? OperationType.UPDATE : OperationType.CREATE,
        'categories'
      );
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const catRef = doc(db, 'categories', category.id);
      await updateDoc(catRef, {
        active: !category.active,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${category.id}`);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteDoc(doc(db, 'categories', categoryToDelete.id));
      setCategoryToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${categoryToDelete.id}`);
    }
  };

  // Count products inside a category
  const getProductCount = (categoryId: string) => {
    return products.filter((p) => p.categoryId === categoryId).length;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C99A3D] uppercase tracking-widest block font-royal">
            Menu Navigation
          </span>
          <h1 className="text-2xl font-black text-[#5A1724] font-royal">
            Categories ({categories.length})
          </h1>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={16} className="text-[#C99A3D]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Category List */}
      <div className="bg-[#FFFDF9] border border-[#EADBCA] rounded-3xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-[#5A1724] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#735A53]">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Grid3X3 size={32} className="mx-auto text-[#93786F] mb-2" />
            <h3 className="text-sm font-bold text-[#5A1724] font-royal">No categories created yet</h3>
            <p className="text-xs text-[#735A53] mt-1">Create categories to organize your food and drinks.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#241A18]">
              <thead className="bg-[#FDF9F3] border-b border-[#F0E4D3] text-[11px] font-bold text-[#735A53] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-16">Order</th>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4">Active Dishes</th>
                  <th className="py-3.5 px-4">Customer Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E4D3]">
                {categories.map((category, idx) => {
                  const prodCount = getProductCount(category.id);
                  return (
                    <tr key={category.id} className="hover:bg-[#FFF8ED]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#93786F]">
                        #{category.sortOrder || idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon || '🍽️'}</span>
                          <span className="font-bold text-[#241A18] text-sm">{category.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-[#F3E7D5] text-[#5A1724] font-bold text-[11px]">
                          {prodCount} {prodCount === 1 ? 'dish' : 'dishes'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(category)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors ${
                            category.active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              category.active ? 'bg-emerald-500' : 'bg-stone-400'
                            }`}
                          />
                          <span>{category.active ? 'Visible on Menu' : 'Hidden'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#5A1724] hover:bg-[#F3E7D5] border border-[#EADBCA] transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setCategoryToDelete(category)}
                            className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        categoryToEdit={editingCategory}
        existingCount={categories.length}
      />

      {/* Delete Category Warning Modal */}
      {categoryToDelete && (
        <Modal
          isOpen={Boolean(categoryToDelete)}
          onClose={() => setCategoryToDelete(null)}
          title="Delete Menu Category"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#241A18]">
                Delete "{categoryToDelete.name}"?
              </h4>
              {getProductCount(categoryToDelete.id) > 0 ? (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs text-left">
                  <strong>⚠️ Warning:</strong> This category currently contains{' '}
                  <strong>{getProductCount(categoryToDelete.id)} dishes</strong>. If you delete this category, please re-assign these products to another active category so they remain accessible.
                </div>
              ) : (
                <p className="text-xs text-[#735A53] mt-1">
                  Are you sure you want to remove this category from the cafe menu?
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDeleteCategory}
                className="flex-1 py-2 rounded-xl bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
              >
                Yes, Delete Category
              </button>
              <button
                onClick={() => setCategoryToDelete(null)}
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
