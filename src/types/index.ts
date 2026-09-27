export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Category {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  imageBase64?: string;
  imageUrl?: string;
  available: boolean;
  isVeg?: boolean;
  badge?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Table {
  id: string;
  tableNumber: string;
  tableName: string;
  active: boolean;
  qrToken?: string;
  capacity?: number;
  section?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
  isVeg?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  customerNotes?: string;
  createdAt: any; // Firestore timestamp or string
  updatedAt?: any;
}

export interface CafeSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  isOpen: boolean;
  currencySymbol: string;
  logoBase64?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  active: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}
