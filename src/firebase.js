// firebase.js - Shared Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3B8BkXmFmM-b9CQKkQZ_M40bj58BDx5A",
  authDomain: "ttm1-8ff6b.firebaseapp.com",
  projectId: "ttm1-8ff6b",
  storageBucket: "ttm1-8ff6b.firebasestorage.app",
  messagingSenderId: "962295822873",
  appId: "1:962295822873:web:64c6e684bd455febc508c8"
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google OAuth Configuration (exported for use in components)
export const GOOGLE_CLIENT_ID = '1002783323490-e8q8obn4nj2i3t20cbep45cnrvclvkc3.apps.googleusercontent.com';
export const GEMINI_API_KEY = 'AIzaSyCPsxNy1CkH-f9SMvp3mYhjN_YbDEmyL7s';

export const GOOGLE_SCOPES = {
  gmail: 'https://www.googleapis.com/auth/gmail.readonly',
  drive: 'https://www.googleapis.com/auth/drive.file',
  calendar: 'https://www.googleapis.com/auth/calendar'
};
