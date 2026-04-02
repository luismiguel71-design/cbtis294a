'use client';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './client';

// Mock state for demo purposes
let mockUser: any = null;
let mockListeners: Array<(user: any) => void> = [];

const notifyMockListeners = () => {
  mockListeners.forEach(cb => cb(mockUser));
};

export const signInUser = async (email: string, password: string) => {
  // Special mock credentials
  if (email === 'admin@cbtis294.edu.mx' && password === 'cbtis294_2026_secure') {
    mockUser = {
      email,
      uid: 'mock-admin-id',
      displayName: 'Administrador CBTIS 294',
    };
    notifyMockListeners();
    return { user: mockUser };
  }

  if (!auth) {
    throw new Error("Firebase Auth is not configured.");
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => {
  if (mockUser) {
    mockUser = null;
    notifyMockListeners();
    return;
  }
  if (!auth) {
    return Promise.reject(new Error("Firebase Auth is not configured."));
  }
  return signOut(auth);
};

export const getCurrentUser = (callback: (user: User | null) => void) => {
  // Add to mock listeners
  mockListeners.push(callback);
  
  // Initial call with current mock state
  callback(mockUser);

  if (!auth) {
    return () => {
      mockListeners = mockListeners.filter(cb => cb !== callback);
    };
  }

  const unsubscribeFirebase = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      mockUser = firebaseUser;
      callback(firebaseUser);
    }
  });

  return () => {
    unsubscribeFirebase();
    mockListeners = mockListeners.filter(cb => cb !== callback);
  };
};
