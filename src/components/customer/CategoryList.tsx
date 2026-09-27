import React from 'react';
import { Category } from '../../types';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  productCountMap: Record<string, number>;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  productCountMap,
}) => {
  const activeCategories = categories.filter((c) => c.active);

  return (
    <div className="sticky top-[61px] z-20 bg-[#FFF8ED]/95 backdrop-blur-md border-b border-[#EEDBCA] shadow-xs">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {/* All Items Button */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 flex items-center gap-1.5 border ${
              selectedCategory === 'all'
                ? 'bg-[#5A1724] text-[#FFF8ED] border-[#5A1724] shadow-sm scale-[1.02]'
                : 'bg-[#FFFDF9] text-[#735A53] border-[#EADBCA] hover:bg-[#F3E7D5] hover:text-[#5A1724]'
            }`}
          >
            <span>👑</span>
            <span>All Menu</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'all'
                  ? 'bg-[#C99A3D] text-[#241A18] font-bold'
                  : 'bg-[#F3E7D5] text-[#735A53]'
              }`}
            >
              {Object.values(productCountMap).reduce((a, b) => a + b, 0)}
            </span>
          </button>

          {/* Dynamic Categories */}
          {activeCategories.map((category) => {
            const count = productCountMap[category.id] || 0;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#5A1724] text-[#FFF8ED] border-[#5A1724] shadow-sm scale-[1.02]'
                    : 'bg-[#FFFDF9] text-[#735A53] border-[#EADBCA] hover:bg-[#F3E7D5] hover:text-[#5A1724]'
                }`}
              >
                {category.icon && <span className="text-sm">{category.icon}</span>}
                <span>{category.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-[#C99A3D] text-[#241A18] font-bold'
                        : 'bg-[#F3E7D5] text-[#735A53]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
