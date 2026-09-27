import { 
  collection, 
  doc, 
  onSnapshot, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category } from '../types';
import { DEFAULT_PRODUCTS, DEFAULT_CATEGORIES } from '../data/defaultData';

export interface ProductQueryOptions {
  categoryId?: string;
  onlyAvailable?: boolean;
  onlyVeg?: boolean;
  searchQuery?: string;
}

/**
 * Real-time subscription to products collection in Firestore with optional filters.
 * Ensures the Customer Menu and Admin Catalog always receive the latest state.
 */
export function subscribeToProducts(
  options: ProductQueryOptions = {},
  onData: (products: Product[]) => void,
  onError?: (error: any) => void
): () => void {
  const collectionRef = collection(db, 'products');

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
      if (!snapshot.empty) {
        let products: Product[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as any),
        }));

        // Category filter
        if (options.categoryId && options.categoryId !== 'all') {
          products = products.filter((p) => p.categoryId === options.categoryId);
        }

        // Availability filter
        if (options.onlyAvailable) {
          products = products.filter((p) => p.available !== false);
        }

        // Veg filter
        if (options.onlyVeg) {
          products = products.filter((p) => p.isVeg !== false);
        }

        // Search filter
        if (options.searchQuery?.trim()) {
          const q = options.searchQuery.toLowerCase().trim();
          products = products.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q) ||
              p.categoryName?.toLowerCase().includes(q)
          );
        }

        onData(products);
      } else {
        // Fallback to default in-memory products when Firestore is not yet populated
        let fallback = DEFAULT_PRODUCTS.map((p, i) => ({ id: `demo_${i + 1}`, ...p }));
        if (options.categoryId && options.categoryId !== 'all') {
          fallback = fallback.filter((p) => p.categoryId === options.categoryId);
        }
        if (options.onlyAvailable) {
          fallback = fallback.filter((p) => p.available !== false);
        }
        if (options.onlyVeg) {
          fallback = fallback.filter((p) => p.isVeg !== false);
        }
        onData(fallback);
      }
    },
    (error) => {
      // In case of any transient permission or offline state, use memory fallback
      let fallback = DEFAULT_PRODUCTS.map((p, i) => ({ id: `demo_${i + 1}`, ...p }));
      if (options.categoryId && options.categoryId !== 'all') {
        fallback = fallback.filter((p) => p.categoryId === options.categoryId);
      }
      onData(fallback);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Real-time subscription to a single product document by ID.
 * Used by ProductCard to instantly reflect stock, price, and information updates.
 */
export function subscribeToProduct(
  productId: string,
  onData: (product: Product | null) => void,
  onError?: (error: any) => void
): () => void {
  if (!productId || productId.startsWith('demo_')) {
    return () => {};
  }

  const docRef = doc(db, 'products', productId);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onData({ id: docSnap.id, ...(docSnap.data() as any) });
      } else {
        onData(null);
      }
    },
    (error) => {
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Real-time subscription to categories in Firestore.
 */
export function subscribeToCategories(
  onData: (categories: Category[]) => void,
  onError?: (error: any) => void
): () => void {
  const collectionRef = collection(db, 'categories');

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const categories: Category[] = snapshot.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        onData(categories);
      } else {
        onData(DEFAULT_CATEGORIES);
      }
    },
    (error) => {
      onData(DEFAULT_CATEGORIES);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * One-time fetch of latest products from Firestore.
 */
export async function getLatestProducts(options: ProductQueryOptions = {}): Promise<Product[]> {
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    if (snapshot.empty) {
      return DEFAULT_PRODUCTS.map((p, i) => ({ id: `demo_${i + 1}`, ...p }));
    }

    let products: Product[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as any),
    }));

    if (options.categoryId && options.categoryId !== 'all') {
      products = products.filter((p) => p.categoryId === options.categoryId);
    }

    if (options.onlyAvailable) {
      products = products.filter((p) => p.available !== false);
    }

    if (options.onlyVeg) {
      products = products.filter((p) => p.isVeg !== false);
    }

    return products;
  } catch (error) {
    return DEFAULT_PRODUCTS.map((p, i) => ({ id: `demo_${i + 1}`, ...p }));
  }
}

/**
 * Update stock availability status for a product.
 */
export async function updateProductAvailability(productId: string, available: boolean): Promise<void> {
  try {
    const prodRef = doc(db, 'products', productId);
    await updateDoc(prodRef, {
      available,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
  }
}

/**
 * Create or update product in Firestore.
 */
export async function saveProduct(productData: Partial<Product>, productId?: string): Promise<string> {
  try {
    if (productId) {
      const prodRef = doc(db, 'products', productId);
      await updateDoc(prodRef, {
        ...productData,
        updatedAt: serverTimestamp(),
      });
      return productId;
    } else {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    }
  } catch (error) {
    handleFirestoreError(
      error,
      productId ? OperationType.UPDATE : OperationType.CREATE,
      'products'
    );
    return '';
  }
}

/**
 * Delete product from Firestore.
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
}
