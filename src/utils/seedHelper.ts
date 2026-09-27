import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { 
  DEFAULT_CAFE_SETTINGS, 
  DEFAULT_CATEGORIES, 
  DEFAULT_PRODUCTS, 
  DEFAULT_TABLES 
} from '../data/defaultData';

let isSeedingInProgress = false;

/**
 * Ensures that categories, products, tables, and settings are present in Firestore.
 * This is executed ONLY by authenticated admins to respect security rules.
 */
export async function ensureDefaultDataSeeded(): Promise<boolean> {
  if (isSeedingInProgress) return false;

  // Only authenticated admins can write to settings, products, categories, tables
  if (!auth.currentUser) {
    return false;
  }

  try {
    isSeedingInProgress = true;

    // Check if products collection has documents
    const productsSnap = await getDocs(collection(db, 'products'));
    const categoriesSnap = await getDocs(collection(db, 'categories'));
    const tablesSnap = await getDocs(collection(db, 'tables'));

    let seededAny = false;

    // 1. Seed Cafe Settings if missing
    try {
      await setDoc(doc(db, 'settings', 'cafe'), {
        ...DEFAULT_CAFE_SETTINGS,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      // Ignore if already set
    }

    // 2. Seed Categories if empty
    if (categoriesSnap.empty) {
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), {
          ...cat,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      seededAny = true;
    }

    // 3. Seed Tables if empty
    if (tablesSnap.empty) {
      for (const tbl of DEFAULT_TABLES) {
        await setDoc(doc(db, 'tables', `T${tbl.tableNumber}`), {
          ...tbl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      seededAny = true;
    }

    // 4. Seed Products if empty
    if (productsSnap.empty) {
      for (const prod of DEFAULT_PRODUCTS) {
        await addDoc(collection(db, 'products'), {
          ...prod,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      seededAny = true;
    }

    return seededAny;
  } catch (error) {
    // If not admin or permission denied, handle cleanly
    return false;
  } finally {
    isSeedingInProgress = false;
  }
}
