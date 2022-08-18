import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signOut } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyBz9Zd5qRCWC_002Pp82Kgic78Kkjq5LSc',
  authDomain: 'photo-album-56c42.firebaseapp.com',
  projectId: 'photo-album-56c42',
  storageBucket: 'photo-album-56c42.appspot.com',
  messagingSenderId: '596879711552',
  appId: '1:596879711552:web:0a919b59fd436fc567aea5',
  measurementId: 'G-ST4DGRCQ0Y'
});

export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);
export const storage = getStorage(firebaseApp);

if (location.hostname === 'localhost' && location.port === '6000') {
  connectDatabaseEmulator(db, 'localhost', 6102);
  connectStorageEmulator(storage, 'localhost', 6104);
  connectAuthEmulator(auth, 'http://localhost:6101');
}

(window as any).signOut = () => signOut(auth);
