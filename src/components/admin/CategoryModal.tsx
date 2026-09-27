import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { Modal } from '../common/Modal';
import { AlertCircle } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Partial<Category>) => Promise<void>;
  categoryToEdit?: Category | null;
  existingCount: number;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryToEdit,
  existingCount,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setIcon(categoryToEdit.icon || '');
      setSortOrder(categoryToEdit.sortOrder ?? 1);
      setActive(categoryToEdit.active !== false);
    } else {
      setName('');
      setIcon('🍽️');
      setSortOrder(existingCount + 1);
      setActive(true);
    }
    setFormError(null);
  }, [categoryToEdit, isOpen, existingCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      await onSave({
        name: name.trim(),
        icon: icon.trim() || '🍽️',
        sortOrder: Number(sortOrder) || 1,
        active,
      });
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const sampleIcons = ['🍕', '🍝', '🍔', '🥪', '🍜', '🥤', '🍟', '☕', '🍰', '🥗', '🍛', '🍨'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Edit Menu Category' : 'Add New Category'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
            Category Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Italian Pizza, Beverages, Combos"
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D] focus:ring-1 focus:ring-[#C99A3D]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
            Emoji / Icon
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g. 🍕"
              className="w-20 px-3.5 py-2 text-center text-lg bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
            />
            <span className="text-xs text-[#735A53]">Choose an icon below:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-2 bg-[#FFF8ED] border border-[#EADBCA] rounded-xl">
            {sampleIcons.map((ic) => (
              <button
                type="button"
                key={ic}
                onClick={() => setIcon(ic)}
                className="w-8 h-8 rounded-lg hover:bg-white text-base flex items-center justify-center transition-transform hover:scale-110"
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
            Display Sort Order
          </label>
          <input
            type="number"
            min={1}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D]"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-white border border-[#EADBCA] rounded-2xl">
          <div>
            <span className="text-xs font-bold text-[#241A18] block">Active Category</span>
            <span className="text-[11px] text-[#735A53]">Only active categories show on the customer QR menu</span>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
              active ? 'bg-emerald-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                active ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F0E4D3]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#735A53] hover:bg-[#F3E7D5]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : categoryToEdit ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
