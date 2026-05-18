import admin from 'firebase-admin';
import { adminFirebaseConfig } from './config';

if (!admin.apps.length) {
  try {
    if (adminFirebaseConfig.credential.privateKey && adminFirebaseConfig.credential.clientEmail) {
      admin.initializeApp({
        credential: admin.credential.cert(adminFirebaseConfig.credential)
      });
    } else {
      console.warn('Firebase Admin credentials missing, falling back to mock mode if applicable');
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null as any;
export const adminAuth = admin.apps.length ? admin.auth() : null as any;
