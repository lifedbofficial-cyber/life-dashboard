import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase, ref, set, get, onValue, off } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDfB-Uf0pw41D4STF--ehyydKbzTu0k3o8",
  authDomain: "life-dashboard-312e8.firebaseapp.com",
  databaseURL: "https://life-dashboard-312e8-default-rtdb.firebaseio.com",
  projectId: "life-dashboard-312e8",
  storageBucket: "life-dashboard-312e8.firebasestorage.app",
  messagingSenderId: "941842730429",
  appId: "1:941842730429:web:6de52cf480b8a0417596d4",
  measurementId: "G-N2C6BK3HD2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Sign in with Google popup
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

// Sign out
export async function signOutUser() {
  await signOut(auth);
}

// Save user data to Firebase
export async function saveUserData(uid, key, data) {
  await set(ref(db, `users/${uid}/${key}`), data);
}

// Load all user data from Firebase
export async function loadUserData(uid) {
  const snapshot = await get(ref(db, `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

// Listen to user data changes in realtime
export function listenToUserData(uid, callback) {
  const userRef = ref(db, `users/${uid}`);
  onValue(userRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
  return () => off(userRef);
}