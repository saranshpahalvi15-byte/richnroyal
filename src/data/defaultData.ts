import { Category, Product, Table, CafeSettings } from '../types';

export const DEFAULT_CAFE_SETTINGS: CafeSettings = {
  name: "RICH 'N' ROYAL CAFE",
  tagline: "Royal Taste • Premium Ambience",
  address: "Huda Ground, near HP Petrol Pump, Sector 8, Ambala, Haryana 134003",
  phone: "+91 98765 43210",
  isOpen: true,
  currencySymbol: "₹",
};

export const DEFAULT_TABLES: Omit<Table, 'id'>[] = [
  { tableNumber: "01", tableName: "Table 01", active: true, capacity: 2, section: "Main Hall" },
  { tableNumber: "02", tableName: "Table 02", active: true, capacity: 4, section: "Main Hall" },
  { tableNumber: "03", tableName: "Table 03", active: true, capacity: 4, section: "Royal Lounge" },
  { tableNumber: "04", tableName: "Table 04", active: true, capacity: 6, section: "Royal Lounge" },
  { tableNumber: "05", tableName: "Table 05", active: true, capacity: 2, section: "Terrace Garden" },
  { tableNumber: "06", tableName: "Table 06", active: true, capacity: 4, section: "Terrace Garden" },
];

export const DEFAULT_CATEGORIES: { id: string; name: string; active: boolean; sortOrder: number; icon: string }[] = [
  { id: 'cat_pizza', name: 'Pizza', active: true, sortOrder: 1, icon: '🍕' },
  { id: 'cat_pasta', name: 'Pasta', active: true, sortOrder: 2, icon: '🍝' },
  { id: 'cat_burgers', name: 'Burgers', active: true, sortOrder: 3, icon: '🍔' },
  { id: 'cat_sandwiches', name: 'Sandwiches & Wraps', active: true, sortOrder: 4, icon: '🥪' },
  { id: 'cat_chinese', name: 'Chinese & Maggi', active: true, sortOrder: 5, icon: '🍜' },
  { id: 'cat_beverages', name: 'Shakes & Beverages', active: true, sortOrder: 6, icon: '🥤' },
  { id: 'cat_snacks', name: 'Snacks & Chaat', active: true, sortOrder: 7, icon: '🍟' },
];

