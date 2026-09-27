import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CartItem, Product, OrderItem, Order } from '../types';
import { triggerLocalPushNotification } from '../utils/fcm';

interface CartContextType {
  cart: CartItem[];
  tableId: string | null;
  tableName: string | null;
  customerNotes: string;
  itemCount: number;
  totalAmount: number;
  lastPlacedOrder: Order | null;
  isPlacingOrder: boolean;
  orderError: string | null;
  setTable: (tableId: string, tableName: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomerNotes: (notes: string) => void;
  clearCart: () => void;
  placeOrder: () => Promise<Order | null>;
  resetLastOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rich_n_royal_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tableId, setTableId] = useState<string | null>(() => {
    return localStorage.getItem('rich_n_royal_table_id') || null;
  });

  const [tableName, setTableName] = useState<string | null>(() => {
    return localStorage.getItem('rich_n_royal_table_name') || null;
  });

  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem('rich_n_royal_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('rich_n_royal_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    if (tableId) localStorage.setItem('rich_n_royal_table_id', tableId);
    if (tableName) localStorage.setItem('rich_n_royal_table_name', tableName);
  }, [tableId, tableName]);

  const setTable = (id: string, name: string) => {
    setTableId(id);
    setTableName(name);
  };

  const addToCart = (product: Product) => {
    if (!product.available) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomerNotes('');
    try {
      localStorage.removeItem('rich_n_royal_cart');
    } catch (e) {}
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const placeOrder = async (): Promise<Order | null> => {
    if (cart.length === 0) {
      setOrderError('Cart is empty.');
      return null;
    }

    if (!tableId || !tableName) {
      setOrderError('No table detected. Please scan a valid table QR code.');
      return null;
    }

    setIsPlacingOrder(true);
    setOrderError(null);

    const randomNum = Math.floor(100 + Math.random() * 900);
    const orderNumber = `#${randomNum}`;
    const deviceToken = typeof window !== 'undefined' ? localStorage.getItem('rich_n_royal_device_token') || '' : '';

    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
      notes: item.notes || '',
      isVeg: item.product.isVeg !== false,
    }));

    const calculatedTotal = orderItems.reduce((acc, curr) => acc + curr.subtotal, 0);

    const orderData: any = {
      orderNumber,
      tableId,
      tableName,
      items: orderItems,
      totalAmount: calculatedTotal,
      status: 'pending' as const,
      customerNotes: customerNotes.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (deviceToken) {
      orderData.customerFcmToken = deviceToken;
    }

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      const newOrder: Order = {
        id: docRef.id,
        orderNumber,
        tableId,
        tableName,
        items: orderItems,
        totalAmount: calculatedTotal,
        status: 'pending',
        customerNotes: customerNotes.trim(),
        createdAt: new Date().toISOString(),
      };

      setLastPlacedOrder(newOrder);
      try {
        localStorage.setItem('rich_n_royal_last_order', JSON.stringify(newOrder));
      } catch (e) {}

      // Broadcast push notification
      triggerLocalPushNotification({
        title: `Order ${orderNumber} Received!`,
        body: `Your food order for ${tableName} has been sent to the kitchen.`,
        orderId: docRef.id,
        type: 'new_order',
      });

      clearCart();
      return newOrder;
    } catch (error) {
      const errorMsg = 'Failed to send order to kitchen. Please try again or notify staff.';
      setOrderError(errorMsg);
      handleFirestoreError(error, OperationType.CREATE, 'orders');
      return null;
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const resetLastOrder = () => {
    setLastPlacedOrder(null);
    try {
      localStorage.removeItem('rich_n_royal_last_order');
    } catch (e) {}
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        tableId,
        tableName,
        customerNotes,
        itemCount,
        totalAmount,
        lastPlacedOrder,
        isPlacingOrder,
        orderError,
        setTable,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCustomerNotes,
        clearCart,
        placeOrder,
        resetLastOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
