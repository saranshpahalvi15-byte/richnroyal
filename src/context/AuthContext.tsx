import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { AdminUser } from '../types';
import { ensureDefaultDataSeeded } from '../utils/seedHelper';

// Pre-authorized primary admin emails
export const BOOTSTRAP_ADMIN_EMAILS = [
  'gridandgift@gmail.com',
];

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  adminData: AdminUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);

      if (!currentUser || !currentUser.email) {
        setIsAdmin(false);
        setAdminData(null);
        setLoading(false);
        return;
      }

      const userEmail = currentUser.email.toLowerCase();
      const isBootstrapAdmin = BOOTSTRAP_ADMIN_EMAILS.map(e => e.toLowerCase()).includes(userEmail);

      try {
        const adminDocRef = doc(db, 'admins', currentUser.uid);
        const adminSnap = await getDoc(adminDocRef);

        if (adminSnap.exists() && adminSnap.data()?.active) {
          setIsAdmin(true);
          setAdminData({
            id: currentUser.uid,
            email: currentUser.email,
            role: adminSnap.data()?.role || 'admin',
            active: true,
            createdAt: adminSnap.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          });
          ensureDefaultDataSeeded();
        } else if (isBootstrapAdmin) {
          // Provision or register bootstrap superadmin record
          const superAdminInfo: AdminUser = {
            id: currentUser.uid,
            email: currentUser.email,
            role: 'superadmin',
            active: true,
          };

          try {
            await setDoc(adminDocRef, {
              email: currentUser.email,
              role: 'superadmin',
              active: true,
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp()
            }, { merge: true });
          } catch (writeErr) {
            console.warn('Could not update admin doc:', writeErr);
          }

          setIsAdmin(true);
          setAdminData(superAdminInfo);
          ensureDefaultDataSeeded();
        } else {
          setIsAdmin(false);
          setAdminData(null);
        }
      } catch (err) {
        if (isBootstrapAdmin) {
          setIsAdmin(true);
          setAdminData({
            id: currentUser.uid,
            email: currentUser.email,
            role: 'superadmin',
            active: true,
          });
          ensureDefaultDataSeeded();
        } else {
          setIsAdmin(false);
          setAdminData(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      if (!email) {
        setAuthError('No email provided by Google.');
        return false;
      }
      return true;
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        return false;
      }
      setAuthError(err?.message || 'Failed to sign in with Google');
      return false;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setIsAdmin(false);
      setAdminData(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        adminData,
        loading,
        loginWithGoogle,
        logout,
        authError,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