export const DEFAULT_PRODUCTS: Omit<Product, 'id'>[] = [
  // Pizza
  {
    name: 'Classic Margherita Pizza',
    description: 'Crispy stone-baked crust topped with rich Italian herb tomato sauce, fresh mozzarella, and basil.',
    price: 199,
    categoryId: 'cat_pizza',
    categoryName: 'Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Popular'
  },
  {
    name: 'Royal Farmhouse Feast',
    description: 'Loaded with crunchy capsicum, sweet corn, button mushrooms, black olives, onions and golden cheese.',
    price: 289,
    categoryId: 'cat_pizza',
    categoryName: 'Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Chef Special'
  },
  {
    name: 'Spicy Peri Peri Paneer Pizza',
    description: 'Marinated fiery paneer cubes, red paprika, jalapenos, melted mozzarella on a spicy herb base.',
    price: 319,
    categoryId: 'cat_pizza',
    categoryName: 'Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Spicy'
  },

  // Pasta
  {
    name: 'Creamy Alfredo White Pasta',
    description: 'Penne tossed in silky parmesan cream sauce, seasoned with garlic, black pepper and sautéed veggies.',
    price: 229,
    categoryId: 'cat_pasta',
    categoryName: 'Pasta',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281290?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Bestseller'
  },
  {
    name: 'Spicy Red Sauce Arrabiata',
    description: 'Penne in zesty tangy tomato basil sauce with crushed red pepper flakes, garlic and olive oil.',
    price: 219,
    categoryId: 'cat_pasta',
    categoryName: 'Pasta',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
  },

  // Burgers
  {
    name: 'Crispy Maharaja Veg Burger',
    description: 'Double crispy spiced potato & herb patty with crisp lettuce, sliced tomato, cheese slice and royal mayo.',
    price: 149,
    categoryId: 'cat_burgers',
    categoryName: 'Burgers',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Bestseller'
  },
  {
    name: 'Cheese Lava Crunch Burger',
    description: 'Stuffed molten cheese burst patty, caramelized onions, house pickled gherkins and secret sauce.',
    price: 189,
    categoryId: 'cat_burgers',
    categoryName: 'Burgers',
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Must Try'
  },

  // Sandwiches & Wraps
  {
    name: 'Grilled Bombay Club Sandwich',
    description: 'Triple-layered toasted brown/white bread loaded with seasoned potatoes, veggies, mint chutney & cheese.',
    price: 169,
    categoryId: 'cat_sandwiches',
    categoryName: 'Sandwiches & Wraps',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
  },
  {
    name: 'Tandoori Paneer Tikka Wrap',
    description: 'Smoky spiced grilled paneer wrapped in warm tortilla with fresh onions, capsicum, and mint yoghurt.',
    price: 179,
    categoryId: 'cat_sandwiches',
    categoryName: 'Sandwiches & Wraps',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Royal Favorite'
  },

  // Chinese & Maggi
  {
    name: 'Rich Masala Maggi Special',
    description: 'Desi style double Maggi cooked with butter, sautéed green peas, sweet corn, carrots and secret spices.',
    price: 89,
    categoryId: 'cat_chinese',
    categoryName: 'Chinese & Maggi',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
  },
  {
    name: 'Cheese Butter Blast Maggi',
    description: 'Classic hot spiced noodles drenched with melting amul butter and topped with shredded mozzarella.',
    price: 119,
    categoryId: 'cat_chinese',
    categoryName: 'Chinese & Maggi',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Popular'
  },
  {
    name: 'Veg Hakka Noodles',
    description: 'Wok-tossed long wheat noodles with crunchy julienne bell peppers, shredded cabbage, scallions and soy.',
    price: 189,
    categoryId: 'cat_chinese',
    categoryName: 'Chinese & Maggi',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
  },
  {
    name: 'Chilli Paneer (Dry / Gravy)',
    description: 'Crispy cottage cheese cubes tossed with garlic, ginger, fresh green chillies and spring onions in soy chilli glaze.',
    price: 239,
    categoryId: 'cat_chinese',
    categoryName: 'Chinese & Maggi',
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
  },

  // Shakes & Beverages
  {
    name: 'Belgian Chocolate Royal Shake',
    description: 'Decadent dark chocolate blend with chocolate fudge ice cream, whipped cream, and chocolate curls.',
    price: 179,
    categoryId: 'cat_beverages',
    categoryName: 'Shakes & Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Must Try'
  },
  {
    name: 'Royal Cold Coffee with Ice Cream',
    description: 'Signature espresso blended with chilled milk and topped with rich vanilla ice cream scoop & cocoa.',
    price: 159,
    categoryId: 'cat_beverages',
    categoryName: 'Shakes & Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Bestseller'
  },
  {
    name: 'Fresh Mint Mojito',
    description: 'Crushed fresh mint leaves, lemon chunks, sugar cane syrup, and sparkling soda with ice.',
    price: 129,
    categoryId: 'cat_beverages',
    categoryName: 'Shakes & Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
  },

  // Snacks & Chaat
  {
    name: 'Crispy Peri Peri French Fries',
    description: 'Golden fried potato batons tossed in house special spicy peri peri spice mix with creamy dip.',
    price: 129,
    categoryId: 'cat_snacks',
    categoryName: 'Snacks & Chaat',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
  },
  {
    name: 'Loaded Cheese & Salsa Nachos',
    description: 'Crispy corn tortilla chips piled high with warm melted cheddar sauce, zesty tomato salsa, jalapenos.',
    price: 179,
    categoryId: 'cat_snacks',
    categoryName: 'Snacks & Chaat',
    imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
    available: true,
    isVeg: true,
    badge: 'Chef Special'
  }
];
