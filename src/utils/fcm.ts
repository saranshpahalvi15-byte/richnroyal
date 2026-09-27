import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { playOrderNotificationSound } from './sound';
import firebaseConfig from '../../firebase-applet-config.json';

// Public VAPID Key placeholder or fallback
export const VAPID_KEY = (firebaseConfig as any).vapidKey || '';

export interface NotificationPayload {
  title: string;
  body: string;
  orderId?: string;
  tableId?: string;
  type?: 'new_order' | 'status_change' | 'general';
  url?: string;
}

/**
 * Register Service Worker for FCM
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    return registration;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return null;
  }
}

/**
 * Request Notification Permission and register FCM token
 */
export async function requestFCMToken(
  role: 'admin' | 'customer',
  meta: { userId?: string; tableId?: string; orderId?: string } = {}
): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied by user.');
      return null;
    }

    const swReg = await registerServiceWorker();

    let fcmToken = '';
    const supported = await isSupported();
    if (supported) {
      try {
        const messaging = getMessaging();
        fcmToken = await getToken(messaging, {
          serviceWorkerRegistration: swReg || undefined,
          vapidKey: VAPID_KEY || undefined,
        });
      } catch (fcmErr) {
        console.warn('Standard FCM getToken error (falling back to device push ID):', fcmErr);
      }
    }

    // If no direct VAPID key is configured, create a unique stable client token identifier
    if (!fcmToken) {
      const stored = localStorage.getItem('rich_n_royal_device_token');
      if (stored) {
        fcmToken = stored;
      } else {
        fcmToken = `web_${role}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('rich_n_royal_device_token', fcmToken);
      }
    }

    // Save token record in Firestore
    const tokenDocId = fcmToken.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100);
    const tokenRef = doc(db, 'fcm_tokens', tokenDocId);

    await setDoc(tokenRef, {
      token: fcmToken,
      role,
      userId: meta.userId || null,
      tableId: meta.tableId || null,
      orderId: meta.orderId || null,
      permission: 'granted',
      userAgent: navigator.userAgent,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return fcmToken;
  } catch (error) {
    console.error('Error in requestFCMToken:', error);
    return null;
  }
}

/**
 * Trigger Real-time Web / System Push Notification on current device
 */
export function triggerLocalPushNotification(payload: NotificationPayload) {
  if (typeof window === 'undefined') return;

  // Play royal alert chime
  playOrderNotificationSound();

  // 1. If native Notification API is permitted, show desktop / OS notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'PUSH_NOTIFICATION',
          payload,
        });
      }

      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: '/favicon.ico',
        tag: payload.orderId || 'rich-n-royal',
        requireInteraction: payload.type === 'new_order',
      });

      notification.onclick = () => {
        window.focus();
        if (payload.url) {
          window.location.href = payload.url;
        }
        notification.close();
      };
    } catch (e) {
      console.warn('Native notification spawn fallback:', e);
    }
  }

  // 2. Dispatch custom in-app custom event for live toast banner
  window.dispatchEvent(
    new CustomEvent('rich_n_royal_push_event', { detail: payload })
  );
}
