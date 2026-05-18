import admin from 'firebase-admin';
import { adminFirebaseConfig } from './config';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(adminFirebaseConfig.credential)
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
