import React, { useState, useEffect } from 'react';
import { Plus, Minus, Check, ImageOff, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { subscribeToProduct } from '../../services/productService';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product: initialProduct }) => {
  const [product, setProduct] = useState<Product>(initialProduct);
  const { cart, addToCart, updateQuantity } = useCart();

  // Keep state in sync with parent prop changes
  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  // Subscribe directly to Firestore document updates for this product
  useEffect(() => {
    if (!initialProduct?.id) return;

    const unsubscribe = subscribeToProduct(initialProduct.id, (updatedProduct) => {
      if (updatedProduct) {
        setProduct(updatedProduct);
      }
    });

    return () => unsubscribe();
  }, [initialProduct?.id]);

  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const imageSrc = product.imageBase64 || product.imageUrl;

  return (
    <div
      className={`group relative bg-[#FFFDF9] rounded-2xl border border-[#EADBCA] p-3.5 transition-all shadow-xs hover:shadow-md flex gap-3.5 ${
        !product.available ? 'opacity-70 grayscale-[30%]' : ''
      }`}
    >
      {/* Product Details Left Column */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Tags & Veg Indicator */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {/* Indian Standard Veg/Non-Veg symbol */}
            <div
              className={`w-4 h-4 border ${
                product.isVeg !== false
                  ? 'border-emerald-600'
                  : 'border-rose-600'
              } p-0.5 flex items-center justify-center rounded-xs shrink-0`}
              title={product.isVeg !== false ? 'Pure Vegetarian' : 'Non-Vegetarian'}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  product.isVeg !== false ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </div>

            {/* Badge */}
            {product.badge && (
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#C99A3D]/15 text-[#8C6517] border border-[#C99A3D]/30">
                {product.badge}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-[#241A18] text-base leading-snug group-hover:text-[#5A1724] transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-[#735A53] mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Status */}
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-sm font-semibold text-[#5A1724]">₹</span>
          <span className="text-lg font-black text-[#5A1724] font-royal tracking-tight">
            {product.price}
          </span>
        </div>
      </div>

      {/* Product Image & Add Control Right Column */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex flex-col items-center">
        {/* Image Container */}
        <div className="w-full h-full rounded-xl overflow-hidden bg-[#F3E7D5]/50 border border-[#EADBCA]/60 relative">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#93786F]">
              <ImageOff size={24} className="opacity-40" />
              <span className="text-[10px] mt-1 text-[#93786F]">No image</span>
            </div>
          )}

          {/* Unavailable Overlay */}
          {!product.available && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-1 text-center">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-rose-700/90 px-1.5 py-0.5 rounded">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Add Button or Stepper Positioned at Bottom of Image */}
        <div className="absolute -bottom-2 z-10">
          {product.available ? (
            quantity > 0 ? (
              <div className="flex items-center gap-2 bg-[#5A1724] text-[#FFF8ED] rounded-xl px-2 py-1 shadow-md border border-[#C99A3D]/40">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-[#46111B] text-[#FFF8ED] active:scale-90 transition-transform"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="text-xs font-black min-w-[16px] text-center text-[#C99A3D]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-[#46111B] text-[#FFF8ED] active:scale-90 transition-transform"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(product)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#FFFDF9] hover:bg-[#5A1724] text-[#5A1724] hover:text-[#FFF8ED] border-2 border-[#5A1724] font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                <Plus size={13} className="text-[#C99A3D]" />
                <span>ADD</span>
              </button>
            )
          ) : (
            <span className="text-[10px] font-semibold text-[#93786F] bg-[#F3E7D5] px-2 py-0.5 rounded-md border border-[#EADBCA]">
              Currently Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
