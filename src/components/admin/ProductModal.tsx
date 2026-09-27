import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../types';
import { Modal } from '../common/Modal';
import { compressImageToBase64 } from '../../utils/imageCompressor';
import { Upload, X, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
  productToEdit?: Product | null;
  categories: Category[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState('');
  const [available, setAvailable] = useState(true);
  const [isVeg, setIsVeg] = useState(true);
  const [badge, setBadge] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageSizeKB, setImageSizeKB] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setDescription(productToEdit.description || '');
      setPrice(productToEdit.price || '');
      setCategoryId(productToEdit.categoryId || (categories[0]?.id || ''));
      setAvailable(productToEdit.available !== false);
      setIsVeg(productToEdit.isVeg !== false);
      setBadge(productToEdit.badge || '');
      setImageBase64(productToEdit.imageBase64 || '');
      setImageUrl(productToEdit.imageUrl || '');
      setImageSizeKB(0);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(categories[0]?.id || '');
      setAvailable(true);
      setIsVeg(true);
      setBadge('');
      setImageBase64('');
      setImageUrl('');
      setImageSizeKB(0);
    }
    setFormError(null);
  }, [productToEdit, isOpen, categories]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setFormError(null);

    try {
      const { base64, sizeKB } = await compressImageToBase64(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.75,
        maxFileSizeKB: 300,
      });

      setImageBase64(base64);
      setImageUrl(''); // Clear fallback URL when file uploaded
      setImageSizeKB(sizeKB);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (typeof price !== 'number' || price <= 0) {
      setFormError('Please enter a valid positive price.');
      return;
    }
    if (!categoryId) {
      setFormError('Please select a category.');
      return;
    }

    const selectedCategory = categories.find((c) => c.id === categoryId);

    setIsSaving(true);
    setFormError(null);

    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        categoryId,
        categoryName: selectedCategory?.name || '',
        imageBase64: imageBase64 || '',
        imageUrl: imageUrl || '',
        available,
        isVeg,
        badge: badge.trim(),
      });
      onClose();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPreview = imageBase64 || imageUrl;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Menu Product' : 'Add New Menu Product'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Product Name */}
        <div>
          <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Royal Farmhouse Pizza"
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D] focus:ring-1 focus:ring-[#C99A3D]"
          />
        </div>

        {/* Price & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
              Price (₹ INR) *
            </label>
            <input
              type="number"
              required
              min={1}
              step={1}
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 199"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D] focus:ring-1 focus:ring-[#C99A3D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D] focus:ring-1 focus:ring-[#C99A3D]"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key ingredients, taste profile, and preparation style..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D] focus:ring-1 focus:ring-[#C99A3D]"
          />
        </div>

        {/* Badges & Veg Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
              Food Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsVeg(true)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  isVeg
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-white border-[#EADBCA] text-[#735A53]'
                }`}
              >
                <div className="w-3 h-3 border border-emerald-600 p-0.5 rounded-xs flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                </div>
                <span>Veg</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVeg(false)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  !isVeg
                    ? 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'bg-white border-[#EADBCA] text-[#735A53]'
                }`}
              >
                <div className="w-3 h-3 border border-rose-600 p-0.5 rounded-xs flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                </div>
                <span>Non-Veg</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
              Highlight Badge (Optional)
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. Chef Special, Bestseller, Must Try"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#EADBCA] rounded-xl text-[#241A18] focus:outline-none focus:border-[#C99A3D] focus:ring-1 focus:ring-[#C99A3D]"
            />
          </div>
        </div>

        {/* Product Image Upload & Base64 Compression */}
        <div>
          <label className="block text-xs font-bold text-[#735A53] uppercase tracking-wider mb-1">
            Product Image (Auto Compressed & Stored in Firestore)
          </label>

          <div className="flex items-start gap-4 p-3.5 bg-[#FFF8ED] border border-[#EADBCA] rounded-2xl">
            {/* Image Preview */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-[#EADBCA] flex items-center justify-center shrink-0 relative">
              {currentPreview ? (
                <>
                  <img
                    src={currentPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageBase64('');
                      setImageUrl('');
                      setImageSizeKB(0);
                    }}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-rose-700"
                    title="Remove image"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <ImageIcon size={28} className="text-[#93786F]" />
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-2">
              <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                <Upload size={14} className="text-[#C99A3D]" />
                <span>{isCompressing ? 'Compressing...' : 'Upload Image File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={isCompressing}
                  className="hidden"
                />
              </label>

              {imageSizeKB > 0 && (
                <p className="text-[11px] text-emerald-700 font-semibold">
                  ✓ Optimized to {imageSizeKB} KB for fast loading
                </p>
              )}

              <p className="text-[11px] text-[#735A53]">
                Images are automatically resized and converted to lightweight WebP/JPEG Base64.
              </p>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between p-3 bg-white border border-[#EADBCA] rounded-2xl">
          <div>
            <span className="text-xs font-bold text-[#241A18] block">In Stock / Available for Orders</span>
            <span className="text-[11px] text-[#735A53]">If turned off, customers will see "Currently Unavailable"</span>
          </div>
          <button
            type="button"
            onClick={() => setAvailable(!available)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
              available ? 'bg-emerald-600' : 'bg-stone-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                available ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Submit Actions */}
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
            disabled={isSaving || isCompressing}
            className="px-6 py-2 rounded-xl bg-[#5A1724] hover:bg-[#46111B] text-[#FFF8ED] text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : productToEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
